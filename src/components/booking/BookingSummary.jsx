import React from 'react';
import { formatDisplayDate } from '../../utils/slotHelpers';
import { TIME_SLOTS } from '../../data/demoBookings';
import StatusBadge from './StatusBadge';

export default function BookingSummary({
  equipment,
  date,
  slotId,
  purpose,
  courseCode,
  supervisor,
}) {
  const slotObj = TIME_SLOTS.find((s) => s.id === slotId);

  return (
    <aside className="ls-card" style={{ position: 'sticky', top: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '14px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="material-symbols-rounded"
            style={{ color: 'var(--accent-cyan)', fontSize: '20px' }}
          >
            receipt_long
          </span>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
            Reservation Summary
          </h3>
        </div>
        <StatusBadge status="Pending" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '3px' }}>
            Equipment
          </div>
          <div style={{ fontWeight: 600 }}>
            {equipment ? equipment.name : 'Not selected yet'}
          </div>
          {equipment && (
            <div style={{ color: 'var(--accent-cyan)', fontSize: '12px', marginTop: '2px' }}>
              {equipment.labRoom} • {equipment.category}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            padding: '10px 12px',
            background: 'var(--bg-surface)',
            borderRadius: '8px',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>Date</div>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>
              {date ? formatDisplayDate(date) : '—'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>Time Slot</div>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>
              {slotObj ? slotObj.label : '—'}
            </div>
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '3px' }}>
            Course / Supervisor
          </div>
          <div style={{ fontWeight: 500 }}>
            {courseCode || '—'} {supervisor ? `• ${supervisor}` : ''}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '3px' }}>
            Experiment Purpose
          </div>
          <div style={{ color: purpose ? '#E2E8F0' : 'var(--text-muted)', lineHeight: 1.45 }}>
            {purpose || 'Enter experiment details in Step 3'}
          </div>
        </div>
      </div>
    </aside>
  );
}