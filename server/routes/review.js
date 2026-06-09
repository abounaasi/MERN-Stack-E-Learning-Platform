import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getCourseReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} from "../controllers/review.js";

const router = express.Router();

router.get("/course/:id/reviews", isAuth, getCourseReviews);
router.post("/course/:id/reviews", isAuth, createReview);
router.put("/course/:id/reviews/:reviewId", isAuth, updateReview);
router.delete("/course/:id/reviews/:reviewId", isAuth, deleteReview);
router.post("/reviews/:reviewId/helpful", isAuth, markReviewHelpful);

export default router;
