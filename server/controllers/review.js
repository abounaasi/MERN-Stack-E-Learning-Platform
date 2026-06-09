import mongoose from "mongoose";
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Review } from "../models/Review.js";

const isEnrolled = (user, courseId) =>
  user.subscription?.some((id) => id.toString() === courseId.toString());

export const getReviewStatsForCourses = async (courseIds) => {
  if (!courseIds.length) return new Map();

  const stats = await Review.aggregate([
    {
      $match: {
        course: {
          $in: courseIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      },
    },
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    stats.map((s) => [
      s._id.toString(),
      {
        averageRating: Math.round(s.averageRating * 10) / 10,
        reviewCount: s.reviewCount,
      },
    ]),
  );
};

export const attachReviewStats = async (courses) => {
  const ids = courses.map((c) => c._id);
  const statsMap = await getReviewStatsForCourses(ids);

  return courses.map((c) => {
    const obj = c.toObject ? c.toObject() : { ...c };
    const stats = statsMap.get(obj._id.toString()) || {
      averageRating: 0,
      reviewCount: 0,
    };
    return {
      ...obj,
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
    };
  });
};

export const getCourseReviews = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const sort = req.query.sort === "helpful" ? "helpful" : "newest";
  const sortOption =
    sort === "helpful"
      ? { helpfulCount: -1, createdAt: -1 }
      : { createdAt: -1 };

  const reviews = await Review.find({ course: course._id })
    .populate("user", "name avatar")
    .sort(sortOption);

  const stats = await Review.aggregate([
    { $match: { course: course._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  let userReview = null;
  if (req.user) {
    userReview = await Review.findOne({
      course: course._id,
      user: req.user._id,
    });
  }

  res.json({
    reviews,
    averageRating: stats[0]
      ? Math.round(stats[0].averageRating * 10) / 10
      : 0,
    reviewCount: stats[0]?.reviewCount || 0,
    userReview,
    sort,
  });
});

export const createReview = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  if (!isEnrolled(req.user, course._id)) {
    return res.status(403).json({
      message: "Only enrolled students can leave a review",
    });
  }

  const rating = Number(req.body.rating);
  const text = req.body.text?.trim();

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }
  if (!text) {
    return res.status(400).json({ message: "Review text is required" });
  }

  const existing = await Review.findOne({
    course: course._id,
    user: req.user._id,
  });
  if (existing) {
    return res.status(409).json({ message: "You already reviewed this course" });
  }

  const review = await Review.create({
    course: course._id,
    user: req.user._id,
    rating,
    text,
  });

  await review.populate("user", "name avatar");

  res.status(201).json({ message: "Review posted", review });
});

export const updateReview = TryCatch(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) return res.status(404).json({ message: "Review not found" });

  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only edit your own review" });
  }

  const rating = Number(req.body.rating);
  const text = req.body.text?.trim();

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }
  if (text !== undefined && !text) {
    return res.status(400).json({ message: "Review text is required" });
  }

  if (rating) review.rating = rating;
  if (text) review.text = text;
  await review.save();
  await review.populate("user", "name avatar");

  res.json({ message: "Review updated", review });
});

export const deleteReview = TryCatch(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) return res.status(404).json({ message: "Review not found" });

  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only delete your own review" });
  }

  await review.deleteOne();
  res.json({ message: "Review deleted" });
});

export const markReviewHelpful = TryCatch(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) return res.status(404).json({ message: "Review not found" });

  const userId = req.user._id.toString();
  if (review.helpfulBy.some((id) => id.toString() === userId)) {
    return res.status(409).json({ message: "You already marked this as helpful" });
  }

  review.helpfulBy.push(req.user._id);
  review.helpfulCount += 1;
  await review.save();

  res.json({ message: "Marked as helpful", helpfulCount: review.helpfulCount });
});
