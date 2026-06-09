import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaThumbsUp } from "react-icons/fa";
import { server } from "../../main";
import StarRating from "./StarRating";
import "./reviews.css";

const headers = () => ({
  headers: { token: localStorage.getItem("token") },
});

const Reviews = ({ courseId, isEnrolled, userId, onReviewChange }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function fetchReviews(sortBy = sort) {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${server}/api/course/${courseId}/reviews?sort=${sortBy}`,
        headers(),
      );
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setReviewCount(data.reviewCount);
      setUserReview(data.userReview);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (courseId) fetchReviews();
  }, [courseId]);

  const changeSort = (sortBy) => {
    setSort(sortBy);
    fetchReviews(sortBy);
  };

  const startEdit = () => {
    setEditing(true);
    setRating(userReview.rating);
    setText(userReview.text);
  };

  const cancelEdit = () => {
    setEditing(false);
    setRating(5);
    setText("");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Please write a review");
      return;
    }

    setSubmitting(true);
    try {
      if (editing && userReview) {
        const { data } = await axios.put(
          `${server}/api/course/${courseId}/reviews/${userReview._id}`,
          { rating, text: text.trim() },
          headers(),
        );
        toast.success(data.message);
        setEditing(false);
      } else {
        const { data } = await axios.post(
          `${server}/api/course/${courseId}/reviews`,
          { rating, text: text.trim() },
          headers(),
        );
        toast.success(data.message);
        setText("");
        setRating(5);
      }
      await fetchReviews();
      onReviewChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save review");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async () => {
    if (!confirm("Delete your review?")) return;

    try {
      await axios.delete(
        `${server}/api/course/${courseId}/reviews/${userReview._id}`,
        headers(),
      );
      toast.success("Review deleted");
      setEditing(false);
      setUserReview(null);
      await fetchReviews();
      onReviewChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete review");
    }
  };

  const markHelpful = async (reviewId) => {
    try {
      await axios.post(
        `${server}/api/reviews/${reviewId}/helpful`,
        {},
        headers(),
      );
      await fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not mark helpful");
    }
  };

  const showForm = isEnrolled && (!userReview || editing);

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h3>Student Reviews</h3>
        <div className="reviews-summary">
          <StarRating value={Math.round(averageRating)} readonly size={18} />
          <span className="reviews-avg">
            {averageRating > 0 ? averageRating.toFixed(1) : "—"}
          </span>
          <span className="reviews-count">
            ({reviewCount} review{reviewCount === 1 ? "" : "s"})
          </span>
        </div>
      </div>

      {isEnrolled && !userReview && !editing && (
        <p className="reviews-hint">Share your experience with this course.</p>
      )}

      {showForm && (
        <form className="review-form" onSubmit={submitReview}>
          <label className="review-form-label">Your rating</label>
          <StarRating value={rating} onChange={setRating} size={22} />
          <textarea
            placeholder="Write your review…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            maxLength={2000}
          />
          <div className="review-form-actions">
            <button
              type="submit"
              className="common-btn"
              disabled={submitting}
            >
              {submitting
                ? "Saving…"
                : editing
                  ? "Update Review"
                  : "Post Review"}
            </button>
            {editing && (
              <button
                type="button"
                className="review-cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {isEnrolled && userReview && !editing && (
        <div className="your-review-banner">
          <span>You reviewed this course</span>
          <div className="your-review-actions">
            <button type="button" onClick={startEdit}>
              Edit
            </button>
            <button type="button" className="danger" onClick={deleteReview}>
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="reviews-sort">
        <span>Sort by:</span>
        <button
          type="button"
          className={sort === "newest" ? "active" : ""}
          onClick={() => changeSort("newest")}
        >
          Newest
        </button>
        <button
          type="button"
          className={sort === "helpful" ? "active" : ""}
          onClick={() => changeSort("helpful")}
        >
          Most Helpful
        </button>
      </div>

      {loading ? (
        <p className="reviews-empty">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="reviews-empty">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => {
            const isOwn =
              review.user._id?.toString() === userId?.toString();
            const markedHelpful = review.helpfulBy?.some(
              (id) => id.toString() === userId?.toString(),
            );

            return (
              <div
                key={review._id}
                className={`review-card${isOwn ? " own" : ""}`}
              >
                <div className="review-card-header">
                  <span className="review-author">
                    {review.user.name}
                    {isOwn && " (You)"}
                  </span>
                  <StarRating value={review.rating} readonly size={14} />
                </div>
                <p className="review-text">{review.text}</p>
                <div className="review-card-footer">
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  {!isOwn && (
                    <button
                      type="button"
                      className={`helpful-btn${markedHelpful ? " marked" : ""}`}
                      onClick={() => markHelpful(review._id)}
                      disabled={markedHelpful}
                    >
                      <FaThumbsUp />
                      Helpful ({review.helpfulCount || 0})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reviews;
