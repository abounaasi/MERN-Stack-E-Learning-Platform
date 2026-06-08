import jwt from "jsonwebtoken";
import { User } from "./models/User.js";
import { StudyGroup } from "./models/StudyGroup.js";
import { Message } from "./models/Message.js";

const isMember = (group, userId) =>
  group.members.some((m) => m.toString() === userId.toString());

export const initSocket = (io) => {
  // authenticate the socket connection with the same JWT as the REST API
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.Jwt_Sec);
      const user = await User.findById(decoded._id).select("name email");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    // join a group's room (members only)
    socket.on("joinGroup", async (groupId) => {
      try {
        const group = await StudyGroup.findById(groupId);
        if (group && isMember(group, socket.user._id)) {
          socket.join(groupId);
        }
      } catch (error) {
        console.log("joinGroup error:", error.message);
      }
    });

    socket.on("leaveRoom", (groupId) => {
      socket.leave(groupId);
    });

    // persist a chat message and broadcast it to the room
    socket.on("sendMessage", async ({ groupId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const group = await StudyGroup.findById(groupId);
        if (!group || !isMember(group, socket.user._id)) return;

        const message = await Message.create({
          group: groupId,
          sender: socket.user._id,
          senderName: socket.user.name,
          text: text.trim(),
        });

        io.to(groupId).emit("newMessage", message);
      } catch (error) {
        console.log("sendMessage error:", error.message);
      }
    });
  });
};
