import crypto from "crypto";

const authCodes = new Map<string, { clientId: string; expiresAt: number }>();

/**
 * Generates a unique authorization code and stores it temporarily.
 * @param clientId The client requesting authorization.
 * @returns The generated authorization code.
 */
export function generateAuthCode(clientId: string): string {
  const authCode = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000;

  authCodes.set(authCode, { clientId, expiresAt });

  return authCode;
}

/**
 * Validates an authorization code and removes it after use.
 * @param authCode The authorization code to validate.
 * @param clientId The client using the code.
 * @returns True if the code is valid, otherwise false.
 */
export function validateAuthCode(authCode: string, clientId: string): boolean {
  const storedCode = authCodes.get(authCode);

  if (!storedCode) {
    return false;
  }

  if (storedCode.clientId !== clientId) {
    return false;
  }

  if (storedCode.expiresAt < Date.now()) {
    authCodes.delete(authCode);
    return false;
  }

  authCodes.delete(authCode);
  return true;
}

export default {
  generateAuthCode,
  validateAuthCode,
};
