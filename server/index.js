import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./database/db.js";
import { initSocket } from "./socket.js";
import cors from "cors";

dotenv.config();

const app = express();
const server = http.createServer(app);

// real-time layer for study groups
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);
initSocket(io);

//using middlewares
app.use(express.json());
app.use(cors());

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/uploads", express.static("uploads"));

// importing routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import enrollmentRoutes from "./routes/enrollment.js";
import instructorRoutes from "./routes/instructor.js";
import certificateRoutes from "./routes/certificate.js";
import studyGroupRoutes from "./routes/studyGroup.js";

//using routes
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", instructorRoutes);
app.use("/api", certificateRoutes);
app.use("/api", studyGroupRoutes);

server.listen(5000, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDB();
});
