import express from "express";
import { enrollInCourse } from "../controllers/enrollment.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/course/:id/enroll", isAuth, enrollInCourse);

export default router;
