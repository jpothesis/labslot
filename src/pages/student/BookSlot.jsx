import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { getTodayISO, isPastDate, formatDisplayDate } from '../../utils/slotHelpers';
import { TIME_SLOTS } from '../../data/demoBookings';
import StatusBadge from '../../components/booking/StatusBadge';
import SlotSelector from '../../components/booking/SlotSelector';
import BookingSummary from '../../components/booking/BookingSummary';

const STEPS = [
  { num: 1, title: 'Select Equipment' },
  { num: 2, title: 'Date & Time' },
  { num: 3, title: 'Booking Details' },
  { num: 4, title: 'Confirm Booking' },
];

export default function BookSlot() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { equipment, bookings, addBooking } = useBooking();

  const preselectedId = searchParams.get('equipmentId') || '';
  const validPreselect = equipment.find(
    (e) => e.id === preselectedId && e.status === 'Available'
  );

  const [step, setStep] = useState(validPreselect ? 2 : 1);
  const [equipmentId, setEquipmentId] = useState(validPreselect ? validPreselect.id : '');
  const [date, setDate] = useState(getTodayISO());
  const [slotId, setSlotId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [error, setError] = useState('');

  const selectedEquipment = useMemo(
    () => equipment.find((e) => e.id === equipmentId) || null,
    [equipment, equipmentId]
  );

  const filteredEquipment = useMemo(() => {
    const q = searchFilter.toLowerCase();
    return equipment.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.labRoom.toLowerCase().includes(q)
    );
  }, [equipment, searchFilter]);

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!selectedEquipment) {
        setError('Please select an available piece of laboratory equipment.');
        return;
      }
      if (selectedEquipment.status !== 'Available') {
        setError(`Selected equipment is ${selectedEquipment.status} and cannot be booked.`);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!date || isPastDate(date)) {
        setError('Please select today or an upcoming valid date.');
        return;
      }
      if (!slotId) {
        setError('Please pick an available time slot.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (purpose.trim().length < 8) {
        setError('Please describe your experiment purpose in at least 8 characters.');
        return;
      }
      setStep(4);
    }
  };

  const handleConfirmSubmit = () => {
    setError('');
    try {
      addBooking({
        equipmentId,
        date,
        slotId,
        purpose,
        courseCode,
        supervisor,
      });
      navigate('/student/bookings');
    } catch (err) {
      setError(err.message);
    }
  };

  const selectedSlotObj = TIME_SLOTS.find((s) => s.id === slotId);

  return (
    <div className="ls-page">
      <div className="ls-page-header">
        <div>
          <h1 className="ls-page-title">Book a Laboratory Slot</h1>
          <p className="ls-page-subtitle">
            Reserve verified lab instruments in four steps with instant conflict protection.
          </p>
        </div>
      </div>

      {/* 4-Step Progress Bar */}
      <div className="ls-stepper">
        {STEPS.map((s) => {
          const stateClass = step === s.num ? 'active' : step > s.num ? 'done' : '';
          return (
            <div key={s.num} className={`ls-step-pill ${stateClass}`}>
              <span className="ls-step-num">
                {step > s.num ? (
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
                    check
                  </span>
                ) : (
                  s.num
                )}
              </span>
              <span>{s.title}</span>
            </div>
          );
        })}
      </div>

      <div className="ls-wizard-layout">
        <div className="ls-card">
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.14)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#FCA5A5',
                padding: '11px 14px',
                borderRadius: '8px',
                fontSize: '13.5px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: '17px' }}>
                    Step 1: Choose Equipment
                  </h2>
                  <div className="ls-search-wrap" style={{ maxWidth: '260px' }}>
                    <span className="material-symbols-rounded">search</span>
                    <input
                      type="text"
                      className="ls-input"
                      placeholder="Filter instruments..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="ls-eq-select-grid">
                  {filteredEquipment.map((item) => {
                    const isAvailable = item.status === 'Available';
                    const isSelected = item.id === equipmentId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => {
                          setEquipmentId(item.id);
                          setSlotId('');
                          setError('');
                        }}
                        className={`ls-eq-option ${isSelected ? 'selected' : ''}`}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                            {item.labRoom}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '14.5px', lineHeight: 1.35 }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          {item.specs}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <h2 style={{ margin: '0 0 16px', fontSize: '17px' }}>
                  Step 2: Select Date &amp; Time Slot
                </h2>
                <SlotSelector
                  equipmentId={equipmentId}
                  selectedDate={date}
                  onDateChange={setDate}
                  selectedSlotId={slotId}
                  onSelectSlot={setSlotId}
                  bookings={bookings}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <h2 style={{ margin: 0, fontSize: '17px' }}>
                  Step 3: Enter Experiment Details
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="ls-label" htmlFor="course-code">
                      Course Code / Project ID
                    </label>
                    <input
                      id="course-code"
                      type="text"
                      className="ls-input"
                      placeholder="e.g., ECE-304 or Capstone"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="ls-label" htmlFor="supervisor-name">
                      Faculty Supervisor
                    </label>
                    <input
                      id="supervisor-name"
                      type="text"
                      className="ls-input"
                      placeholder="e.g., Dr. R. K. Verma"
                      value={supervisor}
                      onChange={(e) => setSupervisor(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="ls-label" htmlFor="booking-purpose">
                    Experiment Objective &amp; Materials *
                  </label>
                  <textarea
                    id="booking-purpose"
                    rows={4}
                    className="ls-textarea"
                    placeholder="Briefly describe your experiment setup, samples, or measurement goals..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <h2 style={{ margin: '0 0 8px', fontSize: '17px' }}>
                  Step 4: Review &amp; Confirm Reservation
                </h2>
                <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                  Submitting locks this slot immediately while your reservation awaits administrator approval.
                </p>

                <div
                  className="ls-surface"
                  style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Equipment</span>
                    <span style={{ fontWeight: 600, fontSize: '14px', textAlign: 'right' }}>
                      {selectedEquipment?.name} ({selectedEquipment?.labRoom})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Date &amp; Window</span>
                    <span style={{ fontWeight: 600, fontSize: '14px', textAlign: 'right' }}>
                      {formatDisplayDate(date)} • {selectedSlotObj?.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Course / Faculty</span>
                    <span style={{ fontWeight: 500, fontSize: '14px', textAlign: 'right' }}>
                      {courseCode || 'General Lab'} • {supervisor || 'Lab Faculty'}
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginBottom: '4px' }}>
                      Purpose
                    </div>
                    <div style={{ fontSize: '13.5px', lineHeight: 1.5 }}>{purpose}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wizard Navigation Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              className="ls-btn ls-btn-secondary"
              disabled={step === 1}
              onClick={() => {
                setError('');
                setStep((prev) => Math.max(1, prev - 1));
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
                arrow_back
              </span>
              Back
            </button>

            {step < 4 ? (
              <button type="button" className="ls-btn ls-btn-primary" onClick={handleNext}>
                Continue
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="ls-btn ls-btn-primary"
                onClick={handleConfirmSubmit}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
                  event_available
                </span>
                Confirm Reservation
              </button>
            )}
          </div>
        </div>

        {/* Live Desktop Summary Sidebar */}
        <BookingSummary
          equipment={selectedEquipment}
          date={date}
          slotId={slotId}
          purpose={purpose}
          courseCode={courseCode}
          supervisor={supervisor}
        />
      </div>
    </div>
  );
}