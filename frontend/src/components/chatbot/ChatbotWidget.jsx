import { useEffect, useRef, useState } from "react";
import socket from "../../socket";

import {
  MessageCircle,
  X,
  Send,
  ArrowLeft,
  Headphones,
  Star,
} from "lucide-react";

import {
  sendChatMessage,
} from "../../services/chatbotService";

import {
  sendSupportMessage,
  getMyConversation,
  submitSupportFeedback,
} from "../../services/supportService";
const SHNOOR_LOGO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGzhluKdUf0IhxKsPrl1daQEZatX0_mJi8ITsuYsm8eQ&s=10";

const WELCOME_MESSAGE =
  "Welcome to the SHNOOR Job Portal AI Assistant. I'm here to help you with job opportunities, applications, assessments, interviews, and other SHNOOR Job Portal related queries.";

const FALLBACK_REPLY =
  "Sorry, I can only assist with SHNOOR Job Portal related queries. Please contact the administrator for further assistance.";

const SUGGESTED_QUESTIONS = [
  "Tell me about SHNOOR",
  "What are the current openings?",
  "How do I apply for a job?",
  "How does ATS work?",
  "How do I attend an Assessment?",
  "How does AI Interview work?",
  "How does Technical Interview work?",
  "Track my application",
  "Contact Support",
];

const EMAIL_PATTERN =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const renderWithEmailLinks = (text = "") => {
  const parts = text.split(EMAIL_PATTERN);
  const matches = text.match(EMAIL_PATTERN) || [];

  const nodes = [];

  parts.forEach((part, index) => {
    if (part) nodes.push(part);

    if (matches[index]) {
      nodes.push(
        <a
          key={index}
          href={`mailto:${matches[index]}`}
          className="text-[#7393D3] underline"
        >
          {matches[index]}
        </a>
      );
    }
  });

  return nodes;
};

const TypingIndicator = () => (
  <div className="flex">
    <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#7393D3] animate-bounce"></span>
      <span className="w-2 h-2 rounded-full bg-[#7393D3] animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-2 h-2 rounded-full bg-[#7393D3] animate-bounce [animation-delay:-0.3s]"></span>
    </div>
  </div>
);

const UserMessage = ({ text }) => (
  <div className="flex justify-end">
    <div className="max-w-[80%] bg-[#7393D3] rounded-2xl rounded-br-sm px-4 py-3">
      <p className="text-sm text-white whitespace-pre-wrap">
        {text}
      </p>
    </div>
  </div>
);

