const { Server } = require("socket.io");
let io;
const connectedUsers = new Map();
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);
    socket.on("register", ({ userId, role }) => {
      connectedUsers.set(
        `${role}-${userId}`,
        socket.id
      );
      console.log(`${role} ${userId} registered`);
    });
    socket.on("join-conversation", (conversationId) => {
      socket.join(`ticket-${conversationId}`);
      console.log(
        `${socket.id} joined ticket-${conversationId}`
      );
    });
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(`ticket-${conversationId}`);
      console.log(
        `${socket.id} left ticket-${conversationId}`
      );
    });
    socket.on(
      "typing",
      ({ conversationId, sender }) => {
        socket
          .to(`ticket-${conversationId}`)
          .emit("typing", {
            sender,
          });
      }
    );
    socket.on("disconnect", () => {
      for (const [key, value] of connectedUsers.entries()) {
        if (value === socket.id) {
          connectedUsers.delete(key);
          break;
        }
      }
      console.log("Socket Disconnected:", socket.id);
    });
  });
  return io;
};
const getIO = () => io;
const getUserSocket = (userId) =>
  connectedUsers.get(`user-${userId}`);
const getAdminSocket = (adminId) =>
  connectedUsers.get(`admin-${adminId}`);
module.exports = {
  initializeSocket,
  getIO,
  getUserSocket,
  getAdminSocket,
};