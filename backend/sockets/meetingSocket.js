const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/userModel");


const initMeetingSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true
    },
    path: "/socket.io/meeting"
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Not authorized"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await findUserById(decoded.id);
      if (!user) {
        return next(new Error("Not authorized"));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Not authorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-room", async ({ roomCode }) => {
      try {
        const interview = await technicalInterviewModel.getByRoomCode(roomCode);
        if (!interview) {
          socket.emit("meeting-error", { message: "Meeting room not found" });
          return;
        }
        const isCandidate = interview.candidate_id === socket.user.id;
        const isRecruiter = interview.recruiter_id === socket.user.id;
        if (!isCandidate && !isRecruiter) {
          socket.emit("meeting-error", { message: "You are not a participant of this interview" });
          return;
        }
        const role = isRecruiter ? "recruiter" : "candidate";
        socket.roomCode = roomCode;
        socket.role = role;
        await technicalInterviewModel.markJoined(interview.id, role);
        const room = io.sockets.adapter.rooms.get(roomCode);
        const existingParticipants = room
          ? Array.from(room)
              .map((id) => io.sockets.sockets.get(id))
              .filter(Boolean)
              .map((s) => ({ socketId: s.id, role: s.role, name: s.user.fullname }))
          : [];
        socket.join(roomCode);
        socket.emit("joined-room", { existingParticipants, role });
        socket.to(roomCode).emit("participant-joined", {
          socketId: socket.id,
          role,
          name: socket.user.fullname
        });
      } catch (error) {
        socket.emit("meeting-error", { message: "Failed to join meeting room" });
      }
    });

    socket.on("signal", ({ to, data }) => {
      if (!to) return;
      io.to(to).emit("signal", { from: socket.id, role: socket.role, data });
    });

    socket.on("media-status", ({ cameraOn, micOn }) => {
      if (!socket.roomCode) return;
      socket.to(socket.roomCode).emit("participant-media-status", {
        socketId: socket.id,
        cameraOn,
        micOn
      });
    });

    socket.on("screen-share-status", ({ sharing }) => {
      if (!socket.roomCode) return;
      socket.to(socket.roomCode).emit("participant-screen-share", {
        socketId: socket.id,
        sharing
      });
    });

    socket.on("leave-room", () => {
      if (socket.roomCode) {
        socket.to(socket.roomCode).emit("participant-left", { socketId: socket.id });
        socket.leave(socket.roomCode);
      }
    });

    socket.on("disconnect", () => {
      if (socket.roomCode) {
        socket.to(socket.roomCode).emit("participant-left", { socketId: socket.id });
      }
    });
  });

  return io;
};

module.exports = { initMeetingSocket };
