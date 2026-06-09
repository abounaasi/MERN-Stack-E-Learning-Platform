import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaChartBar, FaExternalLinkAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { server } from "../../main";
import "./skillgap.css";

const headers = () => ({
  headers: { token: localStorage.getItem("token") },
});

const SkillGap = () => {
  const [skills, setSkills] = useState([]);
  const [selected, setSelected] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const { data } = await axios.get(
          `${server}/api/skill-gap/skills`,
          headers(),
        );
        setSkills(data.skills);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  const toggleSkill = (skill) => {
    setSelected((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill],
    );
  };

  const analyze = async () => {
    if (!selected.length) {
      toast.error("Select at least one skill you already know");
      return;
    }

    setAnalyzing(true);
    try {
      const { data } = await axios.post(
        `${server}/api/skill-gap/analyze`,
        { skills: selected },
        headers(),
      );
      setResults(data);
      toast.success("Skill gap analysis complete");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not analyze skills",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setResults(null);
    setSelected([]);
  };

  return (
    <section className="skill-gap-page">
      <div className="sg-header">
        <div className="sg-header-icon">
          <FaChartBar />
        </div>
        <h2>Skill Gap Analyzer</h2>
        <p>
          Select the skills you already know. We'll identify what's missing and
          recommend courses to fill the gaps.
        </p>
      </div>

      {!results ? (
        <>
          {loading ? (
            <p className="sg-empty">Loading skills…</p>
          ) : (
            <>
              <div className="sg-skills-grid">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className={`sg-skill-badge${
                      selected.includes(skill) ? " selected" : ""
                    }`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <p className="sg-hint">
                {selected.length === 0
                  ? "Tap the skills you're comfortable with"
                  : `${selected.length} skill${selected.length === 1 ? "" : "s"} selected`}
              </p>

              <button
                type="button"
                className="common-btn sg-analyze-btn"
                disabled={analyzing || !selected.length}
                onClick={analyze}
              >
                {analyzing ? "Analyzing…" : "Analyze My Skills"}
              </button>
            </>
          )}
        </>
      ) : (
        <div className="sg-results">
          <div className="sg-results-actions">
            <button type="button" className="sg-back-btn" onClick={reset}>
              ← Start over
            </button>
          </div>

          <div className="sg-section">
            <h3>Your Skills</h3>
            <div className="sg-skills-grid sg-skills-readonly">
              {results.knownSkills.map((skill) => (
                <span key={skill} className="sg-skill-badge selected">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {results.missingSkills?.length > 0 && (
            <div className="sg-section">
              <h3>Skills to Learn</h3>
              <div className="sg-gap-list">
                {results.missingSkills.map((skill) => (
                  <span key={skill} className="sg-gap-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="sg-section">
            <h3>Recommended Courses</h3>
            {results.recommendations.length === 0 ? (
              <p className="sg-empty">
                No gaps found — you're covering the main skills in our catalog!
              </p>
            ) : (
              <div className="sg-recommendations">
                {results.recommendations.map((rec, idx) => (
                  <div
                    key={`${rec.skill}-${idx}`}
                    className={`sg-rec-card sg-rec-${rec.type}`}
                  >
                    <div className="sg-rec-header">
                      <span className="sg-rec-skill">{rec.skill}</span>
                      <span
                        className={`sg-rec-badge sg-rec-badge-${rec.type}`}
                      >
                        {rec.type === "internal" ? "On Platform" : "External"}
                      </span>
                    </div>

                    <h4>
                      {rec.type === "internal"
                        ? rec.course.title
                        : rec.title}
                    </h4>

                    {rec.type === "external" && (
                      <span className="sg-rec-provider">{rec.provider}</span>
                    )}

                    <p className="sg-rec-reason">{rec.reason}</p>

                    {rec.type === "internal" ? (
                      <Link
                        to={
                          rec.enrolled
                            ? `/course/study/${rec.course._id}`
                            : `/course/${rec.course._id}`
                        }
                        className="sg-rec-link sg-rec-link-internal"
                      >
                        {rec.enrolled ? "Continue course →" : "View course →"}
                      </Link>
                    ) : (
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sg-rec-link sg-rec-link-external"
                      >
                        Open resource
                        <FaExternalLinkAlt />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SkillGap;
