import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { bookingService } from '../services/bookingService';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => bookingService.getAllBookings());
  const [equipment, setEquipment] = useState(() => bookingService.getAllEquipment());
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sync changes across browser tabs (Student <-> Admin portals)
  useEffect(() => {
    const handleStorageSync = (e) => {
      if (e.key === 'labslot_bookings_v1') {
        setBookings(bookingService.getAllBookings());
      }
      if (e.key === 'labslot_equipment_v1') {
        setEquipment(bookingService.getAllEquipment());
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  const addBooking = (payload) => {
    const created = bookingService.createBooking(payload);
    setBookings(bookingService.getAllBookings());
    notify(`Reservation ${created.id} submitted for admin approval.`, 'success');
    return created;
  };

  const cancelBooking = (bookingId) => {
    const updated = bookingService.updateBookingStatus(
      bookingId,
      'Cancelled',
      'Cancelled by student'
    );
    setBookings(updated);
    notify(`Reservation ${bookingId} cancelled and time slot released.`, 'info');
  };

  const approveBooking = (bookingId, adminNote = 'Approved for lab access.') => {
    const updated = bookingService.updateBookingStatus(bookingId, 'Approved', adminNote);
    setBookings(updated);
    notify(`Reservation ${bookingId} approved.`, 'success');
  };

  const rejectBooking = (bookingId, adminNote = 'Slot unavailable due to lab schedule.') => {
    const updated = bookingService.updateBookingStatus(bookingId, 'Rejected', adminNote);
    setBookings(updated);
    notify(`Reservation ${bookingId} rejected and slot released.`, 'warning');
  };

  const updateEquipmentStatus = (equipmentId, status) => {
    const nextList = equipment.map((item) =>
      item.id === equipmentId ? { ...item, status } : item
    );
    bookingService.saveEquipmentList(nextList);
    setEquipment(nextList);
    notify(`Equipment status updated to ${status}.`, 'info');
  };

  const resetDemo = () => {
    const fresh = bookingService.resetDemoData();
    setBookings(fresh.bookings);
    setEquipment(fresh.equipment);
    notify('Demo booking and equipment data restored.', 'info');
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        equipment,
        toast,
        notify,
        addBooking,
        cancelBooking,
        approveBooking,
        rejectBooking,
        updateEquipmentStatus,
        resetDemo,
      }}
    >
      {children}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#112B4C',
            border: `1px solid ${
              toast.type === 'warning'
                ? '#F59E0B'
                : toast.type === 'error'
                ? '#EF4444'
                : '#00D4E8'
            }`,
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '380px',
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{
              fontSize: '20px',
              color:
                toast.type === 'warning'
                  ? '#F59E0B'
                  : toast.type === 'error'
                  ? '#EF4444'
                  : '#00D4E8',
            }}
          >
            {toast.type === 'warning'
              ? 'warning'
              : toast.type === 'error'
              ? 'error'
              : 'check_circle'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBooking must be used inside a BookingProvider');
  }
  return ctx;
}