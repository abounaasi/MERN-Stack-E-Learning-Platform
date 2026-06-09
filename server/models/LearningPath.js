import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  type: {
    type: String,
    enum: ["internal", "external"],
    default: "internal",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
  },
  reason: { type: String, required: true },
  externalTitle: String,
  externalUrl: String,
  externalType: {
    type: String,
    enum: ["youtube", "udemy", "documentation", "other"],
  },
  externalProvider: String,
  completed: { type: Boolean, default: false },
});

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goal: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    steps: [stepSchema],
  },
  { timestamps: true },
);

export const LearningPath = mongoose.model("LearningPath", schema);
