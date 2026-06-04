import React from "react";
import "./footer.css";
import { Link } from "react-router-dom";
import {
  AiFillFacebook,
  AiFillTwitterSquare,
  AiFillInstagram,
  AiFillLinkedin,
} from "react-icons/ai";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="#8a4baf" />
              <path
                d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"
                fill="#8a4baf"
                opacity="0.65"
              />
            </svg>
            EduLearn
          </Link>
          <p className="footer-tagline">
            Learn from expert instructors and grow at your own pace.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <AiFillFacebook />
            </a>
            <a href="#" aria-label="Twitter">
              <AiFillTwitterSquare />
            </a>
            <a href="#" aria-label="Instagram">
              <AiFillInstagram />
            </a>
            <a href="#" aria-label="LinkedIn">
              <AiFillLinkedin />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Learn</h4>
          <Link to="/courses">All Courses</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Log In</Link>
          <Link to="/register">Register</Link>
          <Link to="/account">My Profile</Link>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <a href="mailto:support@edulearn.com">Contact</a>
          <a href="#">Help Center</a>
          <a href="#">Privacy</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} EduLearn. All rights reserved.</p>
        <p className="footer-credit">
          Made with <span aria-hidden="true">♥</span> by{" "}
          <a href="#">Ahmad Abounaasi</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
