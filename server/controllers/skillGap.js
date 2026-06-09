import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { analyzeSkillGaps } from "../utils/ai.js";

export const AVAILABLE_SKILLS = [
  "React",
  "Node.js",
  "Python",
  "CSS",
  "MongoDB",
  "JavaScript",
  "HTML",
  "TypeScript",
  "Git",
  "Express",
  "UI/UX",
  "SQL",
  "Redux",
  "Next.js",
  "Vue.js",
  "Java",
  "Docker",
  "AWS",
  "Figma",
  "SEO",
];

export const getSkills = TryCatch(async (req, res) => {
  res.json({ skills: AVAILABLE_SKILLS });
});

export const analyzeSkills = TryCatch(async (req, res) => {
  const knownSkills = (req.body.skills || [])
    .map((s) => s.trim())
    .filter(Boolean);

  if (!knownSkills.length) {
    return res.status(400).json({ message: "Select at least one skill you know" });
  }

  const courses = await Courses.find().select(
    "title description category duration image",
  );
  if (!courses.length) {
    return res.status(404).json({ message: "No courses available yet" });
  }

  const analysis = await analyzeSkillGaps({ knownSkills, courses });
  const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

  const enrolled = new Set(
    (req.user.subscription || []).map((id) => id.toString()),
  );

  const recommendations = analysis.recommendations.map((r) => {
    if (r.type === "external") return r;

    const course = courseMap.get(r.courseId);
    if (!course) return null;

    return {
      type: "internal",
      skill: r.skill,
      reason: r.reason,
      enrolled: enrolled.has(r.courseId),
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        image: course.image,
      },
    };
  }).filter(Boolean);

  res.json({
    knownSkills,
    missingSkills: analysis.missingSkills,
    recommendations,
  });
});
