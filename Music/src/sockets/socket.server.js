import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { parseCookie } from "cookie";

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookies = parseCookie(socket.handshake.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return next(new Error("Authorization Error"));
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);

      socket.user = decoded;

      next();
    } catch (error) {
      return next(new Error("Authorization Error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.user);

    socket.join(socket.user.id);

    socket.on("play", (data) => {
      const musicId = data.musicId;
      socket.broadcast.to(socket.user.id).emit("play", { musicId });
    });

    socket.on("disconnect", () => {
      socket.leave(socket.user.id);
      console.log("User disconnected", socket.id);
    });
  });
}

export default initSocketServer;
