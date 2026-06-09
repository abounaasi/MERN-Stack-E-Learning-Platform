import React from "react";
import { server } from "../../main";
import "./avatar.css";

const Avatar = ({ user, size = 36, className = "" }) => {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  const px = `${size}px`;
  const fontSize = `${Math.round(size * 0.42)}px`;

  if (user?.avatar) {
    return (
      <img
        src={`${server}/${user.avatar}`}
        alt={user?.name || "User"}
        className={`avatar avatar-img ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <span
      className={`avatar avatar-initials ${className}`}
      style={{ width: px, height: px, fontSize }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
};

export default Avatar;
