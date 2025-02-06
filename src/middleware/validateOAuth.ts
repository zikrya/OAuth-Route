import { Request, Response, NextFunction } from "express";
import { VALID_CLIENT_ID, VALID_REDIRECT_URI } from "../config/config";

export function validateAuthRequest(req: Request, res: Response, next: NextFunction): Response | void {
  const { response_type, client_id, redirect_uri } = req.query;

  if (!response_type || !client_id || !redirect_uri) {
    return res.status(400).json({
      error: "invalid_request",
      error_description: "Missing required parameters",
    });
  }

  if (response_type !== "code") {
    return res.status(400).json({
      error: "unsupported_response_type",
      error_description: "Only 'code' response type is supported",
    });
  }

  if (client_id !== VALID_CLIENT_ID || redirect_uri !== VALID_REDIRECT_URI) {
    return res.status(400).json({
      error: "invalid_client",
      error_description: "Invalid client_id or redirect_uri",
    });
  }

  next(); // ✅ This ensures the request moves forward if valid
}
