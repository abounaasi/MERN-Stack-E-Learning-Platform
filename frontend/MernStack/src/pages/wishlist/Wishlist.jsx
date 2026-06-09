import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { server } from "../../main";
import CourseCard from "../../components/coursecard/CourseCard";
import "./wishlist.css";

const Wishlist = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchWishlist() {
    setLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/wishlist`, {
        headers: { token: localStorage.getItem("token") },
      });
      setCourses(data.courses);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <section className="wishlist-page">
      <div className="wishlist-header">
        <div className="wishlist-header-icon">
          <FaHeart />
        </div>
        <h2>My Wishlist</h2>
        <p>Courses you've saved for later.</p>
      </div>

      {loading ? (
        <p className="wishlist-empty">Loading wishlist…</p>
      ) : courses.length > 0 ? (
        <div className="wishlist-grid">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              showStatus
              onWishlistChange={fetchWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="wishlist-empty">
          <p>Your wishlist is empty.</p>
          <Link to="/courses" className="common-btn">
            Browse Courses
          </Link>
        </div>
      )}
    </section>
  );
};

export default Wishlist;
