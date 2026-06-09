import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../admin/Utils/Layout";
import axios from "axios";
import { server } from "../../main";
import DashboardWelcome from "../../components/dashboardWelcome/DashboardWelcome";
import "../../admin/Dashboard/dashboard.css";

const InstructorDashboard = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.role !== "instructor") return navigate("/");

  const [stats, setStats] = useState([]);

  async function fetchStats() {
    try {
      const { data } = await axios.get(`${server}/api/instructor/stats`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setStats(data.stats);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);
  return (
    <div>
      <Layout>
        <DashboardWelcome
          user={user}
          subtitle="Manage your courses and track performance."
        />
        <div className="main-content">
          <div className="box">
            <p>Total Courses</p>
            <p>{stats.totalCourses}</p>
          </div>
          <div className="box">
            <p>Total Lectures</p>
            <p>{stats.totalLectures}</p>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default InstructorDashboard;
