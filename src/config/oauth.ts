import { Request, Response } from "express";
import {
  generateAuthCode,
  validateAuthCode,
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
} from "../utils/auth";
import { logEvent } from "../utils/logger";

export function authorize(req: Request, res: Response) {
  const { client_id, state } = req.query;
  const authorizationCode = generateAuthCode(client_id as string);
  logEvent(`Generated authorization code for client: ${client_id}`);

  let redirectUrl = `${req.query.redirect_uri}?code=${authorizationCode}`;
  if (state) redirectUrl += `&state=${state}`;

  return res.redirect(302, redirectUrl);
}

export async function exchangeToken(req: Request, res: Response) {
  const { grant_type, code, refresh_token, client_id } = req.body; // ❌ Removed unused `redirect_uri`

  if (grant_type === "authorization_code") {
    if (!validateAuthCode(code, client_id)) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Invalid or expired authorization code.",
      });
    }
    const accessToken = await generateAccessToken(client_id);
    const newRefreshToken = generateRefreshToken(client_id);
    logEvent(`Issued new access token for client ${client_id}`);
    return res.json({
      access_token: accessToken,
      refresh_token: newRefreshToken,
      token_type: "bearer",
      expires_in: 3600,
    });
  }

  if (grant_type === "refresh_token") {
    if (!validateRefreshToken(refresh_token, client_id)) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Invalid or expired refresh token.",
      });
    }
    const newAccessToken = await generateAccessToken(client_id);
    logEvent(`Refreshed access token for client ${client_id}`);
    return res.json({
      access_token: newAccessToken,
      token_type: "bearer",
      expires_in: 3600,
    });
  }

  return res.status(400).json({
    error: "unsupported_grant_type",
    error_description: "Invalid grant_type.",
  });
}
