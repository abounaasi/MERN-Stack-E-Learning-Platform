import React from "react";
import "./courses.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";

const Courses = () => {
  const { courses } = CourseData();

  return (
    <section className="courses">
      <div className="courses-header">
        <h2>Available Courses</h2>
        <p>Browse our catalog and start learning something new today.</p>
      </div>

      <div className="course-container">
        {courses && courses.length > 0 ? (
          courses.map((c) => <CourseCard key={c._id} course={c} />)
        ) : (
          <div className="empty-state">
            <p>No courses available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Courses;
