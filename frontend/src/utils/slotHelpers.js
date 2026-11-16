import { TIME_SLOTS } from '../data/demoBookings';

/**
 * Returns today's date in local YYYY-MM-DD format
 */
export function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a YYYY-MM-DD date string is strictly before today
 */
export function isPastDate(dateStr) {
  if (!dateStr) return true;
  return dateStr < getTodayISO();
}

/**
 * Formats YYYY-MM-DD to readable date (e.g., "Tue, Nov 17, 2026")
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Computes availability for every time slot on a given equipmentId + date.
 * Rule: 'Pending' and 'Approved' reservations lock the slot;
 * 'Rejected' and 'Cancelled' reservations release the slot.
 */
export function getSlotsWithAvailability(equipmentId, dateStr, allBookings = []) {
  if (!equipmentId || !dateStr || isPastDate(dateStr)) {
    return TIME_SLOTS.map((slot) => ({
      ...slot,
      isBooked: true,
      bookingStatus: isPastDate(dateStr) ? 'Past Date' : 'Unavailable',
    }));
  }

  const activeBookingsForDay = allBookings.filter(
    (b) =>
      b.equipmentId === equipmentId &&
      b.date === dateStr &&
      (b.status === 'Pending' || b.status === 'Approved')
  );

  return TIME_SLOTS.map((slot) => {
    const conflict = activeBookingsForDay.find((b) => b.slotId === slot.id);
    return {
      ...slot,
      isBooked: Boolean(conflict),
      bookingStatus: conflict ? conflict.status : 'Available',
      bookedBy: conflict ? conflict.studentName : null,
    };
  });
}

/**
 * Determines if a reservation is historical (date < today or Rejected/Cancelled)
 */
export function isHistoricalBooking(booking) {
  const today = getTodayISO();
  return (
    booking.date < today ||
    booking.status === 'Rejected' ||
    booking.status === 'Cancelled'
  );
}