import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Testimonials from "../../components/testimonials/Testimonials";
import {
  FaChalkboardTeacher,
  FaLaptopCode,
  FaInfinity,
} from "react-icons/fa";

const features = [
  {
    icon: <FaChalkboardTeacher />,
    title: "Expert Instructors",
    description:
      "Learn from industry professionals with years of real-world experience and a passion for teaching.",
  },
  {
    icon: <FaLaptopCode />,
    title: "Learn at Your Own Pace",
    description:
      "Study anytime, anywhere. Pause, rewind, and revisit lessons until every concept feels natural.",
  },
  {
    icon: <FaInfinity />,
    title: "Lifetime Access",
    description:
      "Once you enroll, the course is yours forever. Come back whenever you need a refresher.",
  },
];

const stats = [
  { value: "10K+", label: "Students" },
  { value: "200+", label: "Courses" },
  { value: "50+", label: "Instructors" },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">New courses added every week</span>
          <h1>
            Unlock your potential with{" "}
            <span className="hero-accent">expert-led</span> online courses
          </h1>
          <p className="hero-sub">
            Master new skills, advance your career, and learn at your own pace
            with our curated catalog of professional courses.
          </p>
          <div className="hero-actions">
            <button
              onClick={() => navigate("/courses")}
              className="common-btn"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/about")}
              className="btn-secondary"
            >
              Learn More
            </button>
          </div>
          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.label} className="hero-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-head">
          <h2>Why choose us</h2>
          <p>Everything you need to learn effectively, in one place.</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
    </>
  );
};

export default Home;
