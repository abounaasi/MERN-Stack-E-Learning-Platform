import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Flashcard = mongoose.model("Flashcard", schema);
