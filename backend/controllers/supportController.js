const {
  createTicket,
  getActiveTicket,
  createMessage,
  getUserTickets,
  getAllTickets,
  getTicketById,
  getTicketMessages,
  submitFeedback,
  getAnalytics,
  resolveSupportConversation
} = require("../models/supportModel");
const { getIO } = require("../socket");
const sendUserSupportMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }
    let conversation = await getActiveTicket(req.user.id);
    if (!conversation) {
      conversation = await createTicket(
        req.user.id,
        "Support Chat"
      );
    }
    const newMessage = await createMessage(
      conversation.id,
      "user",
      req.user.id,
      message.trim()
    );
    const io = getIO();
    io.to(`ticket-${conversation.id}`).emit(
      "support-message",
      {
        id: newMessage.id,
        ticketId: conversation.id,
        sender: "user",
        senderId: req.user.id,
        text: newMessage.message,
        createdAt: newMessage.created_at,
      }
    );
    return res.status(200).json({
      success: true,
      conversationId: conversation.id,
      message: newMessage,
    });
  } catch (error) {
    next(error);
  }
};
const getMySupportConversation = async (req, res, next) => {
  try {
    const conversation = await getActiveTicket(req.user.id);
    if (!conversation) {
      return res.status(200).json({
        success: true,
        conversation: null,
        messages: [],
      });
    }
    const messages = await getTicketMessages(conversation.id);
    return res.status(200).json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    next(error);
  }
};
const getSupportConversations = async (req, res, next) => {
  try {
    const conversations = await getAllTickets();
    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};
const getSupportConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await getTicketById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    const messages = await getTicketMessages(id);
    return res.status(200).json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    next(error);
  }
};
const replySupportMessage = async (req, res, next) => {
  try {
    const { conversationId, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }
    const conversation = await getTicketById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    const reply = await createMessage(
      conversationId,
      "admin",
      req.admin.id,
      message.trim()
    );
    const io = getIO();
    io.to(`ticket-${conversationId}`).emit(
      "support-message",
      {
        id: reply.id,
        ticketId: conversationId,
        sender: "admin",
        senderId: req.admin.id,
        text: reply.message,
        createdAt: reply.created_at,
      }
    );
    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    next(error);
  }
};
const submitSupportFeedback = async (req, res, next) => {
  try {
    const {
      conversationId,
      rating,
      responseSpeed,
      platformRating,
      comments,
    } = req.body;
    const feedback = await submitFeedback(
      conversationId,
      req.user.id,
      rating,
      responseSpeed,
      platformRating,
      comments || null
    );
    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    next(error);
  }
};
const supportAnalytics = async (req, res, next) => {
  try {
    const analytics = await getAnalytics();
    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};
const resolveConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const conversation =
      await resolveSupportConversation(conversationId);
    const io = getIO();
    io.to(`ticket-${conversationId}`).emit(
      "conversation-resolved"
    );
    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  sendUserSupportMessage,
  getMySupportConversation,
  getSupportConversations,
  getSupportConversation,
  replySupportMessage,
  submitSupportFeedback,
  supportAnalytics,
  resolveConversation,
};