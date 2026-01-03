import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import GroupCreateModal from "./GroupCreateModal";

const GroupSidebar = ({ onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/groups/my-groups");
      setGroups(res.data);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="p-2 min-w-[180px] border-r border-base-300 bg-base-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">Groups</h3>
        <button className="btn btn-xs btn-primary" onClick={() => setShowCreate(true)}>+ New</button>
      </div>
      {loading ? (
        <div className="p-2">Loading groups...</div>
      ) : !groups.length ? (
        <div className="p-2">No groups joined.</div>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group._id}>
              <button className="btn btn-ghost w-full text-left" onClick={() => onSelectGroup(group)}>
                {group.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {showCreate && (
        <GroupCreateModal
          onClose={() => setShowCreate(false)}
          onGroupCreated={() => { setShowCreate(false); fetchGroups(); }}
        />
      )}
    </div>
  );
};

export default GroupSidebar;
