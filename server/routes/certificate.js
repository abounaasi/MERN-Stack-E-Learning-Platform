import express from "express";
import {
  downloadCertificate,
  getCertificate,
  getMyCertificates,
} from "../controllers/certificate.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// auth route first so "my" isn't captured by the public ":id" param
router.get("/certificates/my", isAuth, getMyCertificates);
router.get("/certificate/:id", getCertificate);
router.get("/certificate/:id/download", downloadCertificate);

export default router;
