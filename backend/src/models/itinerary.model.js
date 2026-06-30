import mongoose from 'mongoose';


const itinerarySchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    generatedBy: { type: String, enum: ['ai', 'manual'], default: 'ai' },
    promptInputs: {
      destination: String,
      days: Number,
      budget: Number,
      interests: [String],
    },

    days: [
      {
        dayNumber: Number,
        summary: String,
        stops: [
          {
            name: String,
            estimatedTime: String,
            estimatedCost: Number,
            notes: String,
            // links a suggested stop to an actual provider in our marketplace, if matched
            suggestedProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
          },
        ],
      },
    ],

    rawModelResponse: { type: String, select: false }, // kept for debugging, not returned by default
  },
  { timestamps: true }
);

export default mongoose.model('Itinerary', itinerarySchema);