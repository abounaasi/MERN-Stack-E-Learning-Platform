import express from "express";
import {
  forgotPassword,
  getLeaderboard,
  getStreak,
  loginUser,
  myProfile,
  register,
  resetPassword,
  uploadAvatar,
  verifyUser,
} from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";
import { uploadAvatar as uploadAvatarMw } from "../middlewares/multer.js";

const router = express.Router();

router.post("/user/register", register);
router.post("/user/verify", verifyUser);
router.post("/user/login", loginUser);
router.get("/user/me", isAuth, myProfile);
router.post("/user/avatar", isAuth, uploadAvatarMw, uploadAvatar);
router.get("/user/leaderboard", isAuth, getLeaderboard);
router.post("/user/forgot", forgotPassword);
router.post("/user/reset", resetPassword);
router.get("/user/streak", isAuth, getStreak);
export default router;
