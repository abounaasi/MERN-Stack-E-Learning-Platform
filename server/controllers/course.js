import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Progress } from "../models/Progress.js";

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({
    courses,
  });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  res.json({
    course,
  });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });

  const user = await User.findById(req.user._id);

  if (user.role == "admin") {
    return res.json({ lectures });
  }

  if (!user.subscription.includes(req.params.id))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });
  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  const user = await User.findById(req.user._id);

  if (user.role == "admin") {
    return res.json({ lecture });
  }

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: req.user.subscription });

  res.json({
    courses,
  });
});

export const addProgress = TryCatch(async (req, res) => {
  const { course, lectureId } = req.query;

  let progress = await Progress.findOne({
    user: req.user._id,
    course,
  });

  // create a progress record on the first completed lecture
  if (!progress) {
    progress = await Progress.create({
      user: req.user._id,
      course,
      completedLectures: [lectureId],
    });

    return res.status(201).json({ message: "new Progress added" });
  }

  if (progress.completedLectures.includes(lectureId)) {
    return res.json({ message: "Progress recorded" });
  }

  progress.completedLectures.push(lectureId);
  await progress.save();

  res.status(201).json({ message: "new Progress added" });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const progress = await Progress.find({
    user: req.user._id,
    course: req.query.course,
  });

  const allLectures = (await Lecture.find({ course: req.query.course })).length;

  const completedLectures = progress[0]
    ? progress[0].completedLectures.length
    : 0;

  const courseProgressPercentage = allLectures
    ? (completedLectures * 100) / allLectures
    : 0;

  res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    progress,
  });
});
