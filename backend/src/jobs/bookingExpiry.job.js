import bookingRepo from '../repositories/booking.repository.js';
import logger from '../utils/logger.js';

const CHECK_INTERVAL_MS = 15 * 60 * 1000; // every 15 minutes

// Providers who never respond to a request shouldn't leave it stuck in
// "requested" forever — auto-expire it so the traveler can book someone else.
async function expireStaleRequests() {
  try {
    const expired = await bookingRepo.findExpiredRequests();
    for (const booking of expired) {
      await bookingRepo.updateStatusIfCurrent(booking._id, 'requested', 'expired');
    }
    if (expired.length) logger.info(`Expired ${expired.length} stale booking request(s)`);
  } catch (err) {
    logger.error(`Booking expiry job failed: ${err.message}`);
  }
}

function startBookingExpiryJob() {
  setInterval(expireStaleRequests, CHECK_INTERVAL_MS);
}

export default startBookingExpiryJob;