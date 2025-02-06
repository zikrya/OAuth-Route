import { Router } from "express";
import { authorize, exchangeToken } from "../config/oauth";
import { validateAuthRequest } from "../middleware/validateOAuth";
import { tokenRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.get("/oauth/authorize", validateAuthRequest, authorize);
router.post("/oauth/token", tokenRateLimiter, exchangeToken);

export default router;
