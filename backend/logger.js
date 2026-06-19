// logger.js - Handles writing all activity logs to a file

const fs   = require('fs');
const path = require('path');

// Log file will be created at backend/logs/activity.log
const LOG_DIR  = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'activity.log');

// Create the logs folder if it doesn't exist yet
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ─── Log Level Colors (for terminal output) ───────────────────────────────────
const LEVELS = {
  INFO:    { label: 'INFO ',   color: '\x1b[36m' }, // Cyan
  SUCCESS: { label: 'SUCCESS', color: '\x1b[32m' }, // Green
  WARNING: { label: 'WARN ',   color: '\x1b[33m' }, // Yellow
  ERROR:   { label: 'ERROR',   color: '\x1b[31m' }, // Red
};
const RESET = '\x1b[0m';

// ─── Core Log Function ────────────────────────────────────────────────────────
function log(level, action, details = {}) {
  const { label, color } = LEVELS[level] || LEVELS.INFO;
  const timestamp = new Date().toISOString(); // e.g. 2024-01-15T10:30:00.000Z

  // Build the log entry as a JSON line (easy to parse later)
  const entry = {
    timestamp,
    level,
    action,
    ...details,
  };

  const line = JSON.stringify(entry);

  // 1. Write to file (append mode — never overwrites old logs)
  fs.appendFile(LOG_FILE, line + '\n', (err) => {
    if (err) console.error('Failed to write log:', err.message);
  });

  // 2. Also print to terminal with colors
  const ip = details.ip || '-';
  const extra = details.email || details.message || '';
  console.log(`${color}[${label}]${RESET} ${timestamp} | ${action.padEnd(20)} | ip:${ip} ${extra}`);
}

// ─── Convenience Methods ──────────────────────────────────────────────────────
const logger = {
  info:    (action, details) => log('INFO',    action, details),
  success: (action, details) => log('SUCCESS', action, details),
  warning: (action, details) => log('WARNING', action, details),
  error:   (action, details) => log('ERROR',   action, details),

  // ─── Read logs back (for the viewer page) ──────────────────────────────────
  readLogs(options = {}) {
    const { limit = 200, level = null, search = '' } = options;

    if (!fs.existsSync(LOG_FILE)) return [];

    const lines = fs.readFileSync(LOG_FILE, 'utf8')
      .split('\n')
      .filter(Boolean);               // Remove empty lines

    let entries = lines.map(line => {
      try { return JSON.parse(line); }
      catch { return null; }
    }).filter(Boolean);               // Remove any corrupt lines

    // Filter by level if requested
    if (level) {
      entries = entries.filter(e => e.level === level);
    }

    // Filter by search term
    if (search) {
      const term = search.toLowerCase();
      entries = entries.filter(e =>
        JSON.stringify(e).toLowerCase().includes(term)
      );
    }

    // Return newest first, limited to `limit` entries
    return entries.reverse().slice(0, limit);
  },

  // ─── Get summary stats ──────────────────────────────────────────────────────
  getStats() {
    if (!fs.existsSync(LOG_FILE)) {
      return { total: 0, INFO: 0, SUCCESS: 0, WARNING: 0, ERROR: 0 };
    }

    const lines = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean);
    const stats = { total: 0, INFO: 0, SUCCESS: 0, WARNING: 0, ERROR: 0 };

    lines.forEach(line => {
      try {
        const entry = JSON.parse(line);
        stats.total++;
        if (stats[entry.level] !== undefined) stats[entry.level]++;
      } catch {}
    });

    return stats;
  },

  // ─── Clear all logs ─────────────────────────────────────────────────────────
  clearLogs() {
    fs.writeFileSync(LOG_FILE, '');
  },

  LOG_FILE, // Export the path so we can show it in the UI
};

module.exports = logger;
