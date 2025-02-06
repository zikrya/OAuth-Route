import fs from "fs";
import path from "path";

const LOG_FILE = path.join(__dirname, "../../logs/oauth.log");

if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

/**
 * @param message
 */
export function logEvent(message: string): void {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
}
