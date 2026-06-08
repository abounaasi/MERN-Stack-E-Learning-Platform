import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Prefer lite model — full flash often returns 503 under load
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

const createModel = (modelName) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: modelName });
};

const SYSTEM_PROMPT = `You are an expert tutor that writes concise study flashcards for an online course.
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
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env to enable flashcard generation.",
    );
  }

  const prompt = `${SYSTEM_PROMPT}

Create flashcards for this lecture:
Course: ${courseTitle || "N/A"}
Course description: ${courseDescription || "N/A"}
Lecture: ${lectureTitle || "N/A"}
Lecture description: ${lectureDescription || "N/A"}`;

  // Retry transient errors; fall back to the next model if one is overloaded
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

  // strip markdown code fences if Gemini wraps the JSON
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return parsed.flashcards || [];
};
