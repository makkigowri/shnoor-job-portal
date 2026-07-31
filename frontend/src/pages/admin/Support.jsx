import { useEffect, useRef, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import socket from "../../socket";

import {
  getSupportConversations,
  getSupportConversation,
  replySupportMessage,
  resolveSupportConversation,
} from "../../services/supportService";

export default function Support() {
  

  const [conversations, setConversations] = useState([]);

  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messages, setMessages] = useState([]);

  const [reply, setReply] = useState("");

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const messageEndRef = useRef(null);

  const scrollBottom = () => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };
  const loadConversations = async () => {
    try {

      setLoadingConversations(true);

      const data =
        await getSupportConversations();

      setConversations(
        data.conversations || []
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingConversations(false);

    }
  };
  const loadConversation = async (
    conversation
  ) => {

    try {

      setLoadingMessages(true);

      const data =
        await getSupportConversation(
          conversation.id
        );

      setSelectedConversation(
        data.conversation
      );

      setMessages(
        data.messages || []
      );

      socket.emit(
        "join-conversation",
        conversation.id
      );

      scrollBottom();

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingMessages(false);

    }

  };
    
  useEffect(() => {

    loadConversations();

  }, []);


  useEffect(() => {

    socket.connect();

    socket.emit("register", {
      role: "admin",
      userId: "admin",
    });

    return () => {

      socket.disconnect();

    };

  }, []);



  useEffect(() => {

    const receiveMessage = (message) => {

      if (
        selectedConversation &&
        message.ticket_id === selectedConversation.id
      ) {

        setMessages((prev) => [

          ...prev,

          message,

        ]);

        scrollBottom();

      }

      loadConversations();

    };

    socket.on(
      "support-message",
      receiveMessage
    );

    return () => {

      socket.off(
        "support-message",
        receiveMessage
      );

    };

  }, [selectedConversation]);

  const handleSend = async () => {

    if (!reply.trim()) return;

    if (!selectedConversation) return;

    try {

      setSending(true);

      await replySupportMessage(

        selectedConversation.id,

        reply

      );

      setMessages((prev) => [

        ...prev,

        {
          sender_type: "admin",
          message: reply,
          created_at: new Date(),
        },

      ]);

      setReply("");

      scrollBottom();

      loadConversations();

    } catch (err) {

      console.error(err);

    } finally {

      setSending(false);

    }

  };
  const handleResolve = async () => {

  if (!selectedConversation) return;

  try {

    await resolveSupportConversation(
      selectedConversation.id
    );

    setSelectedConversation((prev) => ({
      ...prev,
      status: "Resolved",
    }));

    loadConversations();

  } catch (err) {

    console.error(err);

  }

};

  const handleKeyDown = (e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      handleSend();

    }
  };
    return (

    <AdminLayout>

      <div className="h-[calc(100vh-90px)] p-6">

        <div className="grid grid-cols-12 gap-6 h-full">

         

<div className="col-span-4 flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

  

  <div className="border-b border-gray-100 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] px-6 py-5">

    <h2 className="text-xl font-bold text-[#3E3A74]">
      Support Conversations
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      {conversations.length} Conversation
      {conversations.length !== 1 && "s"}
    </p>

  </div>

  {/* Conversation List */}

  <div className="flex-1 overflow-y-auto">

    {loadingConversations ? (

      <div className="flex h-full flex-col items-center justify-center gap-3">

        <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#7393D3]/30 border-t-[#7393D3]" />

        <p className="font-medium text-[#7393D3]">
          Loading conversations...
        </p>

      </div>

    ) : conversations.length === 0 ? (

      <div className="flex h-full flex-col items-center justify-center">

        <div className="mb-4 h-16 w-16 rounded-2xl bg-[#EEF1FB]" />

        <h3 className="font-semibold text-[#3E3A74]">
          No Conversations
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          New support requests will appear here.
        </p>

      </div>

    ) : (

      conversations.map((conversation) => (

        <div
          key={conversation.id}
          onClick={() => loadConversation(conversation)}
          className={`group cursor-pointer border-b border-gray-100 p-5 transition-all duration-300 hover:bg-[#EEF1FB]/40 ${
            selectedConversation?.id === conversation.id
              ? "border-l-4 border-[#7393D3] bg-[#EEF1FB]"
              : ""
          }`}
        >

          <div className="flex items-start gap-4">

            {/* Avatar */}

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7393D3] text-sm font-bold text-white">

              {conversation.fullname
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}

            </div>

            <div className="min-w-0 flex-1">

              <div className="flex items-center justify-between">

                <h3 className="truncate font-semibold text-[#3E3A74]">

                  {conversation.fullname}

                </h3>

                <span className="text-xs text-gray-400">

                  {new Date(
                    conversation.created_at
                  ).toLocaleDateString()}

                </span>

              </div>

              <p className="truncate text-sm text-gray-500">

                {conversation.email}

              </p>

              <div className="mt-3 flex items-center justify-between">

                <p className="line-clamp-2 text-sm text-gray-600">

                  {conversation.last_message ||
                    "No messages yet"}

                </p>

                {selectedConversation?.id === conversation.id && (

                  <span className="ml-3 h-2.5 w-2.5 rounded-full bg-[#7393D3]" />

                )}

              </div>

            </div>

          </div>

        </div>

      ))

    )}

  </div>

