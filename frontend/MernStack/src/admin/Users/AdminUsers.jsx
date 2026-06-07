import React, { useEffect, useState } from "react";
import "./users.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Layout from "../Utils/Layout";
import toast from "react-hot-toast";

const AdminUsers = ({ user }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  async function fetchUsers() {
    try {
      const { data } = await axios.get(`${server}/api/users`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setUsers(data.users);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [user]);

  const updateRole = async (id, role) => {
    if (confirm(`Are you sure you want to set this user's role to "${role}"?`)) {
      try {
        const { data } = await axios.put(
          `${server}/api/user/${id}`,
          { role },
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          },
        );

        toast.success(data.message);
        fetchUsers();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <Layout>
      <div className="users">
        <h1>All Users</h1>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Update Role</th>
            </tr>
          </thead>

          <tbody>
            {users &&
              users.map((e, i) => (
                <tr key={e._id}>
                  <td>{i + 1}</td>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td>
                    <span className={`role-badge role-${e.role}`}>
                      {e.role}
                    </span>
                  </td>
                  <td>
                    <select
                      className="role-select"
                      value={e.role}
                      onChange={(event) =>
                        updateRole(e._id, event.target.value)
                      }
                    >
                      <option value="user">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminUsers;
