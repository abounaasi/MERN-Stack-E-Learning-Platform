import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";

// POST /api/course/:id/enroll
export const enrollInCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const user = await User.findById(req.user._id);

  const courseId = course._id.toString();
  const alreadyEnrolled = user.subscription.some(
    (id) => id.toString() === courseId
  );

  if (alreadyEnrolled) {
    return res
      .status(409)
      .json({ message: "You are already enrolled in this course" });
  }

  user.subscription.push(course._id);
  await user.save();

  res.status(200).json({
    message: "Successfully enrolled in the course",
    courseId,
  });
});
