import jwt from "jsonwebtoken";
import env from "../config/env.js";
export const generateAccessToken = (payload) => {
    return jwt.sign({ ...payload, tokenVersion: payload.tokenVersion ?? 0 }, env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: env.JWT_EXPIRES_IN,
    });
};
export const verifyAccessToken = (token) => {
    if (typeof token !== "string" || !token) {
        throw new jwt.JsonWebTokenError("Invalid access token");
    }
    const payload = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ["HS256"],
    });
    if (typeof payload === "string" ||
        typeof payload.userId !== "string" ||
        !/^[a-fA-F0-9]{24}$/.test(payload.userId) ||
        typeof payload.exp !== "number" ||
        !Number.isSafeInteger(payload.exp) ||
        payload.exp <= 0 ||
        (payload.tokenVersion !== undefined &&
            (!Number.isSafeInteger(payload.tokenVersion) || payload.tokenVersion < 0))) {
        throw new jwt.JsonWebTokenError("Invalid access token claims");
    }
    // Older tokens without a version remain valid only until the first change.
    return { userId: payload.userId, exp: payload.exp, tokenVersion: payload.tokenVersion ?? 0 };
};
//# sourceMappingURL=jwt.js.map