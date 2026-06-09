import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaCheck,
  FaExternalLinkAlt,
  FaLock,
  FaRoute,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { server } from "../../main";
import "./learningpath.css";

const headers = () => ({
  headers: { token: localStorage.getItem("token") },
});

const RESOURCE_LABELS = {
  youtube: "YouTube",
  udemy: "Udemy",
  documentation: "Documentation",
  other: "External",
};

const LearningPath = () => {
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paths, setPaths] = useState([]);
  const [activePath, setActivePath] = useState(null);

  async function fetchPaths() {
    setLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/learning-path`, headers());
      setPaths(data.paths);
      if (data.paths.length > 0 && !activePath) {
        await loadPath(data.paths[0]._id);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPath(id) {
    try {
      const { data } = await axios.get(
        `${server}/api/learning-path/${id}`,
        headers(),
      );
      setActivePath(data.path);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load path");
    }
  }

  useEffect(() => {
    fetchPaths();
  }, []);

  const generate = async (e) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error("Please enter a learning goal");
      return;
    }

    setGenerating(true);
    try {
      const { data } = await axios.post(
        `${server}/api/learning-path/generate`,
        { goal: goal.trim() },
        headers(),
      );
      toast.success("Your learning path is ready!");
      setGoal("");
      setActivePath(data.path);
      await fetchPaths();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not generate learning path",
      );
    } finally {
      setGenerating(false);
    }
  };

  const markExternalComplete = async (step) => {
    if (!activePath) return;
    try {
      const { data } = await axios.post(
        `${server}/api/learning-path/${activePath._id}/steps/${step.order}/complete`,
        {},
        headers(),
      );
      setActivePath(data.path);
      toast.success("Step marked as complete");
      await fetchPaths();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update step");
    }
  };

  const stepTitle = (step) =>
    step.type === "internal" ? step.course.title : step.external.title;

  return (
    <section className="learning-path-page">
      <div className="lp-header">
        <div className="lp-header-icon">
          <FaRoute />
        </div>
        <h2>AI Learning Path</h2>
        <p>
          Tell us your goal and we'll build a personalized roadmap using our
          courses — plus trusted external resources when we don't have a match.
        </p>
      </div>

      <form className="lp-goal-form" onSubmit={generate}>
        <input
          type="text"
          placeholder='e.g. "Become a React developer"'
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={generating}
        />
        <button type="submit" className="common-btn" disabled={generating}>
          {generating ? "Building path…" : "Generate Path"}
        </button>
      </form>

      {loading ? (
        <p className="lp-empty">Loading your paths…</p>
      ) : paths.length > 1 ? (
        <div className="lp-path-tabs">
          {paths.map((p) => (
            <button
              key={p._id}
              type="button"
              className={`lp-tab${activePath?._id === p._id ? " active" : ""}`}
              onClick={() => loadPath(p._id)}
            >
              {p.title}
              <span className="lp-tab-progress">{p.progressPercent}%</span>
            </button>
          ))}
        </div>
      ) : null}

      {activePath ? (
        <div className="lp-roadmap">
          <div className="lp-roadmap-header">
            <div>
              <h3>{activePath.title}</h3>
              {activePath.summary && <p>{activePath.summary}</p>}
              <span className="lp-goal-tag">Goal: {activePath.goal}</span>
            </div>
            <div className="lp-progress-ring">
              <span className="lp-progress-value">
                {activePath.progressPercent}%
              </span>
              <span className="lp-progress-label">complete</span>
            </div>
          </div>

          {(activePath.internalCount > 0 || activePath.externalCount > 0) && (
            <div className="lp-legend">
              {activePath.internalCount > 0 && (
                <span className="lp-legend-item lp-legend-platform">
                  {activePath.internalCount} on EduLearn
                </span>
              )}
              {activePath.externalCount > 0 && (
                <span className="lp-legend-item lp-legend-external">
                  {activePath.externalCount} external
                </span>
              )}
            </div>
          )}

          <div className="lp-progress-bar">
            <div
              className="lp-progress-fill"
              style={{ width: `${activePath.progressPercent}%` }}
            />
          </div>

          <div className="lp-steps">
            {activePath.steps.map((step, idx) => {
              const isLast = idx === activePath.steps.length - 1;
              const isInternal = step.type === "internal";
              const isExternal = step.type === "external";

              return (
                <div
                  key={step._id || step.order}
                  className={`lp-step lp-step--${step.status} lp-step--${step.type}`}
                >
                  <div className="lp-step-track">
                    <div className="lp-step-marker">
                      {step.status === "completed" ? (
                        <FaCheck />
                      ) : step.status === "locked" ? (
                        <FaLock />
                      ) : (
                        step.order
                      )}
                    </div>
                    {!isLast && <div className="lp-step-line" />}
                  </div>

                  <div className="lp-step-body">
                    <div className="lp-step-meta">
                      <span className="lp-step-label">
                        Step {step.order}
                        {step.status === "current" && " · Current"}
                        {step.status === "completed" && " · Done"}
                        {step.status === "locked" && " · Locked"}
                      </span>

                      {isInternal ? (
                        <>
                          <span className="lp-badge lp-badge-platform">
                            On Platform
                          </span>
                          <span className="lp-step-category">
                            {step.course.category}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="lp-badge lp-badge-external">
                            External
                          </span>
                          <span className="lp-step-category lp-step-resource">
                            {RESOURCE_LABELS[step.external.resourceType] ||
                              "External"}
                          </span>
                        </>
                      )}
                    </div>

                    <h4>{stepTitle(step)}</h4>

                    {isExternal && (
                      <span className="lp-step-provider">
                        {step.external.provider}
                      </span>
                    )}

                    <p className="lp-step-reason">{step.reason}</p>

                    {isInternal && step.status !== "locked" && (
                      <Link
                        to={
                          step.enrolled
                            ? `/course/study/${step.course._id}`
                            : `/course/${step.course._id}`
                        }
                        className="lp-step-link lp-step-link-internal"
                      >
                        {step.enrolled ? "Continue course →" : "Enroll →"}
                      </Link>
                    )}

                    {isInternal && step.status === "locked" && (
                      <span className="lp-step-locked-msg">
                        Complete the previous step to unlock
                      </span>
                    )}

                    {isExternal && step.status !== "locked" && (
                      <div className="lp-step-actions">
                        <a
                          href={step.external.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lp-step-link lp-step-link-external"
                        >
                          Open resource
                          <FaExternalLinkAlt />
                        </a>
                        {step.status === "current" && (
                          <button
                            type="button"
                            className="lp-mark-done"
                            onClick={() => markExternalComplete(step)}
                          >
                            Mark as done
                          </button>
                        )}
                      </div>
                    )}

                    {isExternal && step.status === "locked" && (
                      <span className="lp-step-locked-msg">
                        Complete the previous step to unlock
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        !loading && (
          <p className="lp-empty">
            No learning path yet. Enter a goal above to get started.
          </p>
        )
      )}
    </section>
  );
};

export default LearningPath;
