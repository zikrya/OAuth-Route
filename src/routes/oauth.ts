import { Router, Request, Response } from "express";
import crypto from "crypto";

const router = Router();

const VALID_CLIENT_ID = "upfirst";
const VALID_REDIRECT_URI = "http://localhost:8081/process";

interface AuthRequestQuery {
  response_type?: string;
  client_id?: string;
  redirect_uri?: string;
  state?: string;
}

router.get(
  "/oauth/authorize",
  (req: Request<{}, {}, {}, Partial<AuthRequestQuery>>, res: Response) => {
    const { response_type, client_id, redirect_uri, state } = req.query;

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

    const authorizationCode = crypto.randomBytes(16).toString("hex");

    let redirectUrl = `${redirect_uri}?code=${authorizationCode}`;
    if (state) {
      redirectUrl += `&state=${state}`;
    }

    return res.redirect(302, redirectUrl);
  }
);

export default router;
