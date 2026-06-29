import { io } from "socket.io-client";

let socket = null;

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://water-notification-system.onrender.com";

export const connectSocket = (token) => {
  socket = io(API_URL, {
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