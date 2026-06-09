import React, { useMemo, useState } from "react";
import "./courses.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import { FaSearch } from "react-icons/fa";

const LEVELS = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "enrolled", label: "Most Enrolled" },
];

const Courses = () => {
  const { courses } = CourseData();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("newest");

  const categories = useMemo(() => {
    if (!courses?.length) return [];
    return [...new Set(courses.map((c) => c.category))].sort();
  }, [courses]);

  const filtered = useMemo(() => {
    if (!courses?.length) return [];

    const q = search.trim().toLowerCase();

    let result = courses.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);

      const matchesCategory = !category || c.category === category;
      const courseLevel = c.level || "beginner";
      const matchesLevel = !level || courseLevel === level;

      return matchesSearch && matchesCategory && matchesLevel;
    });

    result = [...result].sort((a, b) => {
      if (sort === "rating") {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      if (sort === "enrolled") {
        return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [courses, search, category, level, sort]);

  const hasFilters = search || category || level || sort !== "newest";

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("");
    setSort("newest");
  };

  return (
    <section className="courses">
      <div className="courses-header">
        <h2>Available Courses</h2>
        <p>Browse our catalog and start learning something new today.</p>
      </div>

      <div className="courses-toolbar">
        <div className="courses-search">
          <FaSearch className="courses-search-icon" />
          <input
            type="text"
            placeholder="Search by title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="courses-filters">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Filter by level"
          >
            {LEVELS.map((l) => (
              <option key={l.value || "all"} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort courses"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              className="courses-clear-btn"
              onClick={clearFilters}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <p className="courses-result-count">
        {filtered.length} course{filtered.length === 1 ? "" : "s"} found
      </p>

      <div className="course-container">
        {filtered.length > 0 ? (
          filtered.map((c) => <CourseCard key={c._id} course={c} />)
        ) : (
          <div className="empty-state">
            <p>
              {courses?.length
                ? "No courses match your filters. Try adjusting your search."
                : "No courses available yet. Check back soon!"}
            </p>
            {hasFilters && courses?.length > 0 && (
              <button
                type="button"
                className="common-btn courses-clear-empty"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Courses;
