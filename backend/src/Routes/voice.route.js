import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import VoiceNote from '../models/Voice.note.js';
import Message from '../models/message.model.js';
import { getReceiverSocketIds, io } from '../core/socket.js';

const router = express.Router();

// Multer setup to store audio files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/voices';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

// Upload voice note
router.post('/upload', upload.single('voice'), async (req, res) => {
    try {
        const { sender, chatId } = req.body;

        if (!sender || !chatId) {
            return res.status(400).json({ message: 'Missing sender or chatId' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No voice file uploaded' });
        }

        // Normalize file path (replace backslashes with forward slashes)
        const normalizedPath = req.file.path.replace(/\\/g, '/');

        // Save voice note to VoiceNote collection
        const newVoice = new VoiceNote({
            sender,
            chatId,
            filePath: normalizedPath
        });
        await newVoice.save();

        // Create message in Message collection
        const newMessage = new Message({
            senderId: sender,
            receiverId: chatId,
            voice: normalizedPath,
        });
        await newMessage.save();

        // Emit to receiver via socket
        const receiverSockets = getReceiverSocketIds(chatId);
        receiverSockets.forEach(socketId => {
            io.to(socketId).emit('newMessage', newMessage);
        });

        // Emit to sender's other sockets (multi-tab support)
        const senderSockets = getReceiverSocketIds(sender);
        senderSockets.forEach(socketId => {
            if (!receiverSockets.includes(socketId)) {
                io.to(socketId).emit('newMessage', newMessage);
            }
        });

        res.status(200).json({ 
            message: 'Voice note uploaded', 
            voice: newVoice,
            messageData: newMessage 
        });
    } catch (err) {
        console.error('Voice upload error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

// Serve voice files
router.get('/:filename', (req, res) => {
    const filePath = path.join('./uploads/voices', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(path.resolve(filePath));
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

export default router;

