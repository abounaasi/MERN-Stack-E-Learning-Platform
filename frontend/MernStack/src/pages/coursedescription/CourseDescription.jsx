import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/Loading";
import StarRating from "../../components/reviews/StarRating";
import Reviews from "../../components/reviews/Reviews";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [enrolling, setEnrolling] = useState(false);

  const { fetchUser } = UserData();
  const { fetchCourse, course, fetchMyCourse } = CourseData();

  useEffect(() => {
    fetchCourse(params.id);
  }, [params.id]);

  const isEnrolled =
    user?.subscription?.some((id) => id.toString() === course?._id?.toString());

  const enrollHandler = async () => {
    if (enrolling || isEnrolled) return;

    setEnrolling(true);
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        `${server}/api/course/${params.id}/enroll`,
        {},
        { headers: { token } }
      );

      toast.success(data.message);

      await Promise.all([fetchUser(), fetchMyCourse()]);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Enrollment failed. Please try again."
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (!course || !course._id) return <Loading />;

  return (
    <div className="course-description">
      <div className="course-description-inner">
        <div className="course-header">
          <img
            src={`${server}/${course.image}`}
            alt={course.title}
            className="course-image"
          />
          <div className="course-info">
            <h2>{course.title}</h2>
            <div className="course-rating-row">
              {course.reviewCount > 0 ? (
                <>
                  <StarRating
                    value={Math.round(course.averageRating)}
                    readonly
                    size={18}
                  />
                  <span className="course-rating-avg">
                    {course.averageRating.toFixed(1)}
                  </span>
                  <span className="course-rating-count">
                    ({course.reviewCount} review
                    {course.reviewCount === 1 ? "" : "s"})
                  </span>
                </>
              ) : (
                <span className="course-rating-empty">No reviews yet</span>
              )}
            </div>
            <p>
              <span className="course-meta-label">Instructor:</span>
              {course.createdBy}
            </p>
            <p>
              <span className="course-meta-label">Duration:</span>
              {course.duration} weeks
            </p>
            <p>
              <span className="course-meta-label">Category:</span>
              {course.category}
            </p>
          </div>
        </div>

        <p className="course-desc-text">{course.description}</p>

        <p className="course-price">${course.price}</p>

        {isEnrolled ? (
          <button
            onClick={() => navigate(`/course/study/${course._id}`)}
            className="common-btn"
          >
            Go to Course
          </button>
        ) : (
          <button
            onClick={enrollHandler}
            disabled={enrolling}
            className="common-btn"
          >
            {enrolling ? "Enrolling..." : "Enroll Now"}
          </button>
        )}

        <Reviews
          courseId={course._id}
          isEnrolled={isEnrolled}
          userId={user?._id}
          onReviewChange={() => fetchCourse(params.id)}
        />
      </div>
    </div>
  );
};

export default CourseDescription;