</div>
                   

          {/* =======================================
    RIGHT CHAT AREA
======================================= */}

<div className="col-span-8 flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

  {!selectedConversation ? (

    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-white to-[#EEF1FB]">

      <div className="text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF1FB]">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#7393D3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h8M8 14h5m7-2c0 4.418-3.582 8-8 8a8.841 8.841 0 01-4-.93L4 20l.93-3.07A8.841 8.841 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
            />
          </svg>

        </div>

        <h2 className="text-2xl font-bold text-[#3E3A74]">
          Select a Conversation
        </h2>

        <p className="mt-2 text-gray-500">
          Choose a support conversation from the left panel.
        </p>

      </div>

    </div>

  ) : (

    <>

      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] px-7 py-5">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7393D3] font-bold text-white">

            {selectedConversation.fullname
              ?.split(" ")
              .map((w) => w[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}

          </div>

          <div>

            <h2 className="text-lg font-bold text-[#3E3A74]">
              {selectedConversation.fullname}
            </h2>

            <p className="text-sm text-gray-500">
              {selectedConversation.email}
            </p>

          </div>

        </div>

        {selectedConversation.status !== "Resolved" ? (

          <button
            onClick={handleResolve}
            className="rounded-xl bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700"
          >
            Resolve
          </button>

        ) : (

          <span className="rounded-xl bg-green-100 px-4 py-2 font-medium text-green-700">
            ✓ Resolved
          </span>

        )}

      </div>

      {/* CHAT */}

      <div className="flex-1 overflow-y-auto bg-[#F8FAFD] p-6 space-y-5">

        {loadingMessages ? (

          <div className="flex h-full items-center justify-center">

            <div className="flex items-center gap-3">

              <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-[#7393D3]/30 border-t-[#7393D3]" />

              <span className="font-medium text-[#7393D3]">
                Loading conversation...
              </span>

            </div>

          </div>

        ) : messages.length === 0 ? (

          <div className="flex h-full flex-col items-center justify-center">

            <div className="mb-4 h-16 w-16 rounded-full bg-[#EEF1FB]" />

            <h3 className="font-semibold text-[#3E3A74]">
              No Messages Yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Start replying to this support ticket.
            </p>

          </div>

        ) : (

          messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.sender_type === "admin"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-[70%] rounded-3xl px-5 py-4 shadow-sm ${
                  msg.sender_type === "admin"
                    ? "bg-[#7393D3] text-white"
                    : "border border-gray-100 bg-white text-gray-800"
                }`}
              >

                <p className="whitespace-pre-wrap break-words text-sm leading-6">

                  {msg.message}

                </p>

                <p
                  className={`mt-3 text-[11px] ${
                    msg.sender_type === "admin"
                      ? "text-indigo-100"
                      : "text-gray-400"
                  }`}
                >

                  {new Date(msg.created_at).toLocaleString()}

                </p>

              </div>

            </div>

          ))

        )}

        <div ref={messageEndRef}></div>

      </div>

      {/* INPUT */}

      <div className="border-t border-gray-100 bg-white p-5">

        <div className="flex items-end gap-4">

          <textarea
            rows={2}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your reply..."
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-5 py-3 outline-none transition focus:border-[#7393D3] focus:ring-2 focus:ring-[#7393D3]/20"
          />

          <button
            onClick={handleSend}
            disabled={sending}
            className="rounded-2xl bg-[#7393D3] px-8 py-3 font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6488cf] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send"}
          </button>

        </div>

      </div>

    </>

  )}

</div>

        </div>

      </div>

    </AdminLayout>

  );

}