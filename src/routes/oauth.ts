import { Router, Request, Response } from "express";
import { generateAuthCode, validateAuthCode, generateAccessToken } from "../utils/auth";

const router = Router();

const VALID_CLIENT_ID = "upfirst";
const VALID_REDIRECT_URI = "http://localhost:8081/process";

interface AuthRequestQuery {
  response_type?: string;
  client_id?: string;
  redirect_uri?: string;
  state?: string;
}

interface TokenRequestBody {
  grant_type?: string;
  code?: string;
  client_id?: string;
  redirect_uri?: string;
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

    const authorizationCode = generateAuthCode(client_id);

    let redirectUrl = `${redirect_uri}?code=${authorizationCode}`;
    if (state) {
      redirectUrl += `&state=${state}`;
    }

    return res.redirect(302, redirectUrl);
  }
);


router.post(
  "/oauth/token",
  async (req: Request<{}, {}, TokenRequestBody>, res: Response) => {
    const { grant_type, code, client_id, redirect_uri } = req.body;

    if (!grant_type || !code || !client_id || !redirect_uri) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing required parameters.",
      });
    }

    if (grant_type !== "authorization_code") {
      return res.status(400).json({
        error: "unsupported_grant_type",
        error_description: "Only 'authorization_code' is supported.",
      });
    }

    if (client_id !== VALID_CLIENT_ID || redirect_uri !== VALID_REDIRECT_URI) {
      return res.status(400).json({
        error: "invalid_client",
        error_description: "Invalid client_id or redirect_uri.",
      });
    }

    const isValid = validateAuthCode(code, client_id);
    if (!isValid) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Invalid or expired authorization code.",
      });
    }

    const accessToken = await generateAccessToken(client_id);

    return res.json({
      access_token: accessToken,
      token_type: "bearer",
      expires_in: 3600,
    });
  }
);

export default router;
