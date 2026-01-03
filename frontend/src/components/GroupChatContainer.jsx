import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import GroupMembersModal from "./GroupMembersModal";

const GroupChatContainer = ({ group }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/groups/${group._id}/messages`);
        setMessages(res.data);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    if (group) fetchMessages();
  }, [group]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.groupId === group._id) setMessages((prev) => [...prev, msg]);
    };
    socket.on("newGroupMessage", handler);
    return () => socket.off("newGroupMessage", handler);
  }, [socket, group]);

  useEffect(() => {
    if (messageEndRef.current) messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await axiosInstance.post(`/groups/${group._id}/messages`, { text: input });
      setMessages((prev) => [...prev, res.data]);
      setInput("");
    } catch {
      // Optionally handle error (e.g., show toast)
    }
  };

  if (!group) return <div className="flex-1 p-4">Select a group to chat.</div>;
  if (loading) return <div className="flex-1 p-4">Loading messages...</div>;

  const isAdmin = group.admins && group.admins.includes(authUser._id);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="p-2 border-b font-bold flex items-center justify-between">
        <span>{group.name}</span>
        <button className="btn btn-xs btn-outline" onClick={() => setShowMembers(true)}>Members</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg._id} className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`} ref={messageEndRef}>
            <div className="chat-bubble">{msg.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-2 border-t flex gap-2">
        <input className="input input-bordered flex-1" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
        <button className="btn btn-primary" type="submit">Send</button>
      </form>
      {showMembers && (
        <GroupMembersModal
          group={group}
          isAdmin={isAdmin}
          onClose={() => setShowMembers(false)}
          onMemberChange={() => setShowMembers(false)}
        />
      )}
    </div>
  );
};

export default GroupChatContainer;
