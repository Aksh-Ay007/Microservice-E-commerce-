"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../../context/web-socket-context";
import useRequireAuth from "../../../hooks/useRequiredAuth";
import ChatInput from "../../../shared/components/chats/chatinput";
import axiosInstance from "../../../utils/axiosinstance";
import { isProtected } from "../../../utils/protected";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useRequireAuth();
  const { ws } = useWebSocket();

  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");

  const conversationId = searchParams.get("conversationId");

  // ✅ Fetch Conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["user-conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/chatting/api/get-user-conversations`,
        isProtected
      );
      return res.data.conversations;
    },
  });

  // ✅ Fetch Messages
  const { data: messages = [] } = useQuery({
    queryKey: ["user-messages", conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await axiosInstance.get(
        `/chatting/api/get-messages/${conversationId}?page=1`,
        isProtected
      );
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });

  // ✅ Auto-scroll to bottom
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop =
            messageContainerRef.current.scrollHeight;
        }
      }, 50);
    });
  };

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length, conversationId]);

  // ✅ Sync conversations
  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

  // ✅ WebSocket Events
  // Replace your useEffect for WebSocket Events with this:

useEffect(() => {
  if (!ws) return;

  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    if (data.type === "NEW_MESSAGE") {
      const newMsg = data.payload;

      // ✅ FIX: Only add message if it's NOT from the current user
      if (newMsg.conversationId === conversationId && newMsg.senderType !== "user") {
        queryClient.setQueryData(
          ["user-messages", conversationId],
          (old: any = []) => [
            ...old,
            {
              content: newMsg.messageBody || newMsg.content || "",
              senderType: newMsg.senderType,
              createdAt: new Date().toISOString(),
            },
          ]
        );
        scrollToBottom();
      }

      // Sidebar updates (keep this as is)
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.conversationId === newMsg.conversationId
            ? {
                ...chat,
                lastMessage: newMsg.content || newMsg.messageBody,
                unseenCount:
                  newMsg.conversationId === conversationId
                    ? 0
                    : (chat.unseenCount || 0) + 1,
                seller: {
                  ...chat.seller,
                  isOnline:
                    newMsg.senderType === "seller"
                      ? true
                      : chat.seller?.isOnline,
                },
              }
            : chat
        )
      );
    }

    if (data.type === "UNSEEN_COUNT_UPDATE") {
      const { conversationId, count } = data.payload;
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.conversationId === conversationId
            ? { ...chat, unseenCount: count }
            : chat
        )
      );
    }

    if (data.type === "ONLINE_STATUS_UPDATE") {
      const { sellerId, isOnline } = data.payload;
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.seller?.id === sellerId
            ? { ...chat, seller: { ...chat.seller, isOnline } }
            : chat
        )
      );
    }
  };

  ws.addEventListener("message", handleMessage);
  return () => ws.removeEventListener("message", handleMessage);
}, [ws, conversationId, queryClient]);

  // ✅ Select Chat
  const handleChatSelect = (chat: any) => {
    setHasFetchedOnce(false);
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === chat.conversationId ? { ...c, unseenCount: 0 } : c
      )
    );

    router.push(`?conversationId=${chat.conversationId}`);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "MARK_AS_SEEN",
          conversationId: chat.conversationId,
        })
      );
    }
  };

  // ✅ Send Message (single send fix)
  const handleSend = async (e: any) => {
    e.preventDefault();
    if (
      !message.trim() ||
      !selectedChat ||
      !ws ||
      ws.readyState !== WebSocket.OPEN
    )
      return;

    const payload = {
      fromUserId: user?.id,
      toUserId: selectedChat?.seller?.id,
      conversationId: selectedChat?.conversationId,
      messageBody: message,
      senderType: "user",
    };

    ws.send(JSON.stringify(payload));

    // Optimistic update
    queryClient.setQueryData(
      ["user-messages", selectedChat.conversationId],
      (old: any = []) => [
        ...old,
        {
          content: message,
          senderType: "user",
          createdAt: new Date().toISOString(),
        },
      ]
    );

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.conversationId === selectedChat.conversationId
          ? { ...chat, lastMessage: message }
          : chat
      )
    );

    setMessage("");
    scrollToBottom();
  };

  const getLastMessage = (chat: any) => chat?.lastMessage || "";

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="md:w-[85%] lg:w-[80%] mx-auto pt-6 pb-8 px-4">
        <div className="flex h-[85vh] rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 bg-white">
          {/* Sidebar */}
          <div className="w-[340px] border-r border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Messages
              </h1>
              <p className="text-indigo-100 text-xs mt-1">
                Stay connected with sellers
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="inline-block w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-slate-500 mt-2">
                    Loading conversations...
                  </p>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-600 font-medium">
                    No conversations yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Start chatting with sellers
                  </p>
                </div>
              ) : (
                chats.map((chat) => {
                  const isActive =
                    selectedChat?.conversationId === chat.conversationId;

                  return (
                    <button
                      key={chat.conversationId}
                      onClick={() => handleChatSelect(chat)}
                      className={`w-full text-left px-5 py-4 transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600"
                          : "hover:bg-slate-50 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Image
                            src={
                              chat.seller?.avatar ||
                              "https://ik.imagekit.io/AkshayMicroMart/photo/selleravatar.jpg"
                            }
                            alt={chat.seller?.name}
                            width={44}
                            height={44}
                            className="rounded-full w-[44px] h-[44px] object-cover"
                          />
                          {chat.seller?.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-800 font-semibold truncate">
                              {chat.seller?.name}
                            </span>
                            {chat.unseenCount > 0 && (
                              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                                {chat.unseenCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {getLastMessage(chat)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-white">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-5 border-b border-slate-200 bg-white shadow-sm flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={
                        selectedChat.seller?.avatar ||
                        "https://ik.imagekit.io/AkshayMicroMart/photo/selleravatar.jpg"
                      }
                      alt={selectedChat.seller?.name}
                      width={48}
                      height={48}
                      className="rounded-full w-[48px] h-[48px] object-cover"
                    />
                    {selectedChat.seller?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-slate-800 font-bold text-base">
                      {selectedChat.seller?.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {selectedChat.seller?.isOnline ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                >
                  {messages.map((msg: any, i: number) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.senderType === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] ${
                          msg.senderType === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-slate-800 border border-slate-100"
                        } px-4 py-3 rounded-2xl ${
                          msg.senderType === "user"
                            ? "rounded-br-md"
                            : "rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {msg.text || msg.content}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-medium">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>

                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSendMessage={handleSend}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
