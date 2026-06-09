import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.js";

const router = express.Router();

router.get("/wishlist", isAuth, getWishlist);
router.post("/wishlist/:courseId", isAuth, addToWishlist);
router.delete("/wishlist/:courseId", isAuth, removeFromWishlist);

export default router;
