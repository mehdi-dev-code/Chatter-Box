import { useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const useVoiceRecorder = ({ chatId, senderId, onSend, onCancel }) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('voice', audioBlob, 'voice.webm');
        formData.append('sender', senderId);
        formData.append('chatId', chatId);

        try {
          // Upload to backend
          const response = await axios.post('http://localhost:9001/api/voice/upload', formData);
          toast.success('Voice message sent!');
          
          if (onSend) onSend(response.data);
        } catch (err) {
          console.error('Error uploading voice:', err);
          toast.error('Failed to send voice message');
        }
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Microphone access denied');
    }
  };

  const stop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancel = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      audioChunksRef.current = [];
      
      // Stop all tracks to release microphone
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
    
    if (onCancel) onCancel();
  };

  return { start, stop, cancel };
};

export default useVoiceRecorder;
