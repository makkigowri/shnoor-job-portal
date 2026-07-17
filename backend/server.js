const http = require("http");
const app = require("./app");
const { initMeetingSocket } = require("./sockets/meetingSocket");
const PORT = process.env.PORT || 5001;
const httpServer = http.createServer(app);
initMeetingSocket(httpServer);
httpServer.listen(PORT, () => {
  console.log(`Shnoor Job Portal API running on port ${PORT}`);
});
