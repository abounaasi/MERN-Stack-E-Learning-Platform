import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";

const unlinkAsync = promisify(fs.unlink);

// allowed to manage a course if you own it OR you are an admin (moderation)
const canManage = (course, user) =>
  user.role === "admin" || course.instructor?.toString() === user._id.toString();

export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, duration, price } = req.body;

  const image = req.file;

  await Courses.create({
    title,
    description,
    category,
    createdBy: req.user.name,
    instructor: req.user._id,
    image: image?.path,
    duration,
    price,
  });

  res.status(201).json({
    message: "Course Created Successfully",
  });
});

export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No Course with this id",
    });

  if (!canManage(course, req.user))
    return res.status(403).json({
      message: "You can only add lectures to your own courses",
    });

  const { title, description } = req.body;

  const file = req.file;

  const lecture = await Lecture.create({
    title,
    description,
    video: file?.path,
    course: course._id,
  });

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  if (!lecture) return res.status(404).json({ message: "Lecture not found" });

  const course = await Courses.findById(lecture.course);

  if (!canManage(course, req.user))
    return res.status(403).json({
      message: "You can only delete lectures from your own courses",
    });

  rm(lecture.video, () => {
    console.log("Video Deleted");
  });
  await lecture.deleteOne();
  res.json({ message: "Lecture Deleted" });
});

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course) return res.status(404).json({ message: "Course not found" });

  if (!canManage(course, req.user))
    return res.status(403).json({
      message: "You can only delete your own courses",
    });

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      await unlinkAsync(lecture.video);
      console.log("Video Deleted");
    }),
  );
  rm(course.image, () => {
    console.log("image Deleted");
  });

  await Lecture.find({ course: req.params.id }).deleteMany();

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});

export const getInstructorCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ instructor: req.user._id });

  res.json({ courses });
});

export const getInstructorStats = TryCatch(async (req, res) => {
  const courses = await Courses.find({ instructor: req.user._id });

  const courseIds = courses.map((course) => course._id);

  const totalCourses = courses.length;
  const totalLectures = await Lecture.countDocuments({
    course: { $in: courseIds },
  });

  const stats = {
    totalCourses,
    totalLectures,
  };

  res.json({ stats });
});
