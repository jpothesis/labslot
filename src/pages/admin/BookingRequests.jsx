import React, { useState, useMemo } from 'react';
import { useBooking } from '../../context/BookingContext';
import { formatDisplayDate } from '../../utils/slotHelpers';
import StatusBadge from '../../components/booking/StatusBadge';

export default function BookingRequests() {
  const { bookings, approveBooking, rejectBooking, notify } = useBooking();
  const [search, setSearch] = useState('');
  const [actionModal, setActionModal] = useState(null); // { booking, type: 'approve' | 'reject' }
  const [adminNote, setAdminNote] = useState('');

  const pendingRequests = useMemo(() => {
    const q = search.toLowerCase();
    return bookings
      .filter((b) => b.status === 'Pending')
      .filter(
        (b) =>
          b.studentName.toLowerCase().includes(q) ||
          b.equipmentName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
      );
  }, [bookings, search]);

  const openActionModal = (booking, type) => {
    setActionModal({ booking, type });
    setAdminNote(
      type === 'approve'
        ? 'Approved. Please arrive 5 minutes early with your student ID.'
        : 'Slot unavailable due to scheduled instrument calibration.'
    );
  };

  const handleConfirmAction = () => {
    if (!actionModal) return;
    try {
      if (actionModal.type === 'approve') {
        approveBooking(actionModal.booking.id, adminNote);
      } else {
        rejectBooking(actionModal.booking.id, adminNote);
      }
      setActionModal(null);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className="ls-page">
      <div className="ls-page-header">
        <div>
          <h1 className="ls-page-title">Booking Requests</h1>
          <p className="ls-page-subtitle">
            Review incoming student laboratory reservations ({pendingRequests.length} awaiting decision).
          </p>
        </div>
      </div>

      <div className="ls-card">
        <div className="ls-toolbar">
          <div className="ls-search-wrap">
            <span className="material-symbols-rounded">search</span>
            <input
              type="text"
              className="ls-input"
              placeholder="Search student name, equipment, or booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '44px 16px', color: 'var(--text-muted)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '38px', color: '#34D399' }}>
              task_alt
            </span>
            <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '8px' }}>
              All caught up
            </div>
            <div style={{ fontSize: '13.5px', marginTop: '4px' }}>
              There are no pending student booking requests right now.
            </div>
          </div>
        ) : (
          <>
            <div className="ls-table-wrap">
              <table className="ls-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Equipment &amp; Lab</th>
                    <th>Requested Window</th>
                    <th>Experiment Purpose</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.studentName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {req.studentId} • {req.courseCode}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.equipmentName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                          {req.labRoom}
                        </div>
                      </td>
                      <td>
                        <div>{formatDisplayDate(req.date)}</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          {req.timeSlot}
                        </div>
                      </td>
                      <td style={{ maxWidth: '250px', fontSize: '13px', color: '#DCE7F7' }}>
                        {req.purpose}
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            className="ls-btn ls-btn-success ls-btn-sm"
                            onClick={() => openActionModal(req, 'approve')}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="ls-btn ls-btn-danger ls-btn-sm"
                            onClick={() => openActionModal(req, 'reject')}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ls-mobile-cards">
              {pendingRequests.map((req) => (
                <div key={req.id} className="ls-surface" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{req.studentName}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {req.equipmentName}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                    {formatDisplayDate(req.date)} • {req.timeSlot}
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '12px' }}>{req.purpose}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="ls-btn ls-btn-success ls-btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => openActionModal(req, 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="ls-btn ls-btn-danger ls-btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => openActionModal(req, 'reject')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Approve / Reject Confirmation Modal */}
      {actionModal && (
        <div className="ls-modal-backdrop" onClick={() => setActionModal(null)}>
          <div className="ls-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 6px', fontSize: '17px' }}>
              {actionModal.type === 'approve' ? 'Approve Reservation' : 'Reject Reservation'}
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {actionModal.booking.id} • {actionModal.booking.studentName} ({actionModal.booking.equipmentName})
            </p>

            <label className="ls-label" htmlFor="admin-decision-note">
              Note for Student
            </label>
            <textarea
              id="admin-decision-note"
              rows={3}
              className="ls-textarea"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button
                type="button"
                className="ls-btn ls-btn-secondary"
                onClick={() => setActionModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`ls-btn ${
                  actionModal.type === 'approve' ? 'ls-btn-success' : 'ls-btn-danger'
                }`}
                onClick={handleConfirmAction}
              >
                {actionModal.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}