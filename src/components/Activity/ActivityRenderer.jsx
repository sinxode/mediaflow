import React from 'react';
import { renderActivityText } from '../../services/activity/activityService';

const ActivityRenderer = ({ action, metadata }) => {
  return <span>{renderActivityText(action, metadata)}</span>;
};

export default ActivityRenderer;
