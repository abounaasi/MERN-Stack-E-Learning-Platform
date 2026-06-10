import React from "react";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaHeart, FaCode, FaUnlock } from "react-icons/fa";
import "./about.css";

const About = () => {
  return (
    <section className="about">
      <div className="about-hero">
        <div className="about-hero-icon">
          <FaGraduationCap />
        </div>
        <h1>About EduLearn</h1>
        <p className="about-tagline">
          Free learning for everyone — no exceptions.
        </p>
      </div>

      <div className="about-content">
        <div className="about-mission">
          <h2>Our Mission</h2>
          <p>
            EduLearn is a completely free platform with one clear goal in mind:
            to make all learning content completely free for everyone.
          </p>
          <p>
            This is not a commercial project. There are no subscriptions, no
            payments, and no hidden fees. The idea is purely to share knowledge
            and help anyone who wants to learn web development — especially MERN
            stack technologies — regardless of their financial situation or
            background.
          </p>
        </div>

        <div className="about-pillars">
          <div className="about-pillar">
            <FaUnlock />
            <h3>100% Free</h3>
            <p>
              Every course, lecture, and tool on this platform is free to use.
              No paywalls, ever.
            </p>
          </div>
          <div className="about-pillar">
            <FaCode />
            <h3>MERN Stack Focus</h3>
            <p>
              Practical content built around MongoDB, Express, React, and
              Node.js — the skills that matter.
            </p>
          </div>
          <div className="about-pillar">
            <FaHeart />
            <h3>Built to Share</h3>
            <p>
              Not a business — a contribution. Knowledge shared openly, for
              anyone who wants to learn.
            </p>
          </div>
        </div>

        <div className="about-belief">
          <h2>Why We Built This</h2>
          <p>
            We strongly believe that education should be accessible to everyone.
            If we can contribute even a small part to that, then it is worth it.
          </p>
          <p>
            Everything on this platform will remain free and open for everyone
            to use. If this helps you in any way, then that is the real success
            of this project.
          </p>
        </div>

        <div className="about-thanks">
          <p>Thank you for your support.</p>
          <Link to="/courses" className="common-btn">
            Start Learning — It's Free
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;
