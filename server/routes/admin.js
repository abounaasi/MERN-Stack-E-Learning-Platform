import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import { getAllStats, getAllUser, updateRole } from "../controllers/admin.js";

const router = express.Router();

router.get("/stats", isAuth, isAdmin, getAllStats);
router.put("/user/:id", isAuth, isAdmin, updateRole);
router.get("/users", isAuth, isAdmin, getAllUser);

export default router;
