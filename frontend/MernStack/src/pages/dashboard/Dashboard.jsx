import React from "react";
import "./dashboard.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";

const Dashboard = () => {
  const { mycourse } = CourseData();

  return (
    <section className="student-dashboard">
      <div className="dashboard-header">
        <h2>My Learning</h2>
        <p>All the courses you're currently enrolled in.</p>
      </div>

      <div className="dashboard-content">
        {mycourse && mycourse.length > 0 ? (
          mycourse.map((c) => <CourseCard key={c._id} course={c} />)
        ) : (
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
