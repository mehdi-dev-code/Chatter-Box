import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupSidebar from "../components/GroupSidebar";
import GroupChatContainer from "../components/GroupChatContainer";

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const [selectedGroup, setSelectedGroup] = React.useState(null);

  // FIX: Clear group selection if a user is selected from the global store
  useEffect(() => {
    if (selectedUser) {
      setSelectedGroup(null);
    }
  }, [selectedUser]);

  const handleGroupSelect = (group) => {
    setSelectedUser(null); // Clear the user selection in global store
    setSelectedGroup(group); // Set the local group
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-7xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            
            {/* Left Sidebar: Individual Contacts */}
            <Sidebar />

            {/* Middle Sidebar: Group List */}
            <GroupSidebar onSelectGroup={handleGroupSelect} />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50">
              {selectedGroup ? (
                <GroupChatContainer group={selectedGroup} />
              ) : selectedUser ? (
                <ChatContainer />
              ) : (
                <NoChatSelected />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
