import mongoose from 'mongoose';

const voiceNoteSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    chatId: { type: String, required: true },
    filePath: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// ✅ ES Module default export
export default mongoose.model('VoiceNote', voiceNoteSchema);
