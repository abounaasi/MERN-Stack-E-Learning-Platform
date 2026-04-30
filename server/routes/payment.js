import express from "express";
import { checkout, capturePayment } from "../controllers/payment.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/course/:id/checkout", isAuth, checkout);
router.post("/course/:id/capture", isAuth, capturePayment);

export default router;
