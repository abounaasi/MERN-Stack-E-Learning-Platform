import React from "react";
import "./common.css";
import { Link } from "react-router-dom";
import { AiFillHome, AiOutlineLogout } from "react-icons/ai";
import { FaBook, FaUserAlt } from "react-icons/fa";
import { UserData } from "../../context/UserContext";

const Sidebar = () => {
  const { user } = UserData();

  const dashboardLink =
    user && user.role === "instructor"
      ? "/instructor/dashboard"
      : "/admin/dashboard";

  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link to={dashboardLink}>
            <div className="icon">
              <AiFillHome />
            </div>
            <span>Home</span>
          </Link>
        </li>

        {user && user.role === "instructor" && (
          <li>
            <Link to={"/instructor/courses"}>
              <div className="icon">
                <FaBook />
              </div>
              <span>Courses</span>
            </Link>
          </li>
        )}

        {user && user.role === "admin" && (
          <li>
            <Link to={"/admin/users"}>
              <div className="icon">
                <FaUserAlt />
              </div>
              <span>Users</span>
            </Link>
          </li>
        )}

        <li>
          <Link to={"/account"}>
            <div className="icon">
              <AiOutlineLogout />
            </div>
            <span>Logout</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
