import React, { useEffect, useState } from "react";
import "./studygroups.css";
import axios from "axios";
import { server } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import toast from "react-hot-toast";
import { FaUsers } from "react-icons/fa";

const StudyGroups = () => {
  const { mycourse } = CourseData();
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const navigate = useNavigate();

  async function fetchGroups() {
    try {
      const { data } = await axios.get(`${server}/api/groups/my`, {
        headers: { token: localStorage.getItem("token") },
      });
      setGroups(data.groups);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  const createHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/groups`,
        { name, courseId },
        { headers: { token: localStorage.getItem("token") } },
      );
      toast.success(data.message);
      setName("");
      setCourseId("");
      navigate(`/group/${data.group._id}`);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="groups-page">
      <div className="groups-header">
        <h2>Study Groups</h2>
        <p>Create a private room for a course and learn together.</p>
      </div>

      <div className="groups-layout">
        <div className="groups-list">
          {groups && groups.length > 0 ? (
            groups.map((g) => (
              <Link key={g._id} to={`/group/${g._id}`} className="group-item">
                <div className="group-item-icon">
                  <FaUsers />
                </div>
                <div className="group-item-info">
                  <span className="group-item-name">{g.name}</span>
                  <span className="group-item-course">{g.course?.title}</span>
                  <span className="group-item-members">
                    {g.members.length} member{g.members.length === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="groups-empty">You're not in any study groups yet.</p>
          )}
        </div>

        <div className="group-create">
          <h3>Create a Group</h3>
          <form onSubmit={createHandler}>
            <label>Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">Select a course</option>
              {mycourse &&
                mycourse.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
            </select>

            <button className="common-btn" disabled={btnLoading}>
              {btnLoading ? "Please Wait..." : "Create Group"}
            </button>
          </form>

          {mycourse && mycourse.length === 0 && (
            <p className="group-hint">
              Enroll in a course first to create a group.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;
