import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import axios from "axios";
import { server } from "../../main";
import { FaFire, FaTrophy, FaAward } from "react-icons/fa";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { mycourse } = CourseData();
  const [streak, setStreak] = useState({ currentStreak: 0, bestStreak: 0 });
  const [certificates, setCertificates] = useState([]);

  async function fetchStreak() {
    try {
      const { data } = await axios.get(`${server}/api/user/streak`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setStreak(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchCertificates() {
    try {
      const { data } = await axios.get(`${server}/api/certificates/my`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setCertificates(data.certificates);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchStreak();
    fetchCertificates();
  }, []);

  return (
    <section className="student-dashboard">
      <div className="dashboard-header">
        <h2>My Learning</h2>
        <p>All the courses you're currently enrolled in.</p>
      </div>

      <div className="streak-row">
        <div className="streak-card">
          <div className="streak-icon">
            <FaFire />
          </div>
          <div className="streak-info">
            <span className="streak-value">{streak.currentStreak || 0}</span>
            <span className="streak-label">
              Day{streak.currentStreak === 1 ? "" : "s"} Streak
            </span>
          </div>
        </div>

        <div className="streak-card best">
          <div className="streak-icon">
            <FaTrophy />
          </div>
          <div className="streak-info">
            <span className="streak-value">{streak.bestStreak || 0}</span>
            <span className="streak-label">Best Streak Ever</span>
          </div>
        </div>
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

      {certificates && certificates.length > 0 && (
        <div className="certificates-section">
          <h3>My Certificates</h3>
          <div className="certificates-list">
            {certificates.map((cert) => (
              <Link
                key={cert.certificateId}
                to={`/certificate/${cert.certificateId}`}
                className="certificate-item"
              >
                <div className="certificate-item-icon">
                  <FaAward />
                </div>
                <div className="certificate-item-info">
                  <span className="certificate-item-course">
                    {cert.courseName}
                  </span>
                  <span className="certificate-item-view">
                    View certificate →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
