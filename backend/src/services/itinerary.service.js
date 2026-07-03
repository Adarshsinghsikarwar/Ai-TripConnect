import itineraryRepo from "../repositories/itinerary.repository.js";
import providerRepo from "../repositories/provider.repository.js";
import ApiError from "../utils/apiError.js";
import { runToolLoop, AINotConfiguredError } from "../utils/mistralClient.js";
import logger from "../utils/logger.js";

const SYSTEM_PROMPT = `You are a travel itinerary planner. Given a destination, number of days,
budget, and interests, produce a structured day-by-day plan.

You have access to a "search_providers" tool that looks up REAL, verified local guides/drivers/
homestays in our marketplace. Use it whenever a day's plan would benefit from a real local
service — call it with the destination city BEFORE writing that day's stops, so you can
reference a real provider by id instead of inventing one.

Once you have what you need, respond with ONLY valid JSON, no markdown, no commentary,
matching this exact shape:
{
  "days": [
    { "dayNumber": 1, "summary": "short summary of the day",
      "stops": [ { "name": "place name", "estimatedTime": "2 hours", "estimatedCost": 500,
                   "notes": "tip", "suggestedProviderId": "<id or null>" } ] }
  ]
}`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_providers",
      description:
        "Search verified local service providers (guides, drivers, homestays) in our marketplace by city and optional service type.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "Destination city to search in",
          },
          serviceType: {
            type: "string",
            enum: [
              "guide",
              "driver",
              "homestay",
              "planner",
              "photographer",
              "other",
            ],
          },
        },
        required: ["city"],
      },
    },
  },
];

async function searchProvidersTool({ city, serviceType }) {
  const { results } = await providerRepo.search({
    city,
    serviceType,
    page: 1,
    limit: 5,
  });
  return results.map((p) => ({
    id: p._id,
    title: p.title,
    serviceType: p.serviceType,
    pricePerDay: p.pricePerDay,
    avgRating: p.avgRating,
  }));
}

class ItineraryService {
  async generate(
    userId,
    tripId,
    { destination, days, budget, interests = [] }
  ) {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Destination: ${destination}\nDays: ${days}\nBudget (total, INR): ${budget}\nInterests: ${
          interests.join(", ") || "general sightseeing"
        }`,
      },
    ];

    let finalText;
    try {
      finalText = await runToolLoop({
        messages,
        tools: TOOLS,
        toolImplementations: { search_providers: searchProvidersTool },
      });
    } catch (err) {
      if (err instanceof AINotConfiguredError) {
        throw new ApiError(
          503,
          "AI itinerary generation is not configured on this server"
        );
      }
      logger.error(`Itinerary generation failed: ${err.message}`);
      throw new ApiError(
        502,
        "AI itinerary service is temporarily unavailable"
      );
    }

    if (!finalText)
      throw new ApiError(502, "AI did not return a final itinerary in time");

    let parsed;
    try {
      parsed = JSON.parse(finalText.replace(/```json|```/g, "").trim());
    } catch {
      throw new ApiError(
        502,
        "AI returned an unparseable itinerary, please try again"
      );
    }

    for (const day of parsed.days || []) {
      for (const stop of day.stops || []) {
        if (stop.suggestedProviderId)
          stop.suggestedProvider = stop.suggestedProviderId;
      }
    }

    return itineraryRepo.create({
      trip: tripId,
      user: userId,
      promptInputs: { destination, days, budget, interests },
      days: parsed.days,
      rawModelResponse: finalText,
    });
  }

  getForTrip(tripId) {
    return itineraryRepo.findByTrip(tripId);
  }
}

export default new ItineraryService();
