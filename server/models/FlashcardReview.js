import mongoose from "mongoose";

// per-student spaced-repetition state for a single flashcard (SM-2)
const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flashcard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flashcard",
      required: true,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    interval: {
      type: Number,
      default: 0, // days until next review
    },
    dueDate: {
      type: Date,
      default: Date.now,
    },
    lastReviewed: Date,
  },
  { timestamps: true },
);

export const FlashcardReview = mongoose.model("FlashcardReview", schema);
