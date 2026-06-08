import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  generateFlashcards,
  getLectureFlashcards,
  getDueFlashcards,
  reviewFlashcard,
} from "../controllers/flashcard.js";

const router = express.Router();

router.post("/lecture/:id/flashcards/generate", isAuth, generateFlashcards);
router.get("/lecture/:id/flashcards", isAuth, getLectureFlashcards);
router.get("/flashcards/due", isAuth, getDueFlashcards);
router.post("/flashcards/:id/review", isAuth, reviewFlashcard);

export default router;
