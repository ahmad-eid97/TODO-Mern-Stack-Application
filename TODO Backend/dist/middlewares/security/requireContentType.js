import { AppError } from "../../errors/AppError.js";
const requireContentType = (contentType) => {
    return (req, _res, next) => {
        const hasBody = req.headers["transfer-encoding"] !== undefined ||
            Number(req.headers["content-length"] ?? 0) > 0;
        if (hasBody && !req.is(contentType)) {
            return next(new AppError(`Request bodies must use ${contentType}`, 415, "UNSUPPORTED_CONTENT_TYPE"));
        }
        next();
    };
};
export default requireContentType;
//# sourceMappingURL=requireContentType.js.map