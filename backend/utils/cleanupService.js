const db = require('../config/db');

/**
 * Automatically cancels unpaid bookings that have passed their expiration time (3 hours).
 * Also releases seats back to the flight.
 */
const cleanupExpiredBookings = async () => {
  try {
    // 1. Find expired pending bookings
    const expiredResult = await db.query(`
      SELECT b.id, b.flight_id, b.cabin_class, COUNT(p.id) as passenger_count
      FROM bookings b
      LEFT JOIN passengers p ON b.id = p.booking_id
      WHERE b.status = 'pending' 
      AND (b.expires_at < CURRENT_TIMESTAMP OR (b.booking_date < CURRENT_TIMESTAMP - INTERVAL '3 hours'))
      GROUP BY b.id
    `);

    if (expiredResult.rows.length === 0) return;

    console.log(`[CLEANUP] Found ${expiredResult.rows.length} expired bookings. Processing...`);

    for (const booking of expiredResult.rows) {
      // 2. Mark booking as cancelled
      await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [booking.id]);

      // 3. Optional: Restore seats to flight if your system tracks available seats
      // (This assumes your flights table has available_seats columns)
      const seatColumn = booking.cabin_class.toLowerCase() === 'business' ? 'business_seats' : 'economy_seats';
      await db.query(`
        UPDATE flights 
        SET ${seatColumn} = ${seatColumn} + $1 
        WHERE id = $2
      `, [parseInt(booking.passenger_count), booking.flight_id]);

      console.log(`[CLEANUP] Booking #${booking.id} cancelled due to expiration. Seats released.`);
    }
  } catch (err) {
    console.error('[CLEANUP ERROR]:', err.message);
  }
};

// Run cleanup every 15 minutes
const startCleanupTask = () => {
  console.log('--- EXPIRED BOOKING CLEANUP SERVICE STARTED ---');
  setInterval(cleanupExpiredBookings, 15 * 60 * 1000); 
  // Run once immediately on start
  cleanupExpiredBookings();
};

module.exports = { startCleanupTask };
