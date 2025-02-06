import crypto from "crypto";
import { SignJWT } from "jose";
import dotenv from "dotenv";
import { logEvent } from "./logger";

dotenv.config();

const authCodes = new Map<string, { clientId: string; expiresAt: number }>();
const refreshTokens = new Map<string, { clientId: string; expiresAt: number }>();

export function generateAuthCode(clientId: string): string {
  const authCode = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000;

  authCodes.set(authCode, { clientId, expiresAt });

  logEvent(`Generated authorization code for client ${clientId}`);
  return authCode;
}

export function validateAuthCode(authCode: string, clientId: string): boolean {
  const storedCode = authCodes.get(authCode);

  if (!storedCode) {
    logEvent(`Failed authorization code validation: Code not found`);
    return false;
  }

  if (storedCode.clientId !== clientId) {
    logEvent(`Failed authorization code validation: Client mismatch`);
    return false;
  }

  if (storedCode.expiresAt < Date.now()) {
    logEvent(`Failed authorization code validation: Code expired`);
    authCodes.delete(authCode);
    return false;
  }

  authCodes.delete(authCode);
  return true;
}

/**
 * Generates a JWT access token.
 */
export async function generateAccessToken(clientId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");

  return new SignJWT({ clientId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}


export function generateRefreshToken(clientId: string): string {
  const refreshToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  refreshTokens.set(refreshToken, { clientId, expiresAt });

  logEvent(`Generated refresh token for client ${clientId}`);
  return refreshToken;
}

export function validateRefreshToken(refreshToken: string, clientId: string): boolean {
  const storedToken = refreshTokens.get(refreshToken);

  if (!storedToken) {
    logEvent(`Failed refresh token validation: Token not found`);
    return false;
  }

  if (storedToken.clientId !== clientId) {
    logEvent(`Failed refresh token validation: Client mismatch`);
    return false;
  }

  if (storedToken.expiresAt < Date.now()) {
    logEvent(`Failed refresh token validation: Token expired`);
    refreshTokens.delete(refreshToken);
    return false;
  }

  return true;
}
