import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { sendChatMessage } from "../../services/chatbotService";
const SHNOOR_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGzhluKdUf0IhxKsPrl1daQEZatX0_mJi8ITsuYsm8eQ&s=10";
const WELCOME_MESSAGE = "Welcome to the SHNOOR Job Portal AI Assistant. I'm here to help you with job opportunities, applications, assessments, interviews, and other SHNOOR Job Portal related queries.";
const FALLBACK_REPLY = "Sorry, I can only assist with SHNOOR Job Portal related queries. Please contact the administrator for further assistance.";
const SUGGESTED_QUESTIONS = [
  "Tell me about SHNOOR",
  "What are the current openings?",
  "How do I apply for a job?",
  "How does ATS work?",
  "How do I attend an Assessment?",
  "How does AI Interview work?",
  "How does Technical Interview work?",
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
const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: "bot", text: WELCOME_MESSAGE }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, open]);
  const submitMessage = async (rawText) => {
    const text = rawText.trim();
    if (!text || isTyping) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setIsTyping(true);
    try {
      const data = await sendChatMessage(text);
      const reply = data && data.reply ? data.reply : FALLBACK_REPLY;
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
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
  const conversation = messages.slice(1);
  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <div
        className={`absolute bottom-[76px] right-0 w-[calc(100vw-2rem)] sm:w-[400px] md:w-[420px] h-[80vh] sm:h-[600px] max-h-[640px] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ease-out ${
          open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 translate-y-3 pointer-events-none"
        }`}
      >
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
          {conversation.map((message, index) =>
            message.sender === "user" ? (
              <UserMessage key={index} text={message.text} />
            ) : (
              <BotMessage key={index} text={message.text} />
            )
          )}
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
      </div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-16 h-16 rounded-full bg-[#7393D3] hover:bg-[#5E84D6] text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        <span className={`absolute transition-all duration-300 ${open ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}>
          <MessageCircle size={26} />
        </span>
        <span className={`absolute transition-all duration-300 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}>
          <X size={26} />
        </span>
      </button>
    </div>
  );
};
export default ChatbotWidget;
