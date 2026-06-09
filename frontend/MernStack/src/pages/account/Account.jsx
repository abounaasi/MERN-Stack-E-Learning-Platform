import React, { useRef, useState } from "react";
import { MdDashboard, MdPhotoCamera } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import "./account.css";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Avatar from "../../components/avatar/Avatar";
import { cropImageToSquare } from "../../utils/cropImage";

const Account = ({ user }) => {
  const { setIsAuth, setUser } = UserData();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged out");
    navigate("/login");
  };

  const uploadImage = async (file) => {
    if (!file?.type?.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setUploading(true);
    try {
      const cropped = await cropImageToSquare(file);
      const formData = new FormData();
      formData.append("file", cropped);

      const { data } = await axios.post(
        `${server}/api/user/avatar`,
        formData,
        {
          headers: {
            token: localStorage.getItem("token"),
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUser(data.user);
      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not upload profile picture",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImage(file);
  };

  if (!user) return null;

  return (
    <section className="account-page">
      <div className="profile-card">
        <div
          className={`avatar-upload-zone${dragOver ? " drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          aria-label="Upload profile picture"
        >
          <div className="avatar-upload-preview">
            <Avatar user={user} size={120} />
            <span className="avatar-upload-overlay">
              <MdPhotoCamera />
              {uploading ? "Uploading…" : "Change photo"}
            </span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onFileChange}
            hidden
          />
        </div>
        <p className="avatar-upload-hint">
          Click or drag an image here. It will be cropped to a square.
        </p>

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

          {user.role === "admin" && (
            <button
              onClick={() => navigate(`/admin/dashboard`)}
              className="common-btn"
            >
              <MdDashboard />
              Admin Dashboard
            </button>
          )}

          {user.role === "instructor" && (
            <button
              onClick={() => navigate(`/instructor/dashboard`)}
              className="common-btn"
            >
              <MdDashboard />
              Instructor Dashboard
            </button>
          )}

          <button onClick={logoutHandler} className="btn-logout">
            <IoMdLogOut /> Logout
          </button>
        </div>
      </div>
    </section>
  );
};

export default Account;
