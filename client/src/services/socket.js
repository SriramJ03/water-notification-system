import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL = "https://water-notification-system.onrender.com";

export const connectSocket = (token) => {
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};