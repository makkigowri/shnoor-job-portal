const {
  createTicket,
  getActiveTicket,
  createMessage,
  getUserTickets,
  getAllTickets,
  getTicketById,
  getTicketMessages,
  updateTicketStatus,
  submitFeedback,
  getAnalytics,
  resolveSupportConversation,
  deleteTicket,
  saveResolutionFeedback
} = require("../models/supportModel");
const { getIO } = require("../socket");

// Canonical status values already used in the database/frontend.
const STATUS_VALUES = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

// Accepts "OPEN" / "IN_PROGRESS" / "Open" / "In Progress" etc. and returns
// the canonical DB value, or null if it doesn't match a known status.
const normalizeStatus = (status) => {
  if (!status) return null;
  const key = status.trim().toUpperCase().replace(/\s+/g, "_");
  return STATUS_VALUES[key] || null;
};

const emitSafely = (event, room, payload) => {
  try {
    const io = getIO();
    if (io) io.to(room).emit(event, payload);
  } catch (error) {
    // Socket layer being unavailable should never break the HTTP response.
  }
};
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
    const conversation = await getTicketById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this conversation",
      });
    }
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
// Admin: change a conversation's status to OPEN / IN_PROGRESS / RESOLVED.
const updateConversationStatus = async (req, res, next) => {
  try {
    const { conversationId, status } = req.body;
    const normalizedStatus = normalizeStatus(status);
    if (!conversationId || !normalizedStatus) {
      return res.status(400).json({
        success: false,
        message: "A valid conversationId and status (OPEN, IN_PROGRESS, RESOLVED) are required",
      });
    }
    const existing = await getTicketById(conversationId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    const conversation =
      normalizedStatus === STATUS_VALUES.RESOLVED
        ? await resolveSupportConversation(conversationId)
        : await updateTicketStatus(conversationId, normalizedStatus);

    emitSafely("support-status-updated", `ticket-${conversationId}`, {
      ticketId: Number(conversationId),
      status: conversation.status,
    });
    if (normalizedStatus === STATUS_VALUES.RESOLVED) {
      emitSafely("conversation-resolved", `ticket-${conversationId}`, {
        ticketId: Number(conversationId),
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: permanently delete one support conversation (messages + feedback + ticket).
const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getTicketById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    await deleteTicket(id);

    emitSafely("conversation-deleted", `ticket-${id}`, {
      ticketId: Number(id),
    });

    return res.status(200).json({
      success: true,
      message: "Support conversation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// User: record whether they consider the conversation resolved after an admin reply.
const submitResolutionFeedback = async (req, res, next) => {
  try {
    const { conversationId, feedback } = req.body;
    if (!conversationId || !feedback) {
      return res.status(400).json({
        success: false,
        message: "conversationId and feedback are required",
      });
    }
    const normalized = feedback.trim().toUpperCase();
    const isResolved = normalized === "RESOLVED" || normalized === "YES";
    const isNotResolved = normalized === "NOT_RESOLVED" || normalized === "NO";
    if (!isResolved && !isNotResolved) {
      return res.status(400).json({
        success: false,
        message: "feedback must be one of RESOLVED, NOT_RESOLVED, YES, NO",
      });
    }
    const existing = await getTicketById(conversationId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    if (existing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this conversation",
      });
    }

    const resolutionValue = isResolved ? "RESOLVED" : "NOT_RESOLVED";
    let conversation = await saveResolutionFeedback(
      conversationId,
      req.user.id,
      resolutionValue
    );

    if (isResolved) {
      conversation = await resolveSupportConversation(conversationId);
      emitSafely("conversation-resolved", `ticket-${conversationId}`, {
        ticketId: Number(conversationId),
      });
    } else if (existing.status === STATUS_VALUES.OPEN) {
      // Keep it actively worked on rather than leaving it "Open" indefinitely.
      conversation = await updateTicketStatus(conversationId, STATUS_VALUES.IN_PROGRESS);
      emitSafely("support-status-updated", `ticket-${conversationId}`, {
        ticketId: Number(conversationId),
        status: conversation.status,
      });
    }

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
  updateConversationStatus,
  deleteConversation,
  submitResolutionFeedback,
};