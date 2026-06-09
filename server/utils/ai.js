import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Prefer lite model — full flash often returns 503 under load
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

const createModel = (modelName) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: modelName });
};

const callGeminiJson = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env to enable AI features.",
    );
  }

  let result;
  let lastError;
  for (const modelName of MODELS) {
    const model = createModel(modelName);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (err) {
        lastError = err;
        const transient = /\[(503|429)/.test(err.message);
        if (transient && attempt < 2) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
    if (result) break;
  }
  if (!result) throw lastError;

  const text = result.response.text();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

const FLASHCARD_PROMPT = `You are an expert tutor that writes concise study flashcards for an online course.
Given a lecture's title and description (and its course context), produce 5-8 high-quality flashcards.
Each flashcard has a clear, specific "question" and a correct, self-contained "answer".
Keep questions short and answers to 1-3 sentences. Focus on the core concepts a student should remember.
Do not invent facts that are not implied by the lecture topic.
IMPORTANT: Respond ONLY with a valid JSON object in this exact format, no extra text:
{"flashcards": [{"question": "...", "answer": "..."}]}`;

export const generateFlashcardsFromLecture = async ({
  lectureTitle,
  lectureDescription,
  courseTitle,
  courseDescription,
}) => {
  const prompt = `${FLASHCARD_PROMPT}

Create flashcards for this lecture:
Course: ${courseTitle || "N/A"}
Course description: ${courseDescription || "N/A"}
Lecture: ${lectureTitle || "N/A"}
Lecture description: ${lectureDescription || "N/A"}`;

  const parsed = await callGeminiJson(prompt);
  return parsed.flashcards || [];
};

const PATH_PROMPT = `You are an expert career advisor and curriculum designer for an online learning platform.
Given a student's learning goal and a catalog of available platform courses, build a personalized step-by-step learning roadmap.

STRICT RELEVANCE RULES (must follow):
- Only include a course from the provided list if it is directly relevant to the student's goal.
- If none of the provided courses match a required step, suggest an external resource instead.
- Never include irrelevant courses just to fill steps.
- Do NOT use a platform course from an unrelated field (e.g. do not add a full-stack or programming course to a marketing path unless the goal explicitly requires it).
- It is better to have fewer internal courses and more external resources than to pad the path with unrelated platform courses.
- Every internal step must explain in "reason" why that specific course directly serves the student's stated goal.

For each step:
- Use type "internal" ONLY when a catalog course is genuinely relevant — use the exact course "id" as courseId.
- Use type "external" when no catalog course fits — suggest a real external resource (YouTube channel/playlist, Udemy course, or official free documentation) with a real, working URL.

Order steps from foundational to advanced. Include 4-10 steps total.
Each step needs a short reason explaining why it belongs at that point.

IMPORTANT: Respond ONLY with valid JSON in this exact format, no extra text:
{"title": "Path title", "summary": "1-2 sentence overview", "steps": [
  {"type": "internal", "courseId": "exact id from catalog", "reason": "..."},
  {"type": "external", "title": "Resource name", "url": "https://...", "resourceType": "youtube|udemy|documentation|other", "provider": "e.g. freeCodeCamp", "reason": "..."}
]}`;

export const generateLearningPath = async ({ goal, courses }) => {
  const catalog = courses.map((c) => ({
    id: c._id.toString(),
    title: c.title,
    description: c.description,
    category: c.category,
    duration: c.duration,
  }));

  const prompt = `${PATH_PROMPT}

Student goal: ${goal}

Remember: only use platform courses that are directly relevant to "${goal}". Skip irrelevant catalog courses entirely and use external resources for those steps.

Available platform courses (use ONLY if directly relevant to the goal):
${JSON.stringify(catalog, null, 2)}`;

  const parsed = await callGeminiJson(prompt);
  const validIds = new Set(catalog.map((c) => c.id));

  const steps = (parsed.steps || [])
    .map((s) => {
      if (s.type === "external" || (!s.courseId && s.url)) {
        const url = s.url?.trim();
        if (!url?.startsWith("http") || !s.title?.trim()) return null;
        return {
          type: "external",
          title: s.title.trim(),
          url,
          resourceType: ["youtube", "udemy", "documentation", "other"].includes(
            s.resourceType,
          )
            ? s.resourceType
            : "other",
          provider: s.provider?.trim() || "External",
          reason: s.reason || "",
        };
      }

      if (!validIds.has(s.courseId)) return null;
      return {
        type: "internal",
        courseId: s.courseId,
        reason: s.reason || "",
      };
    })
    .filter(Boolean)
    .map((s, i) => ({ ...s, order: i + 1 }));

  if (!steps.length) {
    throw new Error("Could not build a learning path from available courses");
  }

  return {
    title: parsed.title || `Path to: ${goal}`,
    summary: parsed.summary || "",
    steps,
  };
};

const SKILL_GAP_PROMPT = `You are an expert career advisor for an online learning platform.
A student has selected skills they already know. Compare their skills against the platform course catalog and identify skill gaps.

STRICT RULES:
- "missingSkills" = skills the student likely needs but does NOT have yet, based on common career paths and what our catalog covers.
- Only recommend a platform course (type "internal") if it directly teaches a missing skill AND is genuinely relevant — use the exact course "id" as courseId.
- If no catalog course covers a missing skill, recommend an external resource (type "external") with a real URL.
- Never recommend courses for skills the student already has.
- Never recommend irrelevant catalog courses just because they exist.
- One recommendation per missing skill (prioritize the most important gaps, up to 8).

IMPORTANT: Respond ONLY with valid JSON in this exact format, no extra text:
{"missingSkills": ["skill1", "skill2"], "recommendations": [
  {"type": "internal", "skill": "MongoDB", "courseId": "exact id from catalog", "reason": "Why this course fills the gap"},
  {"type": "external", "skill": "Python", "title": "Resource name", "url": "https://...", "provider": "Provider name", "reason": "Why this resource fills the gap"}
]}`;

export const analyzeSkillGaps = async ({ knownSkills, courses }) => {
  const catalog = courses.map((c) => ({
    id: c._id.toString(),
    title: c.title,
    description: c.description,
    category: c.category,
    duration: c.duration,
  }));

  const prompt = `${SKILL_GAP_PROMPT}

Skills the student already knows:
${JSON.stringify(knownSkills)}

Available platform courses (use ONLY if directly relevant to a missing skill):
${JSON.stringify(catalog, null, 2)}`;

  const parsed = await callGeminiJson(prompt);
  const validIds = new Set(catalog.map((c) => c.id));

  const recommendations = (parsed.recommendations || [])
    .map((r) => {
      if (r.type === "external" || (!r.courseId && r.url)) {
        const url = r.url?.trim();
        if (!url?.startsWith("http") || !r.title?.trim() || !r.skill?.trim())
          return null;
        return {
          type: "external",
          skill: r.skill.trim(),
          title: r.title.trim(),
          url,
          provider: r.provider?.trim() || "External",
          reason: r.reason || "",
        };
      }

      if (!validIds.has(r.courseId) || !r.skill?.trim()) return null;
      return {
        type: "internal",
        skill: r.skill.trim(),
        courseId: r.courseId,
        reason: r.reason || "",
      };
    })
    .filter(Boolean);

  return {
    missingSkills: (parsed.missingSkills || []).filter(
      (s) => typeof s === "string" && s.trim(),
    ),
    recommendations,
  };
};
