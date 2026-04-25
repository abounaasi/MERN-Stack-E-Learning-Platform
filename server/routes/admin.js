import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import { addlectures, createCourse } from "../controllers/admin.js";
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

router.post("/course/new", isAuth, isAdmin, uploadFiles, createCourse);
router.post("/course/:id", isAuth, isAdmin, uploadFiles, addlectures);
export default router;
