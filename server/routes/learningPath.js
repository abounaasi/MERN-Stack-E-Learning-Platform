import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  generatePath,
  getMyPaths,
  getPath,
  completeExternalStep,
} from "../controllers/learningPath.js";

const router = express.Router();

router.post("/learning-path/generate", isAuth, generatePath);
router.get("/learning-path", isAuth, getMyPaths);
router.get("/learning-path/:id", isAuth, getPath);
router.post(
  "/learning-path/:id/steps/:order/complete",
  isAuth,
  completeExternalStep,
);

export default router;
