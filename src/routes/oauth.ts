import { Router } from "express";
import { authorize, exchangeToken } from "../config/oauth";
import { validateAuthRequest } from "../middleware/validateOAuth";

const router = Router();

router.get("/oauth/authorize", validateAuthRequest, authorize);
router.post("/oauth/token", exchangeToken);

export default router;