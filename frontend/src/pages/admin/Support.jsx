import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import useAdminAuth from "../../hooks/useAdminAuth";
import {
  fetchSupportConversations,
  fetchSupportConversation,
  replyToSupportConversation,
  resolveSupportConversation
} from "../../services/adminSupportService";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "—");

const AdminSupport = () => {
  const { admin } = useAdminAuth();
  const [conversations, setConversations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("All");
  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const activeIdRef = useRef(null);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadConversations = async () => {
    setListLoading(true);
    try {
      const data = await fetchSupportConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load support conversations.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    if (admin?.id) {
      socket.emit("register", { userId: admin.id, role: "admin" });
    }
    socket.on("support-message", (payload) => {
      if (payload.ticketId === activeIdRef.current) {
        setMessages((prev) => [...prev, payload]);
      }
      loadConversations();
    });
    socket.on("conversation-resolved", () => {
      loadConversations();
    });
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const openConversation = async (conversationId) => {
    setActiveId(conversationId);
    setThreadLoading(true);
    if (socketRef.current) {
      socketRef.current.emit("join-conversation", conversationId);
    }
    try {
      const data = await fetchSupportConversation(conversationId);
      setActiveConversation(data.conversation);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load this conversation.");
    } finally {
      setThreadLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || !activeId) return;
    setSending(true);
    try {
      const data = await replyToSupportConversation(activeId, text);
      setMessages((prev) => [...prev, data.reply]);
      setReplyText("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!activeId) return;
    try {
      const data = await resolveSupportConversation(activeId);
      setActiveConversation(data.conversation);
      await loadConversations();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to resolve this conversation.");
    }
  };

  const filteredConversations = useMemo(() => {
    if (filter === "All") return conversations;
    return conversations.filter((c) => c.status === filter);
  }, [conversations, filter]);

  return (
    <AdminLayout title="Support Chat" subtitle="View and reply to support conversations started from the AI Assistant.">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
            <h3 className="font-bold text-[#3E3A74]">Conversations</h3>
            <div className="flex gap-1.5">
              {["All", "Open", "In Progress", "Resolved"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    filter === status ? "bg-[#7393D3] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {listLoading && <p className="text-center text-gray-400 py-8 text-sm">Loading conversations...</p>}
            {!listLoading && filteredConversations.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">No conversations found.</p>
            )}
            {!listLoading &&
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  className={`w-full text-left px-5 py-4 border-b border-gray-100 transition ${
                    activeId === conv.id ? "bg-[#EEF2FF]" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-800 truncate">{conv.fullname || "Unknown user"}</p>
                    <StatusBadge status={conv.status} />
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">{conv.email}</p>
                  <p className="text-xs text-gray-400 truncate mt-1.5">{conv.last_message || "No messages yet"}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatDateTime(conv.created_at)}</p>
                </button>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {!activeId && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to view messages
            </div>
          )}
          {activeId && (
            <>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{activeConversation?.subject || "Support Chat"}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(activeConversation?.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {activeConversation && <StatusBadge status={activeConversation.status} />}
                  {activeConversation?.status !== "Resolved" && (
                    <button
                      onClick={handleResolve}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-green-200 text-green-700 hover:bg-green-50"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#F8FAFC]">
                {threadLoading && <p className="text-center text-gray-400 text-sm">Loading messages...</p>}
                {!threadLoading &&
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                        msg.sender_type === "admin" || msg.sender === "admin"
                          ? "ml-auto bg-[#7393D3] text-white rounded-br-sm"
                          : "bg-white border border-[#E5E7EB] text-[#111827] rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-line break-words">{msg.message || msg.text}</p>
                    </div>
                  ))}
              </div>
              <form onSubmit={handleSendReply} className="border-t border-gray-100 p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a reply..."
                  disabled={activeConversation?.status === "Resolved"}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#7393D3] focus:outline-none disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim() || activeConversation?.status === "Resolved"}
                  className="px-5 py-2.5 rounded-xl bg-[#7393D3] text-white font-medium hover:bg-[#5E84D6] disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;