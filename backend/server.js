const http = require("http");
const app = require("./app");
const PORT = process.env.PORT || 5001;
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
  console.log(`Shnoor Job Portal API running on port ${PORT}`);
});
