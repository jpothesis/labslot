import React from 'react';
import { motion } from 'framer-motion';
import { getTodayISO, getSlotsWithAvailability, isPastDate } from '../../utils/slotHelpers';

export default function SlotSelector({
  equipmentId,
  selectedDate,
  onDateChange,
  selectedSlotId,
  onSelectSlot,
  bookings,
}) {
  const minDate = getTodayISO();
  const pastSelected = isPastDate(selectedDate);
  const slots = getSlotsWithAvailability(equipmentId, selectedDate, bookings);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label htmlFor="booking-date" className="ls-label">
          Select Laboratory Date
        </label>
        <input
          id="booking-date"
          type="date"
          className="ls-input"
          style={{ maxWidth: '260px' }}
          min={minDate}
          value={selectedDate}
          onChange={(e) => {
            onDateChange(e.target.value);
            onSelectSlot('');
          }}
        />
        {pastSelected && selectedDate && (
          <p style={{ color: '#F87171', fontSize: '13px', marginTop: '6px' }}>
            Past dates cannot be booked. Please pick {minDate} or later.
          </p>
        )}
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span className="ls-label" style={{ margin: 0 }}>
            Available 90-Minute Time Slots
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Pending &amp; Approved reservations lock slots automatically
          </span>
        </div>

        <div className="ls-slots-grid">
          {slots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            return (
              <motion.button
                key={slot.id}
                type="button"
                whileTap={!slot.isBooked ? { scale: 0.98 } : undefined}
                disabled={slot.isBooked}
                onClick={() => onSelectSlot(slot.id)}
                className={`ls-slot-btn ${isSelected ? 'selected' : ''}`}
              >
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                  {slot.label}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: slot.isBooked
                      ? '#F87171'
                      : isSelected
                      ? '#00D4E8'
                      : '#34D399',
                  }}
                >
                  <span
                    className="material-symbols-rounded"
                    style={{ fontSize: '14px' }}
                  >
                    {slot.isBooked ? 'lock' : isSelected ? 'radio_button_checked' : 'event_available'}
                  </span>
                  {slot.isBooked ? `Booked (${slot.bookingStatus})` : isSelected ? 'Selected' : 'Available'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}