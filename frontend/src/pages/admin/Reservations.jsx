import React, { useState, useMemo } from 'react';
import { useBooking } from '../../context/BookingContext';
import { formatDisplayDate } from '../../utils/slotHelpers';
import StatusBadge from '../../components/booking/StatusBadge';

export default function Reservations() {
  const { bookings, equipment, approveBooking, rejectBooking, updateEquipmentStatus, notify } =
    useBooking();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings
      .filter((b) => (statusFilter === 'All' ? true : b.status === statusFilter))
      .filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.studentName.toLowerCase().includes(q) ||
          b.equipmentName.toLowerCase().includes(q) ||
          b.labRoom.toLowerCase().includes(q)
      );
  }, [bookings, search, statusFilter]);

  const handleStatusChange = (bookingId, nextStatus) => {
    try {
      if (nextStatus === 'Approved') approveBooking(bookingId);
      if (nextStatus === 'Rejected') rejectBooking(bookingId);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className="ls-page">
      <div className="ls-page-header">
        <div>
          <h1 className="ls-page-title">All Reservations</h1>
          <p className="ls-page-subtitle">
            Master schedule across all campus laboratories with live status and slot overrides.
          </p>
        </div>
      </div>

      {/* Quick Equipment Availability / Maintenance Strip */}
      <div className="ls-card" style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
          Equipment Availability Overrides (Reflects Immediately in Student Booking Wizard)
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '10px',
          }}
        >
          {equipment.map((eq) => (
            <div
              key={eq.id}
              className="ls-surface"
              style={{
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {eq.name}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{eq.labRoom}</div>
              </div>
              <select
                className="ls-select"
                style={{ width: '132px', padding: '6px 8px', fontSize: '12.5px' }}
                value={eq.status}
                onChange={(e) => updateEquipmentStatus(eq.id, e.target.value)}
                aria-label={`Status for ${eq.name}`}
              >
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Master Table */}
      <div className="ls-card">
        <div className="ls-toolbar">
          <div className="ls-search-wrap">
            <span className="material-symbols-rounded">search</span>
            <input
              type="text"
              className="ls-input"
              placeholder="Search ID, student, equipment, or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="ls-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="ls-table-wrap">
          <table className="ls-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Equipment</th>
                <th>Date &amp; Slot</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Quick Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{b.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.studentName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.studentId}</div>
                  </td>
                  <td>
                    <div>{b.equipmentName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.labRoom}</div>
                  </td>
                  <td>
                    <div>{formatDisplayDate(b.date)}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{b.timeSlot}</div>
                  </td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {b.status === 'Pending' ? (
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="ls-btn ls-btn-success ls-btn-sm"
                          onClick={() => handleStatusChange(b.id, 'Approved')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="ls-btn ls-btn-danger ls-btn-sm"
                          onClick={() => handleStatusChange(b.id, 'Rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Finalized</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ls-mobile-cards">
          {filtered.map((b) => (
            <div key={b.id} className="ls-surface" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '13px' }}>
                  {b.id}
                </span>
                <StatusBadge status={b.status} />
              </div>
              <div style={{ fontWeight: 600 }}>{b.equipmentName}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                {b.studentName} • {formatDisplayDate(b.date)} ({b.timeSlot})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}