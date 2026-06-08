import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  createGroup,
  getMyGroups,
  getGroup,
  getGroupMessages,
  inviteMember,
  updateNotes,
  leaveGroup,
} from "../controllers/studyGroup.js";

const router = express.Router();

router.post("/groups", isAuth, createGroup);
router.get("/groups/my", isAuth, getMyGroups);
router.get("/group/:id", isAuth, getGroup);
router.get("/group/:id/messages", isAuth, getGroupMessages);
router.post("/group/:id/invite", isAuth, inviteMember);
router.put("/group/:id/notes", isAuth, updateNotes);
router.post("/group/:id/leave", isAuth, leaveGroup);

export default router;
