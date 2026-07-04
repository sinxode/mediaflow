// Central Logging & Monitoring Interface Wrapper
// Formats log output and intercepts errors for Sentry/observability forwarding in production.

const IS_DEV = import.meta.env.DEV;

export const logger = {
  info: (message, meta = {}) => {
    if (IS_DEV) {
      console.log(`%c[INFO] ${message}`, 'color: #0284c7; font-weight: bold;', meta);
    } else {
      // Forward info payloads to logging aggregators (e.g. Datadog, LogRocket)
    }
  },

  warn: (message, meta = {}) => {
    if (IS_DEV) {
      console.warn(`[WARN] ${message}`, meta);
    } else {
      // Forward warning logs
    }
  },

  error: (message, error = null, meta = {}) => {
    const errorDetails = {
      message,
      errorMessage: error?.message || 'Unknown Error',
      stack: error?.stack,
      ...meta,
      timestamp: new Date().toISOString()
    };

    if (IS_DEV) {
      console.error(`[ERROR] ${message}`, error, meta);
    } else {
      // Capture error exception logs in telemetry platforms (e.g. Sentry.captureException)
      try {
        window.dispatchEvent(
          new CustomEvent('mediaflow_telemetry_error', { detail: errorDetails })
        );
      } catch (err) {
        console.error('Failed to dispatch logging telemetry event', err);
      }
    }
  },

  debug: (message, meta = {}) => {
    if (IS_DEV) {
      console.debug(`%c[DEBUG] ${message}`, 'color: #7c3aed;', meta);
    }
  }
};

export default logger;
