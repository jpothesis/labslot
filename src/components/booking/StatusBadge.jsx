import React from 'react';

const ICON_MAP = {
  Approved: 'check_circle',
  Available: 'check_circle',
  Pending: 'schedule',
  Maintenance: 'build',
  Rejected: 'cancel',
  Unavailable: 'block',
  Cancelled: 'do_not_disturb_on',
};

export default function StatusBadge({ status }) {
  const normalized = (status || 'Pending').toLowerCase();
  const icon = ICON_MAP[status] || 'info';

  return (
    <span className={`ls-badge ls-badge-${normalized}`}>
      <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>
        {icon}
      </span>
      <span>{status}</span>
    </span>
  );
}