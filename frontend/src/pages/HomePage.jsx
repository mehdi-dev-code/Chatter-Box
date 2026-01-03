import React from "react";
import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupSidebar from "../components/GroupSidebar";
import GroupChatContainer from "../components/GroupChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [selectedGroup, setSelectedGroup] = React.useState(null);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            <GroupSidebar onSelectGroup={group => { setSelectedGroup(group); }} />
            <div className="flex-1 flex flex-col">
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
