import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";
import TryCatch from "../middlewares/TryCatch.js";
import { Certificate } from "../models/Certificate.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { Progress } from "../models/Progress.js";

// issue a certificate once a student has completed every lecture in a course
export const issueCertificateIfComplete = async (user, courseId) => {
  const progress = await Progress.findOne({ user: user._id, course: courseId });
  if (!progress) return;

  const totalLectures = await Lecture.countDocuments({ course: courseId });
  if (totalLectures === 0) return;

  if (progress.completedLectures.length < totalLectures) return;

  // idempotent: only one certificate per student per course
  const existing = await Certificate.findOne({
    user: user._id,
    course: courseId,
  });
  if (existing) return;

  const course = await Courses.findById(courseId);
  if (!course) return;

  await Certificate.create({
    certificateId: uuidv4(),
    user: user._id,
    course: courseId,
    studentName: user.name,
    courseName: course.title,
    instructorName: course.createdBy,
  });
};

// public: fetch certificate details for the verification page
export const getCertificate = TryCatch(async (req, res) => {
  const certificate = await Certificate.findOne({
    certificateId: req.params.id,
  });

  if (!certificate)
    return res.status(404).json({ message: "Certificate not found" });

  res.json({ certificate });
});

// public: stream the certificate as a PDF
export const downloadCertificate = TryCatch(async (req, res) => {
  const certificate = await Certificate.findOne({
    certificateId: req.params.id,
  });

  if (!certificate)
    return res.status(404).json({ message: "Certificate not found" });

  const issueDate = new Date(certificate.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="certificate-${certificate.certificateId}.pdf"`,
  );

  doc.pipe(res);

  const width = doc.page.width;
  const height = doc.page.height;
  const purple = "#8a4baf";

  // background + decorative border
  doc.rect(0, 0, width, height).fill("#faf7fc");
  doc
    .lineWidth(6)
    .strokeColor(purple)
    .rect(28, 28, width - 56, height - 56)
    .stroke();
  doc
    .lineWidth(1)
    .strokeColor("#c9a3df")
    .rect(40, 40, width - 80, height - 80)
    .stroke();

  doc
    .fillColor(purple)
    .font("Helvetica-Bold")
    .fontSize(34)
    .text("Certificate of Completion", 0, 90, { align: "center" });

  doc
    .fillColor("#666")
    .font("Helvetica")
    .fontSize(14)
    .text("This is to certify that", 0, 165, { align: "center" });

  doc
    .fillColor("#1a1a1a")
    .font("Helvetica-Bold")
    .fontSize(30)
    .text(certificate.studentName, 0, 195, { align: "center" });

  doc
    .fillColor("#666")
    .font("Helvetica")
    .fontSize(14)
    .text("has successfully completed the course", 0, 245, { align: "center" });

  doc
    .fillColor(purple)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text(certificate.courseName, 0, 275, { align: "center" });

  doc
    .fillColor("#444")
    .font("Helvetica")
    .fontSize(13)
    .text(`Instructor: ${certificate.instructorName}`, 0, 320, {
      align: "center",
    });

  doc
    .fillColor("#444")
    .fontSize(13)
    .text(`Date: ${issueDate}`, 0, 342, { align: "center" });

  doc
    .fillColor("#999")
    .font("Helvetica")
    .fontSize(10)
    .text(`Certificate ID: ${certificate.certificateId}`, 0, height - 80, {
      align: "center",
    });

  doc
    .fillColor("#bbb")
    .fontSize(9)
    .text("EduLearn", 0, height - 62, { align: "center" });

  doc.end();
});

// auth: list the logged-in student's certificates
export const getMyCertificates = TryCatch(async (req, res) => {
  const certificates = await Certificate.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.json({ certificates });
});
