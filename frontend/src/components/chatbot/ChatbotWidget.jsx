import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { MessageCircle, X, Send, ArrowLeft, LifeBuoy, CheckCircle2 } from "lucide-react";
import { sendChatMessage } from "../../services/chatbotService";
import {
  sendSupportMessage,
  fetchMySupportConversation,
  submitResolutionFeedback
} from "../../services/supportService";
import useAuth from "../../hooks/useAuth";
const SHNOOR_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGzhluKdUf0IhxKsPrl1daQEZatX0_mJi8ITsuYsm8eQ&s=10";
const WELCOME_MESSAGE = "Welcome to the SHNOOR Job Portal AI Assistant. I'm here to help you with job opportunities, applications, assessments, and other SHNOOR Job Portal related queries.";
const FALLBACK_REPLY = "Sorry, I can only assist with SHNOOR Job Portal related queries. Please contact the administrator for further assistance.";
const FORWARDED_TO_SUPPORT_MESSAGE = "I'm unable to provide a reliable answer to this question. I've forwarded your query to Admin Support. An administrator will assist you shortly.";
const LOGIN_REQUIRED_FOR_SUPPORT_MESSAGE = "I'm unable to provide a reliable answer to this question. Please log in to your account so I can forward your query to Admin Support.";
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");
const STATUS_STYLES = {
  Open: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-green-50 text-green-700 border-green-200"
};
const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};
const getMessageSender = (msg) => msg.sender_type || msg.sender || "user";
const getMessageText = (msg) => msg.message ?? msg.text ?? "";
const getMessageId = (msg) => msg.id ?? `${getMessageSender(msg)}-${getMessageText(msg)}-${msg.created_at || msg.createdAt || ""}`;
const StatusPill = ({ status }) => (
  <span
    className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border-gray-200"
    }`}
  >
    {status || "Open"}
  </span>
);
const SUGGESTED_QUESTIONS = [
  "Tell me about SHNOOR",
  "What are the current openings?",
  "How do I apply for a job?",
  "How does ATS work?",
  "How do I attend an Assessment?",
  "Track my application",
  "Contact Support"
];
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const parseListingReply = (text) => {
  if (!text || !text.includes("\n")) return null;
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return null;
  const header = lines[0];
  const isJobs = /job opening/i.test(header);
  const isAssessments = /assessment/i.test(header);
  if (!isJobs && !isAssessments) return null;
  const items = lines.slice(1).map((line) => {
    const withoutIndex = line.replace(/^\d+\.\s*/, "");
    const segments = withoutIndex.split(" | ");
    const title = segments[0];
    const fields = segments.slice(1).map((segment) => {
      const separatorIndex = segment.indexOf(": ");
      if (separatorIndex === -1) return { label: segment, value: "" };
      return {
        label: segment.slice(0, separatorIndex),
        value: segment.slice(separatorIndex + 2)
      };
    });
    return { title, fields };
  });
  return { header, items };
};
const renderWithEmailLinks = (text) => {
  const parts = text.split(EMAIL_PATTERN);
  const matches = text.match(EMAIL_PATTERN) || [];
  const nodes = [];
  parts.forEach((part, index) => {
    if (part) nodes.push(part);
    if (matches[index]) {
      nodes.push(
        <a
          key={`${matches[index]}-${index}`}
          href={`mailto:${matches[index]}`}
          className="text-[#7393D3] font-medium underline underline-offset-2 hover:text-[#5E84D6]"
        >
          {matches[index]}
        </a>
      );
    }
  });
  return nodes;
};
const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-sm px-4 py-3 w-fit shadow-sm">
    <span className="w-2 h-2 rounded-full bg-[#7393D3] animate-bounce [animation-delay:-0.3s]" />
    <span className="w-2 h-2 rounded-full bg-[#7393D3] animate-bounce [animation-delay:-0.15s]" />
    <span className="w-2 h-2 rounded-full bg-[#7393D3] animate-bounce" />
  </div>
);
const ListingCard = ({ item }) => (
  <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-sm">
    <p className="text-sm font-semibold text-[#3E3A74]">{item.title}</p>
    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
      {item.fields.map((field, index) => (
        <span key={index} className="text-xs text-[#6B7280]">
          <span className="font-medium text-[#5D636E]">{field.label}:</span> {field.value}
        </span>
      ))}
    </div>
  </div>
);
const BotMessage = ({ text }) => {
  const listing = parseListingReply(text);
  if (listing) {
    return (
      <div className="max-w-[88%] space-y-2">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm text-[#111827] leading-relaxed">{listing.header}</p>
        </div>
        <div className="space-y-2">
          {listing.items.map((item, index) => (
            <ListingCard key={index} item={item} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-[88%] bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
      <p className="text-sm text-[#111827] leading-relaxed whitespace-pre-line break-words">{renderWithEmailLinks(text)}</p>
    </div>
  );
};
const UserMessage = ({ text }) => (
  <div className="max-w-[88%] ml-auto bg-[#7393D3] rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
    <p className="text-sm text-white leading-relaxed whitespace-pre-line break-words">{text}</p>
  </div>
);
const ForwardedMessage = ({ text, onViewSupport, showButton }) => (
  <div className="max-w-[92%] space-y-2">
    <div className="bg-[#FFF7ED] border border-[#FDE7C7] rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
      <p className="text-sm text-[#9A5B13] leading-relaxed whitespace-pre-line break-words">{text}</p>
    </div>
    {showButton && (
      <button
        onClick={onViewSupport}
        className="inline-flex items-center gap-1.5 bg-white border border-[#7393D3] text-[#3E3A74] text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-[#EEF2FF] active:scale-[0.99] transition"
      >
        <LifeBuoy size={15} />
        View Support Chat
      </button>
    )}
  </div>
);
const ChatbotWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("chat"); // "chat" | "support"
  const [messages, setMessages] = useState([{ sender: "bot", text: WELCOME_MESSAGE }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [supportConversation, setSupportConversation] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [supportInput, setSupportInput] = useState("");
  const [supportSending, setSupportSending] = useState(false);
  const [answeredAdminMessageId, setAnsweredAdminMessageId] = useState(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackThanksMessageId, setFeedbackThanksMessageId] = useState(null);
  const [hasUnreadSupportReply, setHasUnreadSupportReply] = useState(false);

  const scrollRef = useRef(null);
  const supportScrollRef = useRef(null);
  const socketRef = useRef(null);
  const joinedRoomRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, open, view]);
  useEffect(() => {
    if (supportScrollRef.current) {
      supportScrollRef.current.scrollTop = supportScrollRef.current.scrollHeight;
    }
  }, [supportMessages, view, open]);
  useEffect(() => {
    if (!user?.id) {
      setSupportConversation(null);
      setSupportMessages([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const data = await fetchMySupportConversation();
        if (!active) return;
        if (data.conversation) {
          setSupportConversation(data.conversation);
          setSupportMessages(data.messages || []);
        }
      } catch (error) {
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);
  useEffect(() => {
    const ticketId = supportConversation?.id;
    if (!user?.id || !ticketId) return undefined;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { transports: ["websocket", "polling"] });
      socketRef.current.emit("register", { userId: user.id, role: "user" });
    }
    const socket = socketRef.current;
    if (joinedRoomRef.current !== ticketId) {
      socket.emit("join-conversation", ticketId);
      joinedRoomRef.current = ticketId;
    }
    const handleSupportMessage = (payload) => {
      if (payload.ticketId !== ticketId) return;
      setSupportMessages((prev) => {
        if (prev.some((m) => getMessageId(m) === payload.id)) return prev;
        return [...prev, payload];
      });
      if (payload.sender === "admin") {
        setHasUnreadSupportReply((prevUnread) => (view === "support" && open ? prevUnread : true));
      }
    };
    const handleStatusUpdated = (payload) => {
      if (payload.ticketId !== ticketId) return;
      setSupportConversation((prev) => (prev ? { ...prev, status: payload.status } : prev));
    };
    const handleResolved = (payload) => {
      if (payload.ticketId !== ticketId) return;
      setSupportConversation((prev) => (prev ? { ...prev, status: "Resolved" } : prev));
    };
    const handleDeleted = (payload) => {
      if (payload.ticketId !== ticketId) return;
      setSupportConversation(null);
      setSupportMessages([]);
      joinedRoomRef.current = null;
      if (view === "support") setView("chat");
    };
    socket.on("support-message", handleSupportMessage);
    socket.on("support-status-updated", handleStatusUpdated);
    socket.on("conversation-resolved", handleResolved);
    socket.on("conversation-deleted", handleDeleted);
    return () => {
      socket.off("support-message", handleSupportMessage);
      socket.off("support-status-updated", handleStatusUpdated);
      socket.off("conversation-resolved", handleResolved);
      socket.off("conversation-deleted", handleDeleted);
    };
  }, [user?.id, supportConversation?.id]);
  useEffect(
    () => () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    },
    []
  );
  const submitMessage = async (rawText) => {
    const text = rawText.trim();
    if (!text || isTyping) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setIsTyping(true);
    try {
      const data = await sendChatMessage(text);
      if (data && data.intent === "support") {
        const hasTicket = Boolean(data.ticket);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            type: "forward",
            text: hasTicket ? FORWARDED_TO_SUPPORT_MESSAGE : LOGIN_REQUIRED_FOR_SUPPORT_MESSAGE,
            ticketId: data.ticket ? data.ticket.id : null
          }
        ]);
        if (data.ticket) {
          setSupportConversation(data.ticket);
          try {
            const thread = await fetchMySupportConversation();
            if (thread.conversation) {
              setSupportConversation(thread.conversation);
              setSupportMessages(thread.messages || []);
            }
          } catch (error) {
          }
        }
      } else {
        const reply = data && data.reply ? data.reply : FALLBACK_REPLY;
        setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am unable to process your request right now. Please try again in a moment or contact the administrator for assistance."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitMessage(input);
    }
  };
  const openSupportView = useCallback(async () => {
    setView("support");
    setHasUnreadSupportReply(false);
    setSupportError("");
    setSupportLoading(true);
    try {
      const data = await fetchMySupportConversation();
      if (data.conversation) {
        setSupportConversation(data.conversation);
        setSupportMessages(data.messages || []);
      }
    } catch (error) {
      setSupportError(error?.response?.data?.message || "Unable to load your support conversation right now.");
    } finally {
      setSupportLoading(false);
    }
  }, []);
  const handleSendSupportReply = async (event) => {
    event.preventDefault();
    const text = supportInput.trim();
    if (!text || supportSending) return;
    setSupportSending(true);
    setSupportError("");
    try {
      const data = await sendSupportMessage(text);
      setSupportInput("");
      setSupportConversation((prev) =>
        prev ? { ...prev, id: data.conversationId, status: prev.status } : { id: data.conversationId, status: "Open" }
      );
      setSupportMessages((prev) => {
        if (prev.some((m) => getMessageId(m) === data.message.id)) return prev;
        return [...prev, data.message];
      });
    } catch (error) {
      setSupportError(error?.response?.data?.message || "Unable to send your message. Please try again.");
    } finally {
      setSupportSending(false);
    }
  };
  const handleResolutionFeedback = async (adminMessageId, resolved) => {
    if (!supportConversation?.id || feedbackSubmitting) return;
    setFeedbackSubmitting(true);
    setSupportError("");
    try {
      const data = await submitResolutionFeedback(supportConversation.id, resolved ? "RESOLVED" : "NOT_RESOLVED");
      setAnsweredAdminMessageId(adminMessageId);
      if (data.conversation) {
        setSupportConversation(data.conversation);
      }
      if (resolved) {
        setFeedbackThanksMessageId(adminMessageId);
      }
    } catch (error) {
      setSupportError(error?.response?.data?.message || "Unable to submit your feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };
  const conversation = messages.slice(1);
  const status = supportConversation?.status;
  const isResolved = status === "Resolved";
  const lastSupportMessage = supportMessages[supportMessages.length - 1];
  const lastSupportMessageId = lastSupportMessage ? getMessageId(lastSupportMessage) : null;
  const showFeedbackPrompt =
    lastSupportMessage &&
    getMessageSender(lastSupportMessage) === "admin" &&
    !isResolved &&
    answeredAdminMessageId !== lastSupportMessageId;
  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <div
        className={`absolute bottom-[76px] right-0 w-[calc(100vw-2rem)] sm:w-[400px] md:w-[420px] h-[80vh] sm:h-[600px] max-h-[640px] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ease-out ${
          open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 translate-y-3 pointer-events-none"
        }`}
      >
        {view === "chat" ? (
          <>
            <div className="bg-[#3E3A74] px-5 py-4 flex items-center gap-3 shrink-0">
              <img
                src={SHNOOR_LOGO_URL}
                alt="SHNOOR"
                className="w-10 h-10 rounded-lg bg-white object-contain p-1 shadow-sm"
              />
              <div className="leading-tight flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">SHNOOR Job Portal</p>
                <p className="text-[#C7D2FE] text-xs font-medium truncate">AI Assistant</p>
              </div>
              {supportConversation && (
                <button
                  onClick={openSupportView}
                  className="relative text-white/90 hover:text-white transition"
                  aria-label="Open support chat"
                  title="Support Chat"
                >
                  <LifeBuoy size={19} />
                  {hasUnreadSupportReply && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#3E3A74]" />
                  )}
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth px-4 py-4 space-y-3 bg-[#F8FAFC]">
              <BotMessage text={WELCOME_MESSAGE} />
              <div className="space-y-2 pb-1">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => submitMessage(question)}
                    disabled={isTyping}
                    className="w-full text-left bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#3E3A74] font-medium shadow-sm hover:border-[#7393D3] hover:bg-[#EEF2FF] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
              {conversation.map((message, index) => {
                if (message.sender === "user") return <UserMessage key={index} text={message.text} />;
                if (message.type === "forward") {
                  return (
                    <ForwardedMessage
                      key={index}
                      text={message.text}
                      showButton={Boolean(message.ticketId)}
                      onViewSupport={openSupportView}
                    />
                  );
                }
                return <BotMessage key={index} text={message.text} />;
              })}
              {isTyping && <TypingIndicator />}
            </div>
            <div className="border-t border-[#E5E7EB] p-3 flex items-center gap-2 bg-white shrink-0">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about SHNOOR Job Portal..."
                className="flex-1 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#111827] focus:border-[#7393D3] focus:shadow-[0_0_0_4px_rgba(115,147,211,0.18)] outline-none transition"
              />
              <button
                onClick={() => submitMessage(input)}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-full bg-[#7393D3] hover:bg-[#5E84D6] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition shadow-md"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-[#3E3A74] px-5 py-4 flex items-center gap-3 shrink-0">
              <button
                onClick={() => setView("chat")}
                className="text-white/90 hover:text-white transition"
                aria-label="Back to AI Assistant"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="leading-tight flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">Support Chat</p>
                <p className="text-[#C7D2FE] text-xs font-medium truncate">Admin Support</p>
              </div>
              {status && <StatusPill status={status} />}
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
            <div ref={supportScrollRef} className="flex-1 overflow-y-auto scroll-smooth px-4 py-4 space-y-3 bg-[#F8FAFC]">
              {supportLoading && <p className="text-center text-gray-400 text-sm py-6">Loading your support conversation...</p>}
              {!supportLoading && supportError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">{supportError}</div>
              )}
              {!supportLoading && !supportError && supportMessages.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">
                  No messages yet. Your question will appear here once it's forwarded to Admin Support.
                </p>
              )}
              {!supportLoading &&
                supportMessages.map((msg) => {
                  const sender = getMessageSender(msg);
                  const isAdmin = sender === "admin";
                  const messageId = getMessageId(msg);
                  return (
                    <div key={messageId} className={`max-w-[88%] ${isAdmin ? "" : "ml-auto"}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                          isAdmin
                            ? "bg-white border border-[#E5E7EB] text-[#111827] rounded-bl-sm"
                            : "bg-[#7393D3] text-white rounded-br-sm"
                        }`}
                      >
                        <p className="whitespace-pre-line break-words leading-relaxed">{getMessageText(msg)}</p>
                      </div>
                      <p className={`text-[11px] text-gray-400 mt-1 ${isAdmin ? "text-left" : "text-right"}`}>
                        {isAdmin ? "Admin Support" : "You"} · {formatTimestamp(msg.created_at || msg.createdAt)}
                      </p>
                      {isAdmin && messageId === feedbackThanksMessageId && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2 w-fit">
                          <CheckCircle2 size={14} />
                          Thank you! Your support request has been marked as resolved.
                        </div>
                      )}
                    </div>
                  );
                })}
              {showFeedbackPrompt && (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3 shadow-sm space-y-2.5">
                  <p className="text-sm font-medium text-[#111827]">Did this answer resolve your issue?</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleResolutionFeedback(lastSupportMessageId, true)}
                      disabled={feedbackSubmitting}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#7393D3] text-white hover:bg-[#5E84D6] disabled:opacity-50 transition"
                    >
                      Yes, my issue is resolved
                    </button>
                    <button
                      onClick={() => handleResolutionFeedback(lastSupportMessageId, false)}
                      disabled={feedbackSubmitting}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-[#E5E7EB] text-[#3E3A74] hover:bg-[#EEF2FF] disabled:opacity-50 transition"
                    >
                      No, I still need help
                    </button>
                  </div>
                </div>
              )}
              {isResolved && (
                <p className="text-center text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  This support request has been marked as resolved.
                </p>
              )}
            </div>
            <form onSubmit={handleSendSupportReply} className="border-t border-[#E5E7EB] p-3 flex items-center gap-2 bg-white shrink-0">
              <input
                type="text"
                value={supportInput}
                onChange={(event) => setSupportInput(event.target.value)}
                placeholder={isResolved ? "This conversation is resolved." : "Reply to Admin Support..."}
                disabled={isResolved || supportSending}
                className="flex-1 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#111827] focus:border-[#7393D3] focus:shadow-[0_0_0_4px_rgba(115,147,211,0.18)] outline-none transition disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!supportInput.trim() || supportSending || isResolved}
                className="w-10 h-10 rounded-full bg-[#7393D3] hover:bg-[#5E84D6] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition shadow-md"
                aria-label="Send reply"
              >
                <Send size={17} />
              </button>
            </form>
          </>
        )}
      </div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative w-16 h-16 rounded-full bg-[#7393D3] hover:bg-[#5E84D6] text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        <span className={`absolute transition-all duration-300 ${open ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}>
          <MessageCircle size={26} />
        </span>
        <span className={`absolute transition-all duration-300 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}>
          <X size={26} />
        </span>
        {hasUnreadSupportReply && !open && (
          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white" />
        )}
      </button>
    </div>
  );
};
export default ChatbotWidget;
