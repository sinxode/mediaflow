// Core calculation engine for recurring schedules and date math

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust so Monday is 1, Sunday is 7, and get start of week (Monday)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const isDateMatchingSchedule = (date, scheduleType, config, startDate) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  
  if (scheduleType === 'daily') {
    const everyXDays = parseInt(config.everyXDays) || 1;
    const diffTime = d.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays % everyXDays === 0;
  }
  
  if (scheduleType === 'weekly') {
    const everyXWeeks = parseInt(config.everyXWeeks) || 1;
    const weekdays = (config.weekdays || []).map(w => w.toLowerCase());
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (!weekdays.includes(dayName)) return false;
    
    const startWeek = getWeekStart(startDate);
    const currentWeek = getWeekStart(d);
    const diffTime = currentWeek.getTime() - startWeek.getTime();
    const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks >= 0 && diffWeeks % everyXWeeks === 0;
  }
  
  if (scheduleType === 'monthly') {
    const mode = config.mode || 'day_of_month';
    
    if (mode === 'day_of_month') {
      const dayOfMonth = parseInt(config.dayOfMonth) || 1;
      return d.getDate() === dayOfMonth;
    }
    
    if (mode === 'nth_weekday') {
      const nth = config.nth || 'first';
      const weekdayName = (config.weekday || 'monday').toLowerCase();
      const currentDayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      if (currentDayName !== weekdayName) return false;
      
      const dayOfMonth = d.getDate();
      
      if (nth === 'first') return dayOfMonth <= 7;
      if (nth === 'second') return dayOfMonth > 7 && dayOfMonth <= 14;
      if (nth === 'third') return dayOfMonth > 14 && dayOfMonth <= 21;
      if (nth === 'fourth') return dayOfMonth > 21 && dayOfMonth <= 28;
      if (nth === 'last') {
        const nextWeek = new Date(d);
        nextWeek.setDate(dayOfMonth + 7);
        return nextWeek.getMonth() !== d.getMonth();
      }
    }
    return false;
  }
  
  if (scheduleType === 'yearly') {
    const month = parseInt(config.month) || 1; // 1-indexed (1 = Jan)
    const day = parseInt(config.day) || 1;
    return d.getMonth() === (month - 1) && d.getDate() === day;
  }
  
  return false;
};

/**
 * Calculates all scheduled event occurrences for a workflow between two dates (inclusive)
 * @param {Object} workflow - The workflow object
 * @param {Date} rangeStart - Start of the date range
 * @param {Date} rangeEnd - End of the date range
 * @returns {Array<Date>} List of occurrence dates (set to midnight)
 */
export const getScheduleOccurrences = (workflow, rangeStart, rangeEnd) => {
  const occurrences = [];
  const start = new Date(rangeStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setHours(23, 59, 59, 999);
  
  const config = workflow.schedule_config || {};
  const workflowStart = new Date(config.startDate || workflow.created_at);
  workflowStart.setHours(0, 0, 0, 0);
  
  const workflowEnd = config.endDate ? new Date(config.endDate) : null;
  if (workflowEnd) workflowEnd.setHours(23, 59, 59, 999);

  // We loop day by day in the range
  const loopStart = new Date(Math.max(start, workflowStart));
  const loopEnd = workflowEnd ? new Date(Math.min(end, workflowEnd)) : end;

  const current = new Date(loopStart);
  while (current <= loopEnd) {
    if (isDateMatchingSchedule(current, workflow.schedule_type, config, workflowStart)) {
      occurrences.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return occurrences;
};

/**
 * Calculates the exact generation target date & time relative to the event date
 * @param {Date} eventDate - The date of the event occurrence (set to midnight)
 * @param {string} offset - 'immediately', 'hours_1', 'hours_6', 'hours_12', 'days_1', 'days_2'
 * @param {string} timeString - "HH:MM" format (24 hour)
 * @returns {Date} Generation timestamp
 */
export const getGenerationTargetDateTime = (eventDate, offset, timeString) => {
  const target = new Date(eventDate);
  const [hours, minutes] = (timeString || '09:00').split(':').map(Number);
  target.setHours(hours, minutes, 0, 0);
  
  switch (offset) {
    case 'hours_1':
      target.setHours(target.getHours() - 1);
      break;
    case 'hours_6':
      target.setHours(target.getHours() - 6);
      break;
    case 'hours_12':
      target.setHours(target.getHours() - 12);
      break;
    case 'days_1':
      target.setDate(target.getDate() - 1);
      break;
    case 'days_2':
      target.setDate(target.getDate() - 2);
      break;
    case 'immediately':
    default:
      break;
  }
  
  return target;
};

/**
 * Replaces dynamic variables in task templates relative to event occurrences
 * @param {string} templateText - Template content
 * @param {Date} eventDate - Occurrence event date
 * @returns {string} Fully parsed template string
 */
export const parseDynamicTemplate = (templateText, eventDate) => {
  if (!templateText) return '';
  const dateObj = new Date(eventDate);
  
  // Dynamic labels
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const yearNumber = dateObj.getFullYear().toString();
  const dateStr = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  
  // Calculate ISO Week Number
  const target = new Date(dateObj.valueOf());
  const dayNr = (dateObj.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target) / (1000 * 60 * 60 * 24 * 7));

  return templateText
    .replace(/{Date}/g, dateStr)
    .replace(/{Day}/g, dayName)
    .replace(/{Month}/g, monthName)
    .replace(/{Year}/g, yearNumber)
    .replace(/{WeekNumber}/g, weekNumber.toString());
};
