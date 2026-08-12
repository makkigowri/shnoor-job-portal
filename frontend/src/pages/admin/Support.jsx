import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import ActionMenu from "../../components/admin/ActionMenu";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import useAdminAuth from "../../hooks/useAdminAuth";
import {
  fetchSupportConversations,
  fetchSupportConversation,
  replyToSupportConversation,
  resolveSupportConversation,
  updateSupportStatus,
  deleteSupportConversation
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
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
    socket.on("support-status-updated", (payload) => {
      if (payload.ticketId === activeIdRef.current) {
        setActiveConversation((prev) => (prev ? { ...prev, status: payload.status } : prev));
      }
      loadConversations();
    });
    socket.on("conversation-deleted", (payload) => {
      if (payload.ticketId === activeIdRef.current) {
        setActiveId(null);
        setActiveConversation(null);
        setMessages([]);
      }
      loadConversations();
    });
    return () => {
      socket.disconnect();
    };
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
  const handleStatusChange = async (conversationId, status) => {
    setStatusUpdatingId(conversationId);
    try {
      const data = await updateSupportStatus(conversationId, status);
      if (conversationId === activeId) {
        setActiveConversation(data.conversation);
      }
      await loadConversations();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update the conversation status.");
    } finally {
      setStatusUpdatingId(null);
    }
  };
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSupportConversation(deleteTarget.id);
      if (deleteTarget.id === activeId) {
        setActiveId(null);
        setActiveConversation(null);
        setMessages([]);
      }
      setDeleteTarget(null);
      await loadConversations();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete this support conversation.");
    } finally {
      setDeleting(false);
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
                <div
                  key={conv.id}
                  className={`w-full px-5 py-4 border-b border-gray-100 transition flex items-start gap-2 ${
                    activeId === conv.id ? "bg-[#EEF2FF]" : "hover:bg-gray-50"
                  }`}
                >
                  <button
                    onClick={() => openConversation(conv.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-800 truncate">{conv.fullname || "Unknown user"}</p>
                      <StatusBadge status={conv.status} />
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{conv.email}</p>
                    <p className="text-xs text-gray-400 truncate mt-1.5">
                      <span className="font-medium text-gray-500">Latest:</span> {conv.last_message || "No messages yet"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">{formatDateTime(conv.created_at)}</p>
                  </button>
                  <div className="pt-0.5">
                    <ActionMenu
                      items={[
                        { key: "open", label: "Open", onClick: () => openConversation(conv.id) },
                        {
                          key: "in-progress",
                          label: "Mark In Progress",
                          disabled: conv.status === "In Progress" || statusUpdatingId === conv.id,
                          onClick: () => handleStatusChange(conv.id, "IN_PROGRESS")
                        },
                        {
                          key: "resolved",
                          label: "Mark Resolved",
                          disabled: conv.status === "Resolved" || statusUpdatingId === conv.id,
                          onClick: () => handleStatusChange(conv.id, "RESOLVED")
                        },
                        {
                          key: "delete",
                          label: "Delete",
                          danger: true,
                          onClick: () => setDeleteTarget({ id: conv.id, name: conv.fullname || "this user" })
                        }
                      ]}
                    />
                  </div>
                </div>
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
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {conversations.find((c) => c.id === activeId)?.fullname || "Support Chat"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {conversations.find((c) => c.id === activeId)?.email}
                  </p>
                  <p className="text-[11px] text-gray-400">{formatDateTime(activeConversation?.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {activeConversation && <StatusBadge status={activeConversation.status} />}
                  {activeConversation?.status !== "In Progress" && activeConversation?.status !== "Resolved" && (
                    <button
                      onClick={() => handleStatusChange(activeId, "IN_PROGRESS")}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                      In Progress
                    </button>
                  )}
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
                {!threadLoading && messages.length > 0 && (
                  <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl px-4 py-2.5">
                    <p className="text-[11px] font-semibold text-[#3E3A74] uppercase tracking-wide">Original Question</p>
                    <p className="text-sm text-[#111827] mt-1 whitespace-pre-line break-words">
                      {messages[0].message || messages[0].text}
                    </p>
                  </div>
                )}
                {!threadLoading &&
                  messages.map((msg) => {
                    const isAdmin = msg.sender_type === "admin" || msg.sender === "admin";
                    return (
                      <div key={msg.id} className={`max-w-[75%] ${isAdmin ? "ml-auto" : ""}`}>
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                            isAdmin
                              ? "bg-[#7393D3] text-white rounded-br-sm"
                              : "bg-white border border-[#E5E7EB] text-[#111827] rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-line break-words">{msg.message || msg.text}</p>
                        </div>
                        <p className={`text-[11px] text-gray-400 mt-1 ${isAdmin ? "text-right" : "text-left"}`}>
                          {isAdmin ? "You (Admin)" : "User"} · {formatDateTime(msg.created_at)}
                        </p>
                      </div>
                    );
                  })}
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
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Support Conversation"
        message="Are you sure you want to delete this support conversation?"
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        danger
        onCancel={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={handleDeleteConfirm}
      />
    </AdminLayout>
  );
};
export default AdminSupport;