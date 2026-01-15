import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Send, X, File, Smile, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import Picker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 10 MB limit as per your requirement
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10 MB");
      return;
    }

    setFilePreview(file);
  };

  const removeFile = () => {
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !filePreview) return;

    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      if (filePreview) {
        formData.append("file", filePreview); // Key must match backend Multer config
      }

      await sendMessage(formData);

      // Clear form on success
      setText("");
      removeFile();
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="p-4 w-full relative">
      {/* IMPROVED: Better File Preview UI for Docs/Images */}
      {filePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex items-center gap-2 p-2 bg-slate-800 rounded-lg border border-slate-700">
            <Paperclip className="size-4 text-blue-400" />
            <span className="text-xs text-slate-300 truncate max-w-[150px]">
              {filePreview.name}
            </span>
            <button
              onClick={removeFile}
              className="ml-1 text-rose-500 hover:text-rose-400"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md bg-slate-800"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          {/* UPDATED: Added accept types */}
          <input
            type="file"
            accept="image/*,application/pdf,.doc,.docx,.txt"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={`btn btn-circle btn-sm sm:btn-md ${filePreview ? "text-blue-400" : "text-slate-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <File size={20} />
          </button>

          <button
            type="button"
            className="btn btn-circle btn-sm sm:btn-md text-slate-400"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <Smile size={20} />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-50">
              <Picker onEmojiClick={handleEmojiClick} theme="dark" />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="btn btn-circle btn-sm sm:btn-md btn-primary"
          disabled={!text.trim() && !filePreview}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;