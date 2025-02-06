import crypto from "crypto";
import { SignJWT } from "jose";
import dotenv from "dotenv";

dotenv.config();

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
    return false; // Code does not exist
  }

  if (storedCode.clientId !== clientId) {
    return false; // Client mismatch
  }

  if (storedCode.expiresAt < Date.now()) {
    authCodes.delete(authCode);
    return false; // Code expired
  }

  // Valid code, remove it after use
  authCodes.delete(authCode);
  return true;
}

/**
 * Generates a JWT access token.
 * @param clientId The client associated with the token.
 * @returns A signed JWT access token.
 */
export async function generateAccessToken(clientId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");

  return new SignJWT({ clientId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}
