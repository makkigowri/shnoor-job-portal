const { getChatbotResponse } = require("../services/chatbotService");
const handleChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    const { intent, reply, ticket } = await getChatbotResponse(
  message,
  req.user ? req.user.id : null
);
return res.status(200).json({
  success: true,
  intent,
  reply,
  ticket,
});
  } catch (error) {
    next(error);
  }
};
module.exports = { handleChatMessage };
