import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./header.css";
import { UserData } from "../../context/UserContext";

const Header = () => {
  const { isAuth, user } = UserData();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  const NavLinks = ({ onClick, className }) => (
    <>
      <NavLink to="/" end onClick={onClick} className={className}>
        Home
      </NavLink>
      <NavLink to="/courses" onClick={onClick} className={className}>
        Courses
      </NavLink>
      <NavLink to="/about" onClick={onClick} className={className}>
        About
      </NavLink>
      {isAuth && user?._id && (
        <NavLink
          to={`/${user._id}/dashboard`}
          onClick={onClick}
          className={className}
        >
          Dashboard
        </NavLink>
      )}
      {isAuth && (
        <NavLink to="/groups" onClick={onClick} className={className}>
          Groups
        </NavLink>
      )}
    </>
  );

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo" onClick={close}>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="#8a4baf" />
            <path
              d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"
              fill="#8a4baf"
              opacity="0.65"
            />
          </svg>
          EduLearn
        </Link>

        <nav className="nav">
          <NavLinks className="nav-link" />
        </nav>

        <div className="auth-buttons">
          {isAuth ? (
            <button
              className="account-pill"
              onClick={() => navigate("/account")}
              aria-label="Account"
            >
              <span className="account-avatar">{initial}</span>
              <span className="account-name">{user?.name || "Account"}</span>
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                Log In
              </Link>
              <Link to="/register" className="btn-signup">
                Get Started
              </Link>
            </>
          )}
        </div>

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

      <div className={`mobile-menu${menuOpen ? " visible" : ""}`}>
        <NavLinks onClick={close} className="mobile-link" />

        <div className="mobile-auth">
          {isAuth ? (
            <button
              className="account-pill mobile-account"
              onClick={() => {
                close();
                navigate("/account");
              }}
            >
              <span className="account-avatar">{initial}</span>
              <span className="account-name">
                {user?.name || "Account"}
              </span>
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-login" onClick={close}>
                Log In
              </Link>
              <Link to="/register" className="btn-signup" onClick={close}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
