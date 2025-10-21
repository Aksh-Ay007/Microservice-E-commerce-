"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../../../context/web-socket-context";
import useSeller from "../../../../hooks/useSeller";
import ChatInput from "../../../../shared/components/chats/chatinput";
import axiosInstance from "../../../../utils/axiosinstance";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const { seller } = useSeller();
  const conversationId = searchParams.get("conversationId");
  const { ws } = useWebSocket();
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const queryClient = useQueryClient();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await axiosInstance.get(
        `/chatting/api/get-seller-messages/${conversationId}?page=1`
      );
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    const timeout = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeout);
  }, [conversationId, messages.length]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const container = messageContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
    });
  };

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/chatting/api/get-seller-conversations`
      );
      return res.data.conversations;
    },
  });

  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "NEW_MESSAGE") {
        const newMsg = data?.payload;

        // ✅ FIX: Only add message if it's NOT from the current seller
        if (
          newMsg.conversationId === conversationId &&
          newMsg.senderType !== "seller"
        ) {
          queryClient.setQueryData(
            ["messages", conversationId],
            (old: any = []) => [
              ...old,
              {
                content: newMsg.messageBody || newMsg.content || "",
                senderType: newMsg.senderType,
                seen: false,
                createdAt: new Date().toISOString(),
              },
            ]
          );
          scrollToBottom();
        }

        // Sidebar updates
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === newMsg.conversationId
              ? { ...chat, lastMessage: newMsg.content || newMsg.messageBody }
              : chat
          )
        );
      }

      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data?.payload;

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === conversationId
              ? { ...chat, unseenCount: count }
              : chat
          )
        );
      }
    };
  }, [ws, conversationId, queryClient]);

  const handleChatSelect = (chat: any) => {
    setHasFetchedOnce(false);
    setChats((prevChats) =>
      prevChats.map((c) =>
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
      fromUserId: seller?.id,
      toUserId: selectedChat.user.id,
      messageBody: message,
      conversationId: selectedChat.conversationId,
      senderType: "seller",
    };

    ws.send(JSON.stringify(payload));

    queryClient.setQueryData(
      ["messages", selectedChat?.conversationId],
      (old: any = []) => [
        ...old,
        {
          content: payload.messageBody,
          senderType: "seller",
          seen: false,
          createdAt: new Date().toISOString(),
        },
      ]
    );

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.conversationId === selectedChat.conversationId
          ? { ...chat, lastMessage: payload.messageBody }
          : chat
      )
    );

    setMessage("");
    scrollToBottom();
  };

  const getLastMessage = (chat: any) => chat?.lastMessage || "";

  return (
    <div className="w-full min-h-screen p-4 sm:p-8 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row h-[85vh] rounded-lg shadow-2xl overflow-hidden bg-gray-900">
          {/* Sidebar */}
          <div className="w-full lg:w-[340px] border-r border-gray-800 bg-gray-900 flex-shrink-0">
            <div className="p-5 border-b border-gray-800 bg-gray-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-white">
                    Messages
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {chats.length} conversation{chats.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {(() => {
                  const totalUnread = chats.reduce(
                    (total, chat) => total + (chat.unseenCount || 0),
                    0
                  );
                  return totalUnread > 0 ? (
                    <div className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded-full flex-shrink-0">
                      {totalUnread}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-400 mt-2">
                    Loading conversations...
                  </p>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-300 font-medium">
                    No conversations yet
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Start chatting with users
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
                          ? "bg-gray-800 border-l-4 border-blue-600"
                          : "hover:bg-gray-800/50 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Image
                            src={
                              chat.user?.avatar.url ||
                              "https://ik.imagekit.io/AkshayMicroMart/photo/useravatar.jpg?updatedAt=1760470134415"
                            }
                            alt={chat.user?.name}
                            width={44}
                            height={44}
                            className="rounded-full w-[44px] h-[44px] object-cover ring-2 ring-gray-700"
                          />
                          {chat.user?.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 ring-2 ring-gray-900" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white font-semibold truncate">
                              {chat.user?.name}
                            </span>
                            {chat.unseenCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                                {chat.unseenCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate">
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
          <div className="flex-1 flex flex-col bg-gray-950 min-h-0">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-5 border-b border-gray-800 bg-gray-900 flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <Image
                      src={
                        selectedChat. user?.avatar.url ||
                        "https://ik.imagekit.io/AkshayMicroMart/photo/useravatar.jpg?updatedAt=1760470134415"
                      }
                      alt={selectedChat.user?.name}
                      width={40}
                      height={40}
                      className="rounded-full w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] object-cover ring-2 ring-gray-700"
                    />
                    {selectedChat.user?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-green-500 ring-2 ring-gray-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-semibold text-sm sm:text-base truncate">
                      {selectedChat.user?.name}
                    </h2>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedChat.user?.isOnline
                            ? "bg-green-500"
                            : "bg-gray-600"
                        }`}
                      ></span>
                      {selectedChat.user?.isOnline ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gray-950"
                >
                  {messages?.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.senderType === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] ${
                          msg.senderType === "seller"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-white border border-gray-700"
                        } px-3 py-2 sm:px-4 sm:py-3 rounded-lg ${
                          msg.senderType === "seller"
                            ? "rounded-br-sm"
                            : "rounded-bl-sm"
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed break-words">
                          {msg.text || msg.content}
                        </p>
                      </div>

                      <div
                        className={`text-[10px] text-gray-500 mt-1.5 font-medium ${
                          msg.senderType === "seller" ? "mr-2" : "ml-2"
                        }`}
                      >
                        {msg.time ||
                          new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSendMessage={handleSend}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="w-24 h-24 mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-300 font-semibold text-lg mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm text-gray-500">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
