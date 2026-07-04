import React from 'react';
import Badge from '../Badge/Badge';

const StatusBadge = ({
  status = 'draft', // 'draft' | 'review' | 'scheduled' | 'published' | 'failed'
  className = '',
  ...props
}) => {
  const statusMap = {
    draft: { label: 'Draft', variant: 'secondary' },
    review: { label: 'In Review', variant: 'review' },
    scheduled: { label: 'Scheduled', variant: 'warning' },
    published: { label: 'Published', variant: 'success' },
    failed: { label: 'Failed', variant: 'danger' },
  };

  const current = statusMap[status.toLowerCase()] || { label: status, variant: 'secondary' };

  return (
    <Badge variant={current.variant} className={className} {...props}>
      {current.label}
    </Badge>
  );
};

export default StatusBadge;
