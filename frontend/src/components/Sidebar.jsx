import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  // Get both onlineUsers and authUser from useAuthStore
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // 1. FILTER: Exclude the logged-in user from the sidebar list so you don't chat with yourself
  const allOtherUsers = users.filter(user => user._id !== authUser?._id);

  // 2. FILTER: Apply the "Online Only" toggle logic
  const filteredUsers = showOnlineOnly
    ? allOtherUsers.filter((user) => onlineUsers.includes(user._id))
    : allOtherUsers;

  // 3. LOGIC: Prevent negative online count (0 - 1 = -1) by using Math.max
  const onlineCount = Math.max(0, onlineUsers.length - 1);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-slate-700 bg-slate-900 flex flex-col transition-all duration-200">
      <div className="border-b border-slate-700 w-full p-5 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="flex items-center gap-2 justify-center lg:justify-start">
          <Users className="size-6 text-blue-400" />
          <span className="font-semibold hidden lg:block text-slate-100">Contacts</span>
        </div>
        
        {/* Toggle - Hidden on mobile to keep the sidebar clean */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary"
            />
            <span className="text-sm text-slate-300">Show online only</span>
          </label>
          <span className="text-xs text-slate-500">({onlineCount} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              transition-colors
              ${selectedUser?._id === user._id 
                ? "bg-slate-800 ring-1 ring-slate-700" 
                : "hover:bg-slate-800/50"}
            `}
          >
            <div className="relative mx-auto lg:mx-0 flex-shrink-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full border border-slate-700"
              />
              {/* Green indicator for online status */}
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-slate-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="font-medium truncate text-slate-100">{user.fullName}</div>
              <div className={`text-xs ${onlineUsers.includes(user._id) ? "text-green-400" : "text-slate-500"}`}>
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-slate-500 py-8 px-4">
            {showOnlineOnly ? "No online users" : "No contacts found"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
