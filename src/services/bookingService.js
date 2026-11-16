import { INITIAL_BOOKINGS, INITIAL_EQUIPMENT, TIME_SLOTS } from '../data/demoBookings';
import { isPastDate } from '../utils/slotHelpers';

const STORAGE_KEYS = {
  BOOKINGS: 'labslot_bookings_v1',
  EQUIPMENT: 'labslot_equipment_v1',
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const bookingService = {
  getAllBookings() {
    return readStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },

  getAllEquipment() {
    return readStorage(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
  },

  saveEquipmentList(equipmentList) {
    writeStorage(STORAGE_KEYS.EQUIPMENT, equipmentList);
    return equipmentList;
  },

  /**
   * Validates and creates a new student reservation.
   * Throws descriptive errors if any LabSlot rule is violated.
   */
  createBooking(payload) {
    const bookings = this.getAllBookings();
    const equipmentList = this.getAllEquipment();

    const equipment = equipmentList.find((e) => e.id === payload.equipmentId);
    if (!equipment) {
      throw new Error('Selected equipment could not be found.');
    }

    if (equipment.status === 'Maintenance') {
      throw new Error('This equipment is currently under maintenance and cannot be booked.');
    }

    if (equipment.status !== 'Available') {
      throw new Error('This equipment is currently unavailable for reservation.');
    }

    if (!payload.date || isPastDate(payload.date)) {
      throw new Error('Past dates cannot be selected. Choose today or an upcoming date.');
    }

    const slotObj = TIME_SLOTS.find((s) => s.id === payload.slotId);
    if (!slotObj) {
      throw new Error('Please select a valid laboratory time slot.');
    }

    if (!payload.purpose || payload.purpose.trim().length < 8) {
      throw new Error('Please enter a brief experiment purpose (at least 8 characters).');
    }

    // Conflict validation: Pending and Approved bookings block conflicting slots
    const hasConflict = bookings.some(
      (b) =>
        b.equipmentId === payload.equipmentId &&
        b.date === payload.date &&
        b.slotId === payload.slotId &&
        (b.status === 'Pending' || b.status === 'Approved')
    );

    if (hasConflict) {
      throw new Error('This time slot was just reserved. Please select another available slot.');
    }

    const newBooking = {
      id: `BK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      studentId: payload.studentId || 'STU-2024-089',
      studentName: payload.studentName || 'Jaanvi Choudhary',
      studentEmail: payload.studentEmail || 'jaanvi.c@university.edu',
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      labRoom: equipment.labRoom,
      date: payload.date,
      slotId: slotObj.id,
      timeSlot: slotObj.label,
      purpose: payload.purpose.trim(),
      courseCode: payload.courseCode?.trim() || 'General Lab',
      supervisor: payload.supervisor?.trim() || 'Lab Faculty',
      status: 'Pending',
      adminNote: '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newBooking, ...bookings];
    writeStorage(STORAGE_KEYS.BOOKINGS, updated);
    return newBooking;
  },

  /**
   * Updates status ('Approved', 'Rejected', 'Cancelled') and immediately releases/locks slots.
   */
  updateBookingStatus(bookingId, nextStatus, adminNote = '') {
    const allowed = ['Pending', 'Approved', 'Rejected', 'Cancelled'];
    if (!allowed.includes(nextStatus)) {
      throw new Error('Invalid reservation status.');
    }

    const bookings = this.getAllBookings();
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) {
      throw new Error('Reservation record not found.');
    }

    // If re-approving a previously rejected/cancelled slot, verify no new conflict took the slot
    if (nextStatus === 'Approved' && target.status !== 'Approved') {
      const conflict = bookings.some(
        (b) =>
          b.id !== bookingId &&
          b.equipmentId === target.equipmentId &&
          b.date === target.date &&
          b.slotId === target.slotId &&
          (b.status === 'Pending' || b.status === 'Approved')
      );
      if (conflict) {
        throw new Error('Cannot approve: another active booking now occupies this time slot.');
      }
    }

    const updated = bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: nextStatus,
            adminNote: adminNote !== undefined ? adminNote : b.adminNote,
            updatedAt: new Date().toISOString(),
          }
        : b
    );

    writeStorage(STORAGE_KEYS.BOOKINGS, updated);
    return updated;
  },

  resetDemoData() {
    writeStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    writeStorage(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
    return { bookings: INITIAL_BOOKINGS, equipment: INITIAL_EQUIPMENT };
  },
};