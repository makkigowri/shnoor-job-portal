const { AccessToken } = require("livekit-server-sdk");
const joinMeetingRoom = async (req, res) => {
  try {
    console.log("===== JOIN MEETING =====");
    console.log("Authenticated User:", req.user);
    const { roomName } = req.params;
    if (!roomName) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;
    if (!apiKey || !apiSecret || !livekitUrl) {
      return res.status(500).json({
        success: false,
        message: "LiveKit environment variables are missing",
      });
    }
    const token = new AccessToken(apiKey, apiSecret, {
      identity: String(req.user.id),
      name: req.user.fullname,
    });
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    const jwt = await token.toJwt();
    console.log("LiveKit Token Generated Successfully");
    return res.status(200).json({
      success: true,
      token: jwt,
      url: livekitUrl,
      roomName,
    });
  } catch (err) {
    console.error("Meeting Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
module.exports = {
  joinMeetingRoom,
};