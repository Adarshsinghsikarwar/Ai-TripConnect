import { verifyAccessToken } from '../utils/token.util.js';
import messageService from '../services/message.service.js';
import logger from '../utils/logger.js';

// Auth middleware for the socket handshake — same access token used for REST.
// Without this, anyone could connect and listen/emit on any booking room.
function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication token missing'));

  try {
    const payload = verifyAccessToken(token);
    socket.userId = payload.sub;
    next();
  } catch {
    next(new Error('Authentication token invalid or expired'));
  }
}

function registerChatHandlers(io) {
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    socket.on('join_booking', (bookingId) => {
      // Room per booking — message.service still re-validates participation
      // server-side on every send, so joining a room alone grants no access.
      socket.join(`booking:${bookingId}`);
    });

    socket.on('send_message', async ({ bookingId, text }, ack) => {
      try {
        const message = await messageService.send(socket.userId, bookingId, text);
        io.to(`booking:${bookingId}`).emit('new_message', message);
        if (ack) ack({ success: true });
      } catch (err) {
        logger.error(`Socket message error: ${err.message}`);
        if (ack) ack({ success: false, message: err.message });
      }
    });

    socket.on('leave_booking', (bookingId) => {
      socket.leave(`booking:${bookingId}`);
    });
  });
}

export default registerChatHandlers;