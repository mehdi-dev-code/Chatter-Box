import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, File } from "lucide-react";
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

    if (file.size > 10 * 1024 * 1024) {
      // 10 MB limit
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
        formData.append("file", filePreview);
      }

      await sendMessage(formData);

      // Clear form
      setText("");
      removeFile();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setText((prevMessage) => prevMessage + emojiObject.emoji);
  };

  return (
    <div className="p-4 w-full">
      {filePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <p className="text-sm text-gray-500">{filePreview.name}</p>
            <button
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className="btn btn-circle"
            onClick={() => fileInputRef.current?.click()}
          >
            <File size={20} />
          </button>

          <button
            type="button"
            className="btn btn-circle"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            😀
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-10">
              <Picker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !filePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
