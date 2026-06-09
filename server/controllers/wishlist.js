import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";
import { attachCourseMeta } from "./course.js";

export const getWishlist = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const courses = await Courses.find({ _id: { $in: user.wishlist || [] } });
  const withMeta = await attachCourseMeta(courses);

  const enrolled = new Set(
    (user.subscription || []).map((id) => id.toString()),
  );

  res.json({
    courses: withMeta.map((c) => ({
      ...c,
      isEnrolled: enrolled.has(c._id.toString()),
    })),
  });
});

export const addToWishlist = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const user = await User.findById(req.user._id);
  if (!user.wishlist) user.wishlist = [];

  const courseId = course._id.toString();
  if (user.wishlist.some((id) => id.toString() === courseId)) {
    return res.status(409).json({ message: "Course already in wishlist" });
  }

  user.wishlist.push(course._id);
  await user.save();

  res.status(201).json({
    message: "Course saved to wishlist",
    wishlist: user.wishlist,
  });
});

export const removeFromWishlist = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const courseId = req.params.courseId;

  const before = user.wishlist?.length || 0;
  user.wishlist = (user.wishlist || []).filter(
    (id) => id.toString() !== courseId,
  );

  if (user.wishlist.length === before) {
    return res.status(404).json({ message: "Course not in wishlist" });
  }

  await user.save();

  res.json({
    message: "Course removed from wishlist",
    wishlist: user.wishlist,
  });
});
