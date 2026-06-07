import express from "express";
import { isAuth, isInstructor } from "../middlewares/isAuth.js";
import {
  addLectures,
  createCourse,
  deleteCourse,
  deleteLecture,
  getInstructorCourses,
  getInstructorStats,
} from "../controllers/instructor.js";
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

router.post("/course/new", isAuth, isInstructor, uploadFiles, createCourse);
router.post("/course/:id", isAuth, isInstructor, uploadFiles, addLectures);

// delete is owner-or-admin, so only isAuth here (ownership checked in controller)
router.delete("/lecture/:id", isAuth, deleteLecture);
router.delete("/course/:id", isAuth, deleteCourse);

router.get("/instructor/courses", isAuth, isInstructor, getInstructorCourses);
router.get("/instructor/stats", isAuth, isInstructor, getInstructorStats);

export default router;
