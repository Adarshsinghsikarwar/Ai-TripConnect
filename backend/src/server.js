import http from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import connectDB from './config/db.js';
import registerChatHandlers from './sockets/chat.socket.js';
import startBookingExpiryJob from './jobs/bookingExpiry.job.js';
import logger from './utils/logger.js';
import { port, clientUrl } from './config/env.js';

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: clientUrl, credentials: true },
});
registerChatHandlers(io);
app.set('io', io);

connectDB().then(() => {
  httpServer.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
  });
  startBookingExpiryJob();
});
