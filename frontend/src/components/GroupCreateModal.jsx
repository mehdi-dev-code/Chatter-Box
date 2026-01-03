import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const GroupCreateModal = ({ onClose, onGroupCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/groups/create", { name, description, members: [] });
      toast.success("Group created!");
      onGroupCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form className="bg-base-100 p-6 rounded-lg shadow-lg w-80" onSubmit={handleSubmit}>
        <h2 className="font-bold text-lg mb-4">Create Group</h2>
        <input className="input input-bordered w-full mb-2" placeholder="Group Name" value={name} onChange={e => setName(e.target.value)} required />
        <textarea className="textarea textarea-bordered w-full mb-2" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Creating..." : "Create"}</button>
        </div>
      </form>
    </div>
  );
};

export default GroupCreateModal;
