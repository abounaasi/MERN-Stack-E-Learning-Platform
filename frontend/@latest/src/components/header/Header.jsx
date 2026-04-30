import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="#8a4baf" />
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="#8a4baf" opacity="0.65" />
          </svg>
          EduLearn
        </Link>

        {/* Desktop Nav */}
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/about" className="nav-link">About</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="auth-buttons">
          <Link to="/account" className="btn-login">Log In</Link>
          <Link to="/signup" className="btn-signup">Get Started</Link>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className={`mobile-menu${menuOpen ? " visible" : ""}`}>
        <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/courses" className="mobile-link" onClick={() => setMenuOpen(false)}>Courses</Link>
        <Link to="/about" className="mobile-link" onClick={() => setMenuOpen(false)}>About</Link>
        <div className="mobile-auth">
          <Link to="/account" className="btn-login" onClick={() => setMenuOpen(false)}>Log In</Link>
          <Link to="/signup" className="btn-signup" onClick={() => setMenuOpen(false)}>Get Started</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
