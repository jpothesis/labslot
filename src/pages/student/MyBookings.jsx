import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { formatDisplayDate, getTodayISO } from '../../utils/slotHelpers';
import StatusBadge from '../../components/booking/StatusBadge';

export default function MyBookings() {
  const { bookings, cancelBooking } = useBooking();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const today = getTodayISO();

  // Filter for current student's active/upcoming bookings (and recent status updates)
  const filteredBookings = useMemo(() => {
    const q = search.toLowerCase();
    return bookings
      .filter((b) => b.studentId === 'STU-2024-089')
      .filter((b) => (statusFilter === 'All' ? true : b.status === statusFilter))
      .filter(
        (b) =>
          b.equipmentName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.purpose.toLowerCase().includes(q) ||
          b.labRoom.toLowerCase().includes(q)
      );
  }, [bookings, search, statusFilter]);

  const canCancel = (b) =>
    (b.status === 'Pending' || b.status === 'Approved') && b.date >= today;

  const handleConfirmCancel = () => {
    if (!confirmCancelId) return;
    cancelBooking(confirmCancelId);
    setConfirmCancelId(null);
    if (selectedBooking?.id === confirmCancelId) {
      setSelectedBooking(null);
    }
  };

  return (
    <div className="ls-page">
      <div className="ls-page-header">
        <div>
          <h1 className="ls-page-title">My Bookings</h1>
          <p className="ls-page-subtitle">
            Track reservation approvals, inspect lab bench notes, or release upcoming slots.
          </p>
        </div>
        <Link to="/student/book" className="ls-btn ls-btn-primary" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
            add_circle
          </span>
          Book New Slot
        </Link>
      </div>

      <div className="ls-card">
        {/* Search & Status Filters */}
        <div className="ls-toolbar">
          <div className="ls-search-wrap">
            <span className="material-symbols-rounded">search</span>
            <input
              type="text"
              className="ls-input"
              placeholder="Search by equipment, ID, lab room, or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="ls-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by booking status"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '42px 16px', color: 'var(--text-muted)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '36px', marginBottom: '8px' }}>
              event_busy
            </span>
            <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
              No matching reservations found
            </div>
            <div style={{ fontSize: '13.5px' }}>
              Adjust your search filters or reserve a new equipment time slot.
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="ls-table-wrap">
              <table className="ls-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.equipmentName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                          {b.id} • {b.labRoom}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDisplayDate(b.date)}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>{b.timeSlot}</td>
                      <td style={{ maxWidth: '260px' }}>
                        <div
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#DCE7F7',
                          }}
                          title={b.purpose}
                        >
                          {b.purpose}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            className="ls-btn ls-btn-secondary ls-btn-sm"
                            onClick={() => setSelectedBooking(b)}
                          >
                            Details
                          </button>
                          {canCancel(b) && (
                            <button
                              type="button"
                              className="ls-btn ls-btn-danger ls-btn-sm"
                              onClick={() => setConfirmCancelId(b.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards (< 768px) */}
            <div className="ls-mobile-cards">
              {filteredBookings.map((b) => (
                <div key={b.id} className="ls-surface" style={{ padding: '14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{b.equipmentName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                        {b.id} • {b.labRoom}
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#DCE7F7', marginBottom: '6px' }}>
                    {formatDisplayDate(b.date)} • {b.timeSlot}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {b.purpose}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="ls-btn ls-btn-secondary ls-btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => setSelectedBooking(b)}
                    >
                      Details
                    </button>
                    {canCancel(b) && (
                      <button
                        type="button"
                        className="ls-btn ls-btn-danger ls-btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => setConfirmCancelId(b.id)}
                      >
                        Cancel Slot
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="ls-modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="ls-modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '17px' }}>Reservation Details</h3>
                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                  {selectedBooking.id}
                </span>
              </div>
              <StatusBadge status={selectedBooking.status} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Equipment: </strong>
                {selectedBooking.equipmentName} ({selectedBooking.labRoom})
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Schedule: </strong>
                {formatDisplayDate(selectedBooking.date)} • {selectedBooking.timeSlot}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Course &amp; Supervisor: </strong>
                {selectedBooking.courseCode} • {selectedBooking.supervisor}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Purpose: </strong>
                <p style={{ margin: '4px 0 0', lineHeight: 1.45 }}>{selectedBooking.purpose}</p>
              </div>
              {selectedBooking.adminNote && (
                <div
                  className="ls-surface"
                  style={{ padding: '10px 12px', borderLeft: '3px solid var(--accent-cyan)' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    Administrator Note
                  </div>
                  <div style={{ marginTop: '3px' }}>{selectedBooking.adminNote}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              {canCancel(selectedBooking) && (
                <button
                  type="button"
                  className="ls-btn ls-btn-danger"
                  onClick={() => setConfirmCancelId(selectedBooking.id)}
                >
                  Cancel Reservation
                </button>
              )}
              <button
                type="button"
                className="ls-btn ls-btn-secondary"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {confirmCancelId && (
        <div className="ls-modal-backdrop" onClick={() => setConfirmCancelId(null)}>
          <div className="ls-modal" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px' }}>Cancel Reservation?</h3>
            <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Cancelling <strong>{confirmCancelId}</strong> will immediately release this time slot so other students can book it.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="ls-btn ls-btn-secondary"
                onClick={() => setConfirmCancelId(null)}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="ls-btn ls-btn-danger"
                onClick={handleConfirmCancel}
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}