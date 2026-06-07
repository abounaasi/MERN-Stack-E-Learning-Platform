import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";

export const getAllStats = TryCatch(async (req, res) => {
  const totalCourses = await Courses.countDocuments();
  const totalLectures = await Lecture.countDocuments();
  const totalUsers = await User.countDocuments();

  const stats = {
    totalCourses,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password",
  );

  res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  const allowedRoles = ["user", "instructor", "admin"];

  // explicit mode: admin sends the exact role to set
  if (req.body.role) {
    if (!allowedRoles.includes(req.body.role))
      return res.status(400).json({ message: "Invalid role" });

    user.role = req.body.role;
    await user.save();
    return res.status(200).json({ message: `Role updated to ${user.role}` });
  }

  // backward-compatible fallback: toggle between user and admin
  user.role = user.role === "user" ? "admin" : "user";
  await user.save();
  return res.status(200).json({ message: `Role updated to ${user.role}` });
});
