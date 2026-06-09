import React from "react";
import Avatar from "../../components/avatar/Avatar";
import "./dashboardWelcome.css";

const DashboardWelcome = ({ user, subtitle }) => (
  <div className="dash-welcome">
    <Avatar user={user} size={48} />
    <div className="dash-welcome-text">
      <h2>Welcome, {user?.name?.split(" ")[0] || "there"}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  </div>
);

export default DashboardWelcome;
