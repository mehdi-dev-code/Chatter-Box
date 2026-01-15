import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import CallUI from "./CallUI";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { FileIcon, DownloadCloud } from "lucide-react"; // Icons for files

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100">
      <ChatHeader />
      <CallUI />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col gap-2 bg-base-200 text-base-content shadow-sm">
              {/* IMAGE RENDERING */}
              {message.file && message.fileType?.startsWith("image/") && (
                <img
                  src={message.file}
                  alt="Attachment"
                  className="sm:max-w-[250px] rounded-md border border-base-300"
                />
              )}

              {/* DOCUMENT/FILE RENDERING */}
              {message.file && !message.fileType?.startsWith("image/") && (
                <div className="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-100">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <FileIcon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate max-w-[120px]">
                      {message.file.split("/").pop().split("?")[0] || "Attachment"}
                    </p>
                    <p className="text-[10px] opacity-60">Document</p>
                  </div>
                  <a
                    href={message.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="p-2 hover:bg-base-100 rounded-full transition-colors"
                  >
                    <DownloadCloud className="size-5 text-primary" />
                  </a>
                </div>
              )}

              {/* TEXT RENDERING */}
              {message.text && <p className="leading-relaxed">{message.text}</p>}
            </div>
            {/* Invisible div to help with scrolling */}
            <div ref={messageEndRef} />
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;