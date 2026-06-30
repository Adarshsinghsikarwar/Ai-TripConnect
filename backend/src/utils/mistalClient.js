import { mistral } from "../config/env.js";

class AINotConfiguredError extends Error {
  constructor() {
    super("AI features are not configured on this server");
    this.code = "AI_NOT_CONFIGURED";
  }
}

// One low-level call to Mistral's chat completions endpoint. Every AI feature
// in this app (itinerary, smart search, review summary, chat assistant) goes
// through this single function — one place to change models, timeouts, etc.
async function chatCompletion({
  messages,
  tools,
  responseFormat,
  maxTokens = 1000,
}) {
  if (!mistral.apiKey) throw new AINotConfiguredError();

  const body = { model: mistral.model, messages, max_tokens: maxTokens };
  if (tools) {
    body.tools = tools;
    body.tool_choice = "auto";
  }
  if (responseFormat) body.response_format = responseFormat;

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mistral.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mistral API returned ${response.status}: ${text}`);
  }
  return response.json();
}

// Generic tool-calling loop, reused by anything that needs the model to call
// our own functions (search_providers, search_reviews, etc.) before answering.
// `toolImplementations` maps tool name -> async function(args) -> result.
async function runToolLoop({
  messages,
  tools,
  toolImplementations,
  maxRounds = 3,
  maxTokens = 1500,
}) {
  for (let i = 0; i < maxRounds; i++) {
    const data = await chatCompletion({ messages, tools, maxTokens });
    const choice = data.choices[0].message;
    messages.push(choice);

    if (!choice.tool_calls?.length) {
      return choice.content; // model is done, this is the final answer
    }

    for (const toolCall of choice.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments || "{}");
      const impl = toolImplementations[toolCall.function.name];
      const result = impl
        ? await impl(args)
        : { error: "Unknown tool requested" };
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: JSON.stringify(result),
      });
    }
  }
  return null; // ran out of rounds without a final answer
}

export { chatCompletion, runToolLoop, AINotConfiguredError };
