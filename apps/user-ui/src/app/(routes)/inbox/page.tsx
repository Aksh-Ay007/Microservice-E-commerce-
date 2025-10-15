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
  const { user, isLoading: userLoading } = useRequireAuth();
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const conversationId = searchParams.get("conversationId");
  const { ws, unreadCounts } = useWebSocket();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/chatting/api/get-user-conversations`,
        isProtected
      );
      return res.data.conversations;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await axiosInstance.get(
        `/chatting/api/get-messages/${conversationId}?page=1`,
        isProtected
      );
      setPage(1);
      setHasMore(res.data.hasMore);
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });

  const loadMoreMessages = async () => {
    const nextPage = page + 1;

    const res = await axiosInstance.get(
      `/chatting/api/get-messages/${conversationId}?page=${nextPage}`,
      isProtected
    );

    queryClient.setQueryData(["messages", conversationId], (oldData: any) => [
      ...res.data.messages.reverse(),
      ...oldData,
    ]);

    setPage(nextPage);
    setHasMore(res.data.hasMore);
  };

  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }

    console.log("conversationId:", conversationId);
    console.log("chats:", chats);
  }, [conversationId, chats]);

  useEffect(() => {
    if (messages?.length > 0) scrollToBottom();
  }, [messages]);

  const handleChatSelect = (chat: any) => {
    setHasFetchedOnce(false);
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === chat.conversationId ? { ...c, unseenCount: 0 } : c
      )
    );
    router.push(`?conversationId=${chat.conversationId}`);

    ws?.send(
      JSON.stringify({
        type: "MARK_AS_SEEN",
        conversationId: chat.conversationId,
      })
    );
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    });
  };

  const handleSend = async (e: any) => {
    e.preventDefault();

    if (!message.trim() || !selectedChat) return;

    const payload = {
      fromUserId: user?.id,
      toUserId: selectedChat?.seller?.id,
      conversationId: selectedChat?.conversationId,
      messageBody: message,
      senderType: "user",
    };

    ws?.send(JSON.stringify(payload));

    queryClient.setQueryData(
      ["messages", selectedChat?.conversationId],
      (old: any = []) => [
        ...old,
        {
          content: payload.messageBody,
          senderType: "user",
          seen: false,
          createdAt: new Date().toISOString(),
        },
      ]
    );

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.conversationId
          ? { ...chat, lastMessage: payload.messageBody }
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
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-slate-400"
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
                              "https://ik.imagekit.io/AkshayMicroMart/photo/selleravatar.jpg?updatedAt=1760470207009"
                            }
                            alt={chat.seller?.name}
                            width={44}
                            height={44}
                            className="rounded-full w-[44px] h-[44px] object-cover ring-2 ring-white shadow-sm"
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
                        "https://ik.imagekit.io/AkshayMicroMart/photo/selleravatar.jpg?updatedAt=1760470207009"
                      }
                      alt={selectedChat.seller?.name}
                      width={48}
                      height={48}
                      className="rounded-full w-[48px] h-[48px] object-cover ring-2 ring-slate-100 shadow-sm"
                    />
                    {selectedChat.seller?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-slate-800 font-bold text-base">
                      {selectedChat.seller?.name}
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedChat.seller?.isOnline
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      ></span>
                      {selectedChat.seller?.isOnline ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgb(203 213 225 / 0.1) 1px, transparent 0)`,
                    backgroundSize: "24px 24px",
                  }}
                >
                  {hasMore && (
                    <div className="flex justify-center mb-4">
                      <button
                        onClick={loadMoreMessages}
                        className="text-xs px-5 py-2 bg-white text-indigo-600 font-medium rounded-full hover:bg-indigo-50 transition-all shadow-sm border border-indigo-100"
                      >
                        Load previous messages
                      </button>
                    </div>
                  )}

                  {messages?.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.senderType === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] ${
                          msg.senderType === "user"
                            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50"
                            : "bg-white text-slate-800 shadow-md border border-slate-100"
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

                      <div
                        className={`text-[10px] text-slate-400 mt-1.5 font-medium ${
                          msg.senderType === "user" ? "mr-2" : "ml-2"
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
                  <div ref={scrollAnchorRef} />
                </div>

                {/* Chat Input */}
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSendMessage={handleSend}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-indigo-400"
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
                <h3 className="text-slate-600 font-semibold text-lg mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm text-slate-400">
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
