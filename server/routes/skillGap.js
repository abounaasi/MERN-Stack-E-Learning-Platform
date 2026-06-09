import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { getSkills, analyzeSkills } from "../controllers/skillGap.js";

const router = express.Router();

router.get("/skill-gap/skills", isAuth, getSkills);
router.post("/skill-gap/analyze", isAuth, analyzeSkills);

export default router;
