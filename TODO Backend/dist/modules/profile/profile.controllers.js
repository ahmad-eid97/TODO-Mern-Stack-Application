//= Services
import { handleEditUser, handleEditUserPassword } from "./profile.services.js";
//= Utils
import { toPublicUser } from "../auth/auth.response.js";
import { generateAccessToken } from "../../utils/jwt.js";
import { ACCESS_TOKEN_COOKIE } from "../auth/auth.constants.js";
import { getAccessTokenCookieOptions } from "../auth/auth.cookie.js";
export const editUser = async (req, res, _next) => {
    const updatedUser = await handleEditUser(req.user, req.body, req.file);
    res.status(200).json({
        data: toPublicUser(updatedUser)
    });
};
export const editUserPassword = async (req, res, _next) => {
    const user = await handleEditUserPassword(req.user._id, req.body);
    // Keep this browser signed in while older tokens on other sessions are revoked.
    const token = generateAccessToken({ userId: user._id.toString(), tokenVersion: user.tokenVersion });
    res.cookie(ACCESS_TOKEN_COOKIE, token, getAccessTokenCookieOptions(token));
    res.status(200).json({
        message: "Password changed successfully"
    });
};
//# sourceMappingURL=profile.controllers.js.map