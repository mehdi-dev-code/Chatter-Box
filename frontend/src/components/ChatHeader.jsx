import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Call and Close buttons */}
        <div className="flex gap-2">
          <button title="Start Call" className="btn btn-sm btn-circle btn-primary">
            {/* Simple phone icon (SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.25a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v1.5a12.75 12.75 0 01-12.75-12.75v-1.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v2.25A2.25 2.25 0 002.25 6.75z" />
            </svg>
          </button>
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
