import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const GroupMembersModal = ({ group, onClose, isAdmin, onMemberChange }) => {
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/groups/my-groups`);
        const thisGroup = res.data.find(g => g._id === group._id);
        setMembers(thisGroup ? thisGroup.members : []);
      } catch {
        // Optionally handle error
      }
      setLoading(false);
    };
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get(`/messages/users`);
        setUsers(res.data);
      } catch {
        // Optionally handle error
      }
    };
    fetchMembers();
    fetchUsers();
  }, [group]);

  const handleAdd = async (userId) => {
    setAdding(true);
    try {
      await axiosInstance.post(`/groups/add-member`, { groupId: group._id, userId });
      toast.success("Member added");
      onMemberChange();
    } catch {
      toast.error("Failed to add member");
    }
    setAdding(false);
  };

  const handleRemove = async (userId) => {
    setAdding(true);
    try {
      await axiosInstance.post(`/groups/remove-member`, { groupId: group._id, userId });
      toast.success("Member removed");
      onMemberChange();
    } catch {
      toast.error("Failed to remove member");
    }
    setAdding(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-4">Group Members</h2>
        {loading ? <div>Loading...</div> : (
          <ul className="mb-4">
            {members.map(member => (
              <li key={member._id} className="flex items-center justify-between mb-2">
                <span>{member.fullName || member.email}</span>
                {isAdmin && (
                  <button className="btn btn-xs btn-error" onClick={() => handleRemove(member._id)} disabled={adding}>Remove</button>
                )}
              </li>
            ))}
          </ul>
        )}
        {isAdmin && (
          <>
            <h3 className="font-bold mb-2">Add Member</h3>
            <ul>
              {users.filter(u => !members.some(m => m._id === u._id)).map(user => (
                <li key={user._id} className="flex items-center justify-between mb-2">
                  <span>{user.fullName || user.email}</span>
                  <button className="btn btn-xs btn-primary" onClick={() => handleAdd(user._id)} disabled={adding}>Add</button>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="flex justify-end mt-4">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
