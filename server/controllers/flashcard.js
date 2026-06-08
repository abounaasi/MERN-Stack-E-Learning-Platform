import TryCatch from "../middlewares/TryCatch.js";
import { Flashcard } from "../models/Flashcard.js";
import { FlashcardReview } from "../models/FlashcardReview.js";
import { Lecture } from "../models/Lecture.js";
import { Courses } from "../models/Courses.js";
import { generateFlashcardsFromLecture } from "../utils/ai.js";

// a student may use flashcards if enrolled in the lecture's course (or admin / owning instructor)
const canAccessLecture = async (user, lecture) => {
  if (user.role === "admin") return true;

  const course = await Courses.findById(lecture.course);
  if (course && course.instructor?.toString() === user._id.toString())
    return true;

  return user.subscription.some(
    (id) => id.toString() === lecture.course.toString(),
  );
};

export const generateFlashcards = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });

  if (!(await canAccessLecture(req.user, lecture)))
    return res.status(403).json({ message: "You are not enrolled in this course" });

  // cached: generate only once per lecture, then reuse for everyone
  const existing = await Flashcard.find({ lecture: lecture._id });
  if (existing.length > 0) {
    return res.json({ flashcards: existing, cached: true });
  }

  const course = await Courses.findById(lecture.course);

  const cards = await generateFlashcardsFromLecture({
    lectureTitle: lecture.title,
    lectureDescription: lecture.description,
    courseTitle: course?.title,
    courseDescription: course?.description,
  });

  if (!cards.length)
    return res.status(502).json({ message: "Could not generate flashcards" });

  const created = await Flashcard.insertMany(
    cards.map((c) => ({
      lecture: lecture._id,
      course: lecture.course,
      question: c.question,
      answer: c.answer,
    })),
  );

  res.status(201).json({ flashcards: created, cached: false });
});

export const getLectureFlashcards = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });

  if (!(await canAccessLecture(req.user, lecture)))
    return res.status(403).json({ message: "You are not enrolled in this course" });

  const flashcards = await Flashcard.find({ lecture: lecture._id });
  res.json({ flashcards });
});

export const getDueFlashcards = TryCatch(async (req, res) => {
  const { lecture } = req.query;

  const lec = await Lecture.findById(lecture);
  if (!lec) return res.status(404).json({ message: "Lecture not found" });

  if (!(await canAccessLecture(req.user, lec)))
    return res.status(403).json({ message: "You are not enrolled in this course" });

  const flashcards = await Flashcard.find({ lecture: lec._id });

  const reviews = await FlashcardReview.find({
    user: req.user._id,
    flashcard: { $in: flashcards.map((f) => f._id) },
  });
  const reviewByCard = new Map(
    reviews.map((r) => [r.flashcard.toString(), r]),
  );

  const now = Date.now();
  // a card is "due" if it has never been reviewed or its dueDate has passed
  const due = flashcards.filter((f) => {
    const review = reviewByCard.get(f._id.toString());
    return !review || new Date(review.dueDate).getTime() <= now;
  });

  res.json({
    flashcards: due,
    dueCount: due.length,
    total: flashcards.length,
  });
});

export const reviewFlashcard = TryCatch(async (req, res) => {
  const quality = Number(req.body.quality);
  if (Number.isNaN(quality) || quality < 0 || quality > 5)
    return res.status(400).json({ message: "quality must be a number 0-5" });

  const flashcard = await Flashcard.findById(req.params.id);
  if (!flashcard) return res.status(404).json({ message: "Flashcard not found" });

  const lecture = await Lecture.findById(flashcard.lecture);
  if (!lecture || !(await canAccessLecture(req.user, lecture)))
    return res.status(403).json({ message: "You are not enrolled in this course" });

  let review = await FlashcardReview.findOne({
    user: req.user._id,
    flashcard: flashcard._id,
  });
  if (!review) {
    review = new FlashcardReview({
      user: req.user._id,
      flashcard: flashcard._id,
    });
  }

  // SM-2 spaced-repetition scheduling
  if (quality < 3) {
    review.repetitions = 0;
    review.interval = 1;
  } else {
    if (review.repetitions === 0) review.interval = 1;
    else if (review.repetitions === 1) review.interval = 6;
    else review.interval = Math.round(review.interval * review.easeFactor);
    review.repetitions += 1;
  }

  review.easeFactor =
    review.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (review.easeFactor < 1.3) review.easeFactor = 1.3;

  review.dueDate = new Date(Date.now() + review.interval * 24 * 60 * 60 * 1000);
  review.lastReviewed = new Date();

  await review.save();

  res.json({
    message: "Review saved",
    interval: review.interval,
    dueDate: review.dueDate,
  });
});
