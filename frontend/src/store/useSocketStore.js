import { create } from "zustand";
import { io } from "socket.io-client";

export const useSocketStore = create((set) => ({
  socket: null,
  connectSocket: (userId) => {
    if (!userId) return;

    const socket = io("http://localhost:9001", {
      query: { userId },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

    set({ socket });
    return socket;
  },
}));
