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

          {/* =======================================
              LEFT SIDEBAR
          ======================================= */}

          <div className="col-span-4 bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">

            <div className="px-5 py-4 border-b">

              <h2 className="text-xl font-semibold">
                Support Conversations
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {conversations.length} Conversation
                {conversations.length !== 1 && "s"}
              </p>

            </div>

            <div className="flex-1 overflow-y-auto">

              {loadingConversations ? (

                <div className="h-full flex items-center justify-center">

                  <p className="text-gray-500">
                    Loading conversations...
                  </p>

                </div>

              ) : conversations.length === 0 ? (

                <div className="h-full flex items-center justify-center">

                  <p className="text-gray-500">
                    No conversations found.
                  </p>

                </div>

              ) : (

                conversations.map((conversation) => (

                  <div
                    key={conversation.id}
                    onClick={() =>
                      loadConversation(conversation)
                    }
                    className={`cursor-pointer border-b p-4 transition-all duration-200 hover:bg-gray-50 ${
                      selectedConversation?.id ===
                      conversation.id
                        ? "bg-indigo-50 border-l-4 border-[#7393D3]"
                        : ""
                    }`}
                  >

                    <div className="flex justify-between items-center">

                      <div>

                        <h3 className="font-semibold text-gray-800">
                          {conversation.fullname}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {conversation.email}
                        </p>

                      </div>

                      <span className="text-xs text-gray-400">

                        {new Date(
                          conversation.created_at
                        ).toLocaleDateString()}

                      </span>

                    </div>

                    <div className="mt-3 text-sm text-gray-600 line-clamp-2">

                      {conversation.last_message ||
                        "No messages yet"}

                    </div>

                  </div>

                ))

              )}

            </div>

          </div>
                    {/* =======================================
              RIGHT CHAT AREA
          ======================================= */}

          <div className="col-span-8 bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">

            {!selectedConversation ? (

              <div className="flex-1 flex items-center justify-center">

                <div className="text-center">

                  <h2 className="text-2xl font-semibold text-gray-800">
                    Select a Conversation
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Choose a conversation from the left to start chatting.
                  </p>

                </div>

              </div>

            ) : (

              <>

                {/* ================= HEADER ================= */}

                <div className="flex items-center justify-between w-full">

  <div>

    <h2 className="text-lg font-semibold">
      {selectedConversation.fullname}
    </h2>

    <p className="text-sm text-gray-500">
      {selectedConversation.email}
    </p>

  </div>

  {selectedConversation.status !== "Resolved" && (

    <button
      onClick={handleResolve}
      className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
    >
      Resolve
    </button>

  )}

  {selectedConversation.status === "Resolved" && (

    <span className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium">
      Resolved
    </span>

  )}

</div>


                {/* ================= MESSAGES ================= */}

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">

                  {loadingMessages ? (

                    <div className="flex justify-center items-center h-full">

                      <p className="text-gray-500">
                        Loading conversation...
                      </p>

                    </div>

                  ) : messages.length === 0 ? (

                    <div className="flex justify-center items-center h-full">

                      <p className="text-gray-500">
                        No messages yet.
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
                          className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                            msg.sender_type === "admin"
                              ? "bg-[#7393D3] text-white"
                              : "bg-white border text-gray-800"
                          }`}
                        >

                          <div className="whitespace-pre-wrap break-words text-sm">

                            {msg.message}

                          </div>

                          <div
                            className={`text-[11px] mt-2 ${
                              msg.sender_type === "admin"
                                ? "text-indigo-100"
                                : "text-gray-500"
                            }`}
                          >

                            {new Date(
                              msg.created_at
                            ).toLocaleString()}

                          </div>

                        </div>

                      </div>

                    ))

                  )}

                  <div ref={messageEndRef}></div>

                </div>


                {/* ================= INPUT ================= */}

                <div className="border-t p-4 bg-white">

                  <div className="flex gap-3">

                    <textarea
                      rows={2}
                      value={reply}
                      onChange={(e) =>
                        setReply(e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="Type your reply..."
                      className="flex-1 resize-none rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#7393D3]"
                    />

                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="px-8 rounded-xl bg-[#7393D3] text-white hover:opacity-90 disabled:opacity-60"
                    >

                      {sending
                        ? "Sending..."
                        : "Send"}

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