// Real-time operations calculations for Ignite LabOS.
// Automatically manages active session countdowns and waiting queue estimations.

/**
 * Calculates remaining time in seconds for active session
 * @param {string} sessionStartTime - ISO timestamp when session started
 * @param {number} requestedDuration - duration booked in minutes
 * @param {number} extensionDuration - approved extension in minutes
 * @returns {Object} { secondsRemaining, isOvertime, statusClass }
 */
export const calculateRemainingTime = (sessionStartTime, requestedDuration, extensionDuration) => {
  if (!sessionStartTime) return { secondsRemaining: 0, isOvertime: false, statusClass: 'normal' };
  
  const start = new Date(sessionStartTime).getTime();
  const now = new Date().getTime();
  
  const totalAllocatedMinutes = (requestedDuration || 0) + (extensionDuration || 0);
  const totalAllocatedSeconds = totalAllocatedMinutes * 60;
  
  const elapsedSeconds = Math.floor((now - start) / 1000);
  const secondsRemaining = totalAllocatedSeconds - elapsedSeconds;
  
  const isOvertime = secondsRemaining < 0;
  
  let statusClass = 'normal';
  if (isOvertime) {
    statusClass = 'overtime'; // Red (Threshold exceeded)
  } else if (secondsRemaining <= 60) {
    statusClass = 'alert'; // Orange (Less than 1 minute remaining)
  } else if (secondsRemaining <= 300) {
    statusClass = 'warning'; // Yellow (Less than 5 minutes remaining)
  }
  
  return {
    secondsRemaining,
    isOvertime,
    statusClass
  };
};

/**
 * Simulates entry times for pending queue requests on a first-come, first-serve basis.
 * @param {Array} waitingRequests - List of pending requests sorted by queue position
 * @param {Array} activeSessions - List of active sessions currently occupying PCs
 * @param {Array} pcNames - List of all computer seats configured
 * @returns {Array} List of requests enhanced with estimated entry timestamps
 */
export const simulateQueueTimeline = (waitingRequests = [], activeSessions = [], pcNames = []) => {
  const now = new Date();
  
  // 1. Initialize release times for all PCs
  const pcReleaseTimes = {};
  pcNames.forEach(pc => {
    // Check if PC is occupied by active session
    const active = activeSessions.find(s => s.assigned_computer === pc);
    if (active) {
      const duration = (active.requested_duration || 0) + (active.extension_requested_duration || 0);
      const end = new Date(new Date(active.session_start_time).getTime() + duration * 60 * 1000);
      // If end time is in the past (overtime), seat is effectively available "now"
      pcReleaseTimes[pc] = end < now ? new Date(now) : end;
    } else {
      // Unoccupied seat is available immediately
      pcReleaseTimes[pc] = new Date(now);
    }
  });

  // Helper to find earliest PC release time
  const getEarliestAvailablePC = () => {
    let earliestPC = pcNames[0];
    let earliestTime = pcReleaseTimes[earliestPC];
    
    pcNames.forEach(pc => {
      if (pcReleaseTimes[pc].getTime() < earliestTime.getTime()) {
        earliestPC = pc;
        earliestTime = pcReleaseTimes[pc];
      }
    });
    
    return { pc: earliestPC, time: earliestTime };
  };

  // 2. Loop through waiting queue and calculate entry times
  return waitingRequests.map(req => {
    const earliest = getEarliestAvailablePC();
    const estEntry = new Date(earliest.time);
    
    // Calculate new release time for this PC: entry + requested duration
    const reqDurationMinutes = req.requested_duration || 30;
    const releaseTime = new Date(estEntry.getTime() + reqDurationMinutes * 60 * 1000);
    pcReleaseTimes[earliest.pc] = releaseTime;
    
    return {
      ...req,
      estimated_entry_time: estEntry.toISOString(),
      simulated_computer: earliest.pc
    };
  });
};

/**
 * Formats a duration in seconds to HH:MM:SS or MM:SS format
 * @param {number} totalSeconds - total seconds (can be negative)
 * @returns {string} e.g. "14:07" or "-02:14"
 */
export const formatTimerString = (totalSeconds) => {
  const isNeg = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);
  
  const hrs = Math.floor(absSeconds / 3600);
  const mins = Math.floor((absSeconds % 3600) / 60);
  const secs = absSeconds % 60;
  
  const pad = (num) => String(num).padStart(2, '0');
  
  let result = '';
  if (hrs > 0) {
    result = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  } else {
    result = `${pad(mins)}:${pad(secs)}`;
  }
  
  return isNeg ? `-${result}` : result;
};
