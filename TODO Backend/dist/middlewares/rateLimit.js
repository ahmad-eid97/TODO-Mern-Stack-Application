import { rateLimit } from "express-rate-limit";
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
    },
});
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many login attempts. Please try again later.",
        code: "LOGIN_RATE_LIMIT_EXCEEDED",
    },
});
// Runs after authentication, so attempts are limited per account across IPs.
export const passwordChangeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    keyGenerator: (req) => req.user._id.toString(),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many password change attempts. Please try again later.",
        code: "PASSWORD_CHANGE_RATE_LIMIT_EXCEEDED",
    },
});
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many registration attempts. Please try again later.",
        code: "REGISTER_RATE_LIMIT_EXCEEDED",
    },
});
//# sourceMappingURL=rateLimit.js.map