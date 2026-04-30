import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";

// POST /api/course/:id/checkout
export const checkout = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({ message: "Course not found" });

  if (user.subscription.includes(course._id.toString()))
    return res.status(400).json({ message: "You are already enrolled in this course" });

  user.subscription.push(course._id);
  await user.save();

  res.status(200).json({ message: "Payment successful. You are now enrolled." });
});

// POST /api/course/:id/capture
export const capturePayment = TryCatch(async (req, res) => {
  res.status(200).json({ message: "No capture needed in simulation mode" });
});
