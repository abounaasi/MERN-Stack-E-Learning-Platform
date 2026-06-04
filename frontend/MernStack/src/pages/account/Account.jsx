import React from "react";
import { MdDashboard } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import "./account.css";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Account = ({ user }) => {
  const { setIsAuth, setUser } = UserData();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged out");
    navigate("/login");
  };

  if (!user) return null;

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <section className="account-page">
      <div className="profile-card">
        <div className="profile-avatar">{initial}</div>

        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-email">{user.email}</p>

        {user.role && user.role !== "user" && (
          <span className="profile-role">{user.role}</span>
        )}

        <div className="profile-actions">
          <button
            onClick={() => navigate(`/${user._id}/dashboard`)}
            className="common-btn"
          >
            <MdDashboard /> Dashboard
          </button>
          <button
            onClick={() => navigate(`/admin/dashboard`)}
            className="common-btn"
          >
            <MdDashboard />
            Admin Dashboard
          </button>

          <button onClick={logoutHandler} className="btn-logout">
            <IoMdLogOut /> Logout
          </button>
        </div>
      </div>
    </section>
  );
};

export default Account;
