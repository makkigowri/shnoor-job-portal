const http = require("http");
const app = require("./app");
const { initializeSocket } = require("./socket");
const PORT = process.env.PORT || 5001;
const httpServer = http.createServer(app);
initializeSocket(httpServer);
httpServer.listen(PORT, () => {
  console.log(`Shnoor Job Portal API running on port ${PORT}`);
});