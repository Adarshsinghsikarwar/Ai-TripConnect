/**
 * lib/socket.js
 * Socket.IO client setup for real-time chat.
 *
 * We create one socket instance and export a helper to connect/disconnect.
 * Socket events for chat are handled inside the ChatWindow component.
 */
import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket = null;

/**
 * Get (or create) the socket instance.
 * Pass the access token so the backend can authenticate the socket connection.
 */
export function getSocket(token) {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      transports: ["websocket"],
    });
  }
  return socket;
}

/**
 * Connect the socket (call after login).
 */
export function connectSocket(token) {
  const s = getSocket(token);
  if (!s.connected) {
    if (token) s.auth = { token };
    s.connect();
  }
  return s;
}

/**
 * Disconnect the socket (call on logout).
 */
export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
}

export default getSocket;
