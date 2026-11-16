import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useBooking } from './context/BookingContext';
import BookSlot from './pages/student/BookSlot';
import MyBookings from './pages/student/MyBookings';
import BookingHistory from './pages/student/BookingHistory';
import BookingRequests from './pages/admin/BookingRequests';
import Reservations from './pages/admin/Reservations';
import UsageHistory from './pages/admin/UsageHistory';

export default function App() {
  const { bookings, resetDemo } = useBooking();
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;

  const navStyle = ({ isActive }) => ({
    padding: '8px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13.5px',
    fontWeight: 600,
    color: isActive ? '#04152D' : '#DCE7F7',
    background: isActive ? '#00D4E8' : 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#071B3A' }}>
      <header
        style={{
          background: '#0B2142',
          borderBottom: '1px solid rgba(143, 168, 200, 0.16)',
          padding: '12px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            className="material-symbols-rounded"
            style={{ color: '#00D4E8', fontSize: '26px' }}
          >
            science
          </span>
          <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.01em' }}>
            LabSlot <span style={{ color: '#00D4E8', fontSize: '12px' }}>Booking Module</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <NavLink to="/student/book" style={navStyle}>
            Book a Slot
          </NavLink>
          <NavLink to="/student/bookings" style={navStyle}>
            My Bookings
          </NavLink>
          <NavLink to="/student/history" style={navStyle}>
            Student History
          </NavLink>
          <span style={{ color: 'rgba(143,168,200,0.35)', margin: '0 4px' }}>|</span>
          <NavLink to="/admin/requests" style={navStyle}>
            Admin Requests ({pendingCount})
          </NavLink>
          <NavLink to="/admin/reservations" style={navStyle}>
            All Reservations
          </NavLink>
          <NavLink to="/admin/usage-history" style={navStyle}>
            Usage History
          </NavLink>
        </nav>

        <button type="button" className="ls-btn ls-btn-secondary ls-btn-sm" onClick={resetDemo}>
          Reset Demo Data
        </button>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/student/book" replace />} />
          <Route path="/student/book" element={<BookSlot />} />
          <Route path="/student/bookings" element={<MyBookings />} />
          <Route path="/student/history" element={<BookingHistory />} />
          <Route path="/admin/requests" element={<BookingRequests />} />
          <Route path="/admin/reservations" element={<Reservations />} />
          <Route path="/admin/usage-history" element={<UsageHistory />} />
        </Routes>
      </main>
    </div>
  );
}