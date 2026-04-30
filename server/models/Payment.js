import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    captureId: {
      type: String,
    },
    status: {
      type: String,
      default: "CREATED",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", schema);
