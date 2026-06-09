import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Progress } from "../models/Progress.js";
import { issueCertificateIfComplete } from "./certificate.js";
import { attachReviewStats } from "./review.js";

export const attachEnrollmentCounts = async (courses) => {
  if (!courses.length) return new Map();

  const courseIds = courses.map((c) => c._id);
  const counts = await User.aggregate([
    { $unwind: "$subscription" },
    { $match: { subscription: { $in: courseIds } } },
    { $group: { _id: "$subscription", enrollmentCount: { $sum: 1 } } },
  ]);

  return new Map(
    counts.map((c) => [c._id.toString(), c.enrollmentCount]),
  );
};

export const attachCourseMeta = async (courses) => {
  const withReviews = await attachReviewStats(courses);
  const enrollMap = await attachEnrollmentCounts(courses);

  return withReviews.map((c) => ({
    ...c,
    enrollmentCount: enrollMap.get(c._id.toString()) || 0,
  }));
};

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  const withMeta = await attachCourseMeta(courses);
  res.json({
    courses: withMeta,
  });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const [withStats] = await attachCourseMeta([course]);
  res.json({
    course: withStats,
  });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });

  const user = await User.findById(req.user._id);

  if (user.role == "admin") {
    return res.json({ lectures });
  }

  // the instructor who owns the course can view its lectures
  const course = await Courses.findById(req.params.id);
  if (course && course.instructor?.toString() === user._id.toString()) {
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

  // the instructor who owns the course can view its lectures
  const course = await Courses.findById(lecture.course);
  if (course && course.instructor?.toString() === user._id.toString()) {
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

// normalize a date to midnight so streaks compare whole days, not times
const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// update the student's daily learning streak (one grace day allowed)
const updateStreak = async (user) => {
  const today = startOfDay(new Date());

  if (!user.lastActivityDate) {
    // first ever learning day
    user.currentStreak = 1;
    user.graceUsed = false;
  } else {
    const last = startOfDay(user.lastActivityDate);
    const dayMs = 24 * 60 * 60 * 1000;
    const gap = Math.round((today - last) / dayMs);

    if (gap === 0) {
      // already counted today — nothing changes
      return;
    } else if (gap === 1) {
      // consecutive day → continue the streak, grace refreshes
      user.currentStreak += 1;
      user.graceUsed = false;
    } else if (gap === 2 && !user.graceUsed) {
      // missed exactly one day and grace is available → forgive it
      user.currentStreak += 1;
      user.graceUsed = true;
    } else {
      // missed too many days (or grace already spent) → reset
      user.currentStreak = 1;
      user.graceUsed = false;
    }
  }

  if (user.currentStreak > user.bestStreak) {
    user.bestStreak = user.currentStreak;
  }

  user.lastActivityDate = today;
  await user.save();
};

export const addProgress = TryCatch(async (req, res) => {
  const { course, lectureId } = req.query;

  // completing a lecture counts as learning activity for today
  await updateStreak(req.user);

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

    await issueCertificateIfComplete(req.user, course);

    return res.status(201).json({ message: "new Progress added" });
  }

  if (progress.completedLectures.includes(lectureId)) {
    return res.json({ message: "Progress recorded" });
  }

  progress.completedLectures.push(lectureId);
  await progress.save();

  await issueCertificateIfComplete(req.user, course);

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