const BotMessage = ({ text }) => (
  <div className="flex">
    <div className="max-w-[80%] bg-white border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <p className="text-sm whitespace-pre-wrap">
        {renderWithEmailLinks(text || "")}
      </p>
    </div>
  </div>
);
const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("ai");

  const [aiMessages, setAiMessages] = useState([
    {
      sender: "bot",
      text: WELCOME_MESSAGE,
    },
  ]);

  const [supportMessages, setSupportMessages] = useState([]);

  const [conversation, setConversation] = useState(null);

  const [input, setInput] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const [adminTyping, setAdminTyping] = useState(false);

  const [adminOnline, setAdminOnline] = useState(false);

  const [ticketResolved, setTicketResolved] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);

  const [rating, setRating] = useState(0);

  const [feedback, setFeedback] = useState("");

  const [unreadCount, setUnreadCount] = useState(0);

  const scrollRef = useRef(null);
    const scrollBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const loadConversation = async () => {
    try {
      const data = await getMyConversation();

      if (!data?.conversation) return;

      setConversation(data.conversation);
      setSupportMessages(data.messages || []);

      socket.emit(
        "join-conversation",
        data.conversation.id
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadConversation();
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [
    aiMessages,
    supportMessages,
    isTyping,
    adminTyping,
    open,
    currentScreen,
    showFeedback,
  ]);

  useEffect(() => {
    socket.connect();

    socket.emit("register", {
      role: "user",
      userId: "me",
    });

    return () => {
      socket.disconnect();
    };
  }, []);
    useEffect(() => {
    const receiveMessage = (message) => {
      setSupportMessages((prev) => [...prev, message]);

      if (!open || currentScreen !== "support") {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("support-message", receiveMessage);

    socket.on("admin-online", () => {
      setAdminOnline(true);
    });

    socket.on("admin-offline", () => {
      setAdminOnline(false);
    });

    socket.on("typing", (typing) => {
      setAdminTyping(typing);
    });

    socket.on("conversation-resolved", () => {
      setTicketResolved(true);
      setShowFeedback(true);
    });

    return () => {
      socket.off("support-message", receiveMessage);
      socket.off("admin-online");
      socket.off("admin-offline");
      socket.off("typing");
      socket.off("conversation-resolved");
    };
  }, [open, currentScreen]);
    const submitAIMessage = async (text) => {
    setAiMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
      },
    ]);

    setIsTyping(true);

    try {
      const data = await sendChatMessage(text);

      if (data?.isSupport) {
        await loadConversation();
        setCurrentScreen("support");
      }

      setAiMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data?.reply || FALLBACK_REPLY,
        },
      ]);
    } catch (error) {
      setAiMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const submitSupportMessage = async (text) => {
    try {
      const data = await sendSupportMessage(text);

      if (!conversation && data?.conversationId) {
        await loadConversation();
      }

      setSupportMessages((prev) => [
        ...prev,
        {
          sender_type: "user",
          message: text,
          created_at: new Date(),
        },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = (value) => {
    const text = value.trim();

    if (!text) return;

    setInput("");

    if (currentScreen === "support") {
      submitSupportMessage(text);
    } else {
      submitAIMessage(text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleFeedback = async () => {
    try {
      await submitSupportFeedback({
        rating,
        feedback,
      });

      setShowFeedback(false);
    } catch (error) {
      console.error(error);
    }
  };
    return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <div
        className={`absolute bottom-[76px] right-0 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col transition-all duration-300 ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-[#3E3A74] px-5 py-4 flex items-center gap-3">
          {currentScreen === "support" && (
            <button
              onClick={() => setCurrentScreen("ai")}
              className="text-white"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <img
            src={SHNOOR_LOGO_URL}
            alt="logo"
            className="w-10 h-10 rounded-lg bg-white p-1"
          />

          <div className="flex-1">
            <p className="text-white font-semibold">
              SHNOOR Job Portal
            </p>

            <p className="text-xs text-[#D6DAF8]">
              {currentScreen === "ai"
                ? "AI Assistant"
                : adminOnline
                ? "Live Support"
                : "Waiting for Support"}
            </p>
          </div>

          {currentScreen === "ai" && (
            <button
              onClick={() => setCurrentScreen("support")}
              className="text-white"
            >
              <Headphones size={20} />
            </button>
          )}

          <button
            onClick={() => setOpen(false)}
            className="text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 space-y-3"
        >
          {currentScreen === "ai" && (
            <>
              {aiMessages.map((msg, index) =>
                msg.sender === "user" ? (
                  <UserMessage
                    key={index}
                    text={msg.text}
                  />
                ) : (
                  <BotMessage
                    key={index}
                    text={msg.text}
                  />
                )
              )}

              {isTyping && <TypingIndicator />}

              {aiMessages.length === 1 &&
                !isTyping && (
                  <div className="space-y-2 pt-2">
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        onClick={() =>
                          handleSend(question)
                        }
                        className="w-full text-left bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm hover:bg-[#EEF2FF] hover:border-[#7393D3] transition"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
            </>
          )}

          {currentScreen === "support" && (
            <>
              {supportMessages.map((msg, index) =>
                msg.sender_type === "user" ? (
                  <UserMessage
                    key={index}
                    text={msg.message}
                  />
                ) : (
                  <BotMessage
                    key={index}
                    text={msg.message}
                  />
                )
              )}

              {adminTyping && <TypingIndicator />}
                            {showFeedback && (
                <div className="bg-white border rounded-xl p-4 space-y-3">
                  <p className="font-semibold text-[#3E3A74]">
                    Rate your support experience
                  </p>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                      >
                        <Star
                          size={20}
                          fill={star <= rating ? "currentColor" : "none"}
                          className="text-yellow-400"
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write your feedback..."
                    className="w-full border rounded-lg p-2 text-sm resize-none h-20"
                  />

                  <button
                    onClick={handleFeedback}
                    className="w-full py-2 rounded-lg bg-[#7393D3] text-white hover:bg-[#5E84D6]"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {!ticketResolved && (
          <div className="border-t bg-white p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                currentScreen === "support"
                  ? "Type your message..."
                  : "Ask anything..."
              }
              className="flex-1 border rounded-xl px-4 py-2 outline-none focus:border-[#7393D3]"
            />

            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-full bg-[#7393D3] text-white flex items-center justify-center hover:bg-[#5E84D6] disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          setOpen(!open);
          setUnreadCount(0);
        }}
        className="relative w-16 h-16 rounded-full bg-[#7393D3] hover:bg-[#5E84D6] text-white shadow-xl flex items-center justify-center"
      >
        <MessageCircle size={28} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;