import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { LearningPath } from "../models/LearningPath.js";
import { Progress } from "../models/Progress.js";
import { generateLearningPath } from "../utils/ai.js";

const isInternalStep = (step) =>
  step.type === "internal" || (!step.type && step.course);

const isCourseComplete = async (userId, courseId) => {
  const total = await Lecture.countDocuments({ course: courseId });
  if (total === 0) return false;

  const progress = await Progress.findOne({ user: userId, course: courseId });
  if (!progress) return false;

  return progress.completedLectures.length >= total;
};

const isStepComplete = async (user, step) => {
  if (isInternalStep(step)) {
    if (!step.course?._id) return false;
    return isCourseComplete(user._id, step.course._id);
  }
  return step.completed === true;
};

const buildStepStatuses = async (user, steps) => {
  const enrolled = new Set(
    (user.subscription || []).map((id) => id.toString()),
  );

  const completion = await Promise.all(
    steps.map((step) => isStepComplete(user, step)),
  );

  let foundCurrent = false;
  const enriched = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const internal = isInternalStep(step);
    const completed = completion[i];

    let status;
    if (completed) {
      status = "completed";
    } else if (!foundCurrent) {
      const priorComplete =
        i === 0 || completion.slice(0, i).every(Boolean);
      if (priorComplete) {
        status = "current";
        foundCurrent = true;
      } else {
        status = "locked";
      }
    } else {
      status = "locked";
    }

    const base = {
      _id: step._id,
      order: step.order,
      type: internal ? "internal" : "external",
      reason: step.reason,
      status,
    };

    if (internal && step.course) {
      const courseId = step.course._id.toString();
      enriched.push({
        ...base,
        enrolled: enrolled.has(courseId),
        course: {
          _id: step.course._id,
          title: step.course.title,
          description: step.course.description,
          category: step.course.category,
          duration: step.course.duration,
          image: step.course.image,
        },
      });
    } else if (internal) {
      continue;
    } else {
      enriched.push({
        ...base,
        external: {
          title: step.externalTitle,
          url: step.externalUrl,
          resourceType: step.externalType || "other",
          provider: step.externalProvider || "External",
        },
      });
    }
  }

  const completedCount = enriched.filter((s) => s.status === "completed").length;
  const internalCount = enriched.filter((s) => s.type === "internal").length;
  const externalCount = enriched.filter((s) => s.type === "external").length;

  return {
    steps: enriched,
    completedCount,
    totalSteps: enriched.length,
    internalCount,
    externalCount,
    progressPercent: enriched.length
      ? Math.round((completedCount / enriched.length) * 100)
      : 0,
  };
};

const formatPath = async (path, user) => {
  await path.populate("steps.course");
  const progress = await buildStepStatuses(user, path.steps);

  return {
    _id: path._id,
    goal: path.goal,
    title: path.title,
    summary: path.summary,
    createdAt: path.createdAt,
    ...progress,
  };
};

export const generatePath = TryCatch(async (req, res) => {
  const goal = req.body.goal?.trim();
  if (!goal) return res.status(400).json({ message: "Please enter a learning goal" });

  const courses = await Courses.find().select(
    "title description category duration",
  );
  if (!courses.length) {
    return res.status(404).json({ message: "No courses available yet" });
  }

  const generated = await generateLearningPath({ goal, courses });

  const path = await LearningPath.create({
    user: req.user._id,
    goal,
    title: generated.title,
    summary: generated.summary,
    steps: generated.steps.map((s) => {
      if (s.type === "external") {
        return {
          order: s.order,
          type: "external",
          reason: s.reason,
          externalTitle: s.title,
          externalUrl: s.url,
          externalType: s.resourceType,
          externalProvider: s.provider,
          completed: false,
        };
      }
      return {
        order: s.order,
        type: "internal",
        course: s.courseId,
        reason: s.reason,
      };
    }),
  });

  const formatted = await formatPath(path, req.user);
  res.status(201).json({ path: formatted });
});

export const getMyPaths = TryCatch(async (req, res) => {
  const paths = await LearningPath.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("steps.course", "title category duration image");

  const list = await Promise.all(
    paths.map(async (p) => {
      const progress = await buildStepStatuses(req.user, p.steps);
      return {
        _id: p._id,
        goal: p.goal,
        title: p.title,
        summary: p.summary,
        createdAt: p.createdAt,
        completedCount: progress.completedCount,
        totalSteps: progress.totalSteps,
        internalCount: progress.internalCount,
        externalCount: progress.externalCount,
        progressPercent: progress.progressPercent,
      };
    }),
  );

  res.json({ paths: list });
});

export const getPath = TryCatch(async (req, res) => {
  const path = await LearningPath.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!path) return res.status(404).json({ message: "Learning path not found" });

  const formatted = await formatPath(path, req.user);
  res.json({ path: formatted });
});

export const completeExternalStep = TryCatch(async (req, res) => {
  const path = await LearningPath.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!path) return res.status(404).json({ message: "Learning path not found" });

  const order = Number(req.params.order);
  const step = path.steps.find((s) => s.order === order);

  if (!step) return res.status(404).json({ message: "Step not found" });
  if (isInternalStep(step)) {
    return res.status(400).json({ message: "Only external steps can be marked complete" });
  }

  step.completed = true;
  await path.save();

  const formatted = await formatPath(path, req.user);
  res.json({ path: formatted });
});
