import rateLimit from "express-rate-limit";

export const tokenRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    error: "too_many_requests",
    error_description: "Too many requests. Please try again later.",
  },
  headers: true,
});
