import fs from "fs";
import path from "path";

const LOG_FILE = path.join(__dirname, "../../logs/oauth.log");

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

/**
 * Logs messages to a file with timestamps.
 * @param message The log message
 */
export function logEvent(message: string): void {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
}
