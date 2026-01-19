import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  Send,
  X,
  File,
  Smile,
  Paperclip,
  Mic,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Picker from "emoji-picker-react";
import useVoiceRecorder from "./VoiceRecorder"; // ✅ Fixed import

const MessageInput = () => {
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Voice states
  const [recording, setRecording] = useState(false);
  const [cancelRecording, setCancelRecording] = useState(false);
  const startX = useRef(0);

  const fileInputRef = useRef(null);

  const { sendMessage, selectedUser } = useChatStore();
  const { authUser } = useAuthStore();

  // ================= VOICE RECORDER =================
  const recorder = useVoiceRecorder({ // ✅ Fixed: using as hook
    chatId: selectedUser?._id,
    senderId: authUser?._id,
    onSend: () => {
      setRecording(false);
      setCancelRecording(false);
    },
    onCancel: () => {
      setRecording(false);
      setCancelRecording(false);
    },
  });

  // ================= FILE HANDLING =================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

  // ================= TEXT SEND =================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !filePreview) return;

    const formData = new FormData();
    formData.append("text", text.trim());
    if (filePreview) {
      formData.append("file", filePreview);
    }

    await sendMessage(formData);

    setText("");
    removeFile();
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const startRecording = (e) => {
    setRecording(true);
    setCancelRecording(false);
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
    recorder.start();
  };

  const moveRecording = (e) => {
    if (!recording) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    if (startX.current - x > 80) {
      setCancelRecording(true);
    }
  };

  const stopRecording = () => {
    if (!recording) return;

    if (cancelRecording) {
      recorder.cancel();
    } else {
      recorder.stop();
    }
  };

  // ================= UI =================
  return (
    <div className="p-4 w-full relative">
      {recording && (
        <p className="text-xs text-center text-slate-400 mb-2">
          {cancelRecording
            ? "Release to cancel"
            : "Recording… slide left to cancel"}
        </p>
      )}

      {filePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg border border-slate-700">
            <Paperclip className="size-4 text-blue-400" />
            <span className="text-xs text-slate-300 truncate max-w-[150px]">
              {filePreview.name}
            </span>
            <button onClick={removeFile} type="button">
              <X className="size-4 text-rose-500" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered bg-slate-800"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*,application/pdf,.doc,.docx,.txt"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className="btn btn-circle text-slate-400"
            onClick={() => fileInputRef.current?.click()}
          >
            <File size={18} />
          </button>

          <button
            type="button"
            className="btn btn-circle text-slate-400"
            onClick={() => setShowEmojiPicker((p) => !p)}
          >
            <Smile size={18} />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-50">
              <Picker onEmojiClick={handleEmojiClick} theme="dark" />
            </div>
          )}
        </div>

        {(text.trim() || filePreview) ? (
          <button type="submit" className="btn btn-circle btn-primary">
            <Send size={18} />
          </button>
        ) : (
          <button
            type="button"
            onMouseDown={startRecording}
            onMouseMove={moveRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchMove={moveRecording}
            onTouchEnd={stopRecording}
            className={`btn btn-circle ${
              recording ? "bg-red-500 text-white" : "btn-primary"
            }`}
          >
            {cancelRecording ? <Trash2 size={18} /> : <Mic size={18} />}
          </button>
        )}
      </form>
    </div>
  );
};

export default MessageInput;
