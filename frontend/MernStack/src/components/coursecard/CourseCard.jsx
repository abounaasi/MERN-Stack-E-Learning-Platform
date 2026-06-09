import React, { useState } from "react";
import "./courseCard.css";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { CourseData } from "../../context/CourseContext";
import StarRating from "../reviews/StarRating";
import { FaHeart } from "react-icons/fa";

const CourseCard = ({ course, showStatus = false, onWishlistChange }) => {
  const navigate = useNavigate();
  const { user, isAuth, fetchUser } = UserData();
  const { fetchCourses } = CourseData();
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const courseId = course._id?.toString();

  const isEnrolled =
    course.isEnrolled ??
    user?.subscription?.some((id) => id.toString() === courseId);

  const isWishlisted = user?.wishlist?.some(
    (id) => id.toString() === courseId,
  );

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this course")) {
      try {
        const { data } = await axios.delete(`${server}/api/course/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        toast.success(data.message);
        fetchCourses();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuth) {
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (isWishlisted) {
        const { data } = await axios.delete(
          `${server}/api/wishlist/${courseId}`,
          { headers: { token } },
        );
        toast.success(data.message);
      } else {
        const { data } = await axios.post(
          `${server}/api/wishlist/${courseId}`,
          {},
          { headers: { token } },
        );
        toast.success(data.message);
      }
      await fetchUser();
      onWishlistChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="course-card">
      <div className="course-card-image-wrap">
        <img
          src={`${server}/${course.image}`}
          alt=""
          className="course-image"
        />
        {isAuth && user?.role === "user" && (
          <button
            type="button"
            className={`wishlist-btn${isWishlisted ? " active" : ""}`}
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          >
            <FaHeart />
          </button>
        )}
      </div>

      {showStatus && (
        <div className="course-status-row">
          {isEnrolled ? (
            <span className="course-status-badge enrolled">Enrolled</span>
          ) : (
            <span className="course-status-badge wishlisted">Saved</span>
          )}
        </div>
      )}

      <h3>{course.title}</h3>
      <div className="course-card-rating">
        {course.reviewCount > 0 ? (
          <>
            <StarRating
              value={Math.round(course.averageRating)}
              readonly
              size={14}
            />
            <span className="course-card-rating-text">
              {course.averageRating.toFixed(1)} ({course.reviewCount})
            </span>
          </>
        ) : (
          <span className="course-card-no-reviews">No reviews yet</span>
        )}
      </div>
      <p>Instructor: {course.createdBy}</p>
      <p>Duration: {course.duration} weeks</p>
      <p className="course-price">${course.price}</p>
      {isAuth ? (
        <>
          {user && user.role === "user" ? (
            <>
              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/course/study/${course._id}`)}
                  className="common-btn"
                >
                  Study
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="common-btn"
                >
                  Enroll Now
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate(`/course/study/${course._id}`)}
              className="common-btn"
            >
              Study
            </button>
          )}
        </>
      ) : (
        <button onClick={() => navigate("/login")} className="common-btn">
          Get Started
        </button>
      )}

      {user &&
        (user.role === "admin" ||
          (user.role === "instructor" && course.instructor === user._id)) && (
          <button
            onClick={() => deleteHandler(course._id)}
            className="common-btn"
            style={{ background: "red" }}
          >
            Delete
          </button>
        )}
    </div>
  );
};

export default CourseCard;
