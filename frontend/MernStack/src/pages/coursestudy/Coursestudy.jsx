import React, { useEffect } from "react";
import "./coursestudy.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";

const CourseStudy = ({ user }) => {
  const params = useParams();

  const { fetchCourse, course } = CourseData();
  const navigate = useNavigate();

  if (user && user.role === "user" && !user.subscription.includes(params.id))
    return navigate("/");

  useEffect(() => {
    fetchCourse(params.id);
  }, []);
  return (
    <>
      {course && (
        <div className="course-study-page">
          <div className="study-card">
            <div className="study-image">
              <img src={`${server}/${course.image}`} alt={course.title} />
            </div>

            <div className="study-info">
              {course.category && (
                <span className="study-badge">{course.category}</span>
              )}

              <h1 className="study-title">{course.title}</h1>
              <p className="study-description">{course.description}</p>

              <ul className="study-meta">
                <li>
                  <span className="meta-label">Instructor</span>
                  <span className="meta-value">{course.createdBy}</span>
                </li>
                <li>
                  <span className="meta-label">Duration</span>
                  <span className="meta-value">{course.duration} weeks</span>
                </li>
                <li>
                  <span className="meta-label">Price</span>
                  <span className="meta-value">
                    {course.price > 0 ? `$${course.price}` : "Free"}
                  </span>
                </li>
              </ul>

              <Link to={`/lectures/${course._id}`} className="study-btn">
                Start Learning →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseStudy;
