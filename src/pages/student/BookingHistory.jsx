import React, { useState, useMemo } from 'react';
import { useBooking } from '../../context/BookingContext';
import { formatDisplayDate, isHistoricalBooking } from '../../utils/slotHelpers';
import StatusBadge from '../../components/booking/StatusBadge';

export default function BookingHistory() {
  const { bookings } = useBooking();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const historyItems = useMemo(() => {
    const q = search.toLowerCase();
    return bookings
      .filter((b) => b.studentId === 'STU-2024-089' && isHistoricalBooking(b))
      .filter((b) => (statusFilter === 'All' ? true : b.status === statusFilter))
      .filter(
        (b) =>
          b.equipmentName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.courseCode.toLowerCase().includes(q)
      );
  }, [bookings, search, statusFilter]);

  return (
    <div className="ls-page">
      <div className="ls-page-header">
        <div>
          <h1 className="ls-page-title">Booking History</h1>
          <p className="ls-page-subtitle">
            Archive of your completed laboratory sessions, cancelled slots, and past requests.
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
              placeholder="Search past equipment, booking ID, or course code..."
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
            <option value="All">All Outcomes</option>
            <option value="Approved">Completed (Approved)</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {historyItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
            No past reservation records match your current filter.
          </div>
        ) : (
          <>
            <div className="ls-table-wrap">
              <table className="ls-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Equipment</th>
                    <th>Date &amp; Slot</th>
                    <th>Course</th>
                    <th>Outcome</th>
                    <th>Admin Note</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{item.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.equipmentName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {item.labRoom}
                        </div>
                      </td>
                      <td>
                        <div>{formatDisplayDate(item.date)}</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          {item.timeSlot}
                        </div>
                      </td>
                      <td>{item.courseCode}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {item.adminNote || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ls-mobile-cards">
              {historyItems.map((item) => (
                <div key={item.id} className="ls-surface" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '13px' }}>
                      {item.id}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.equipmentName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {formatDisplayDate(item.date)} • {item.timeSlot}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}