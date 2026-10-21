import { AppError } from "../../errors/AppError.js";
const requestProtection = (req, _res, next) => {
    const queryStart = req.originalUrl.indexOf("?");
    const query = queryStart === -1 ? "" : req.originalUrl.slice(queryStart + 1);
    if (Buffer.byteLength(query, "utf8") > 4 * 1024) {
        return next(new AppError("Query string exceeds 4 KB", 414, "QUERY_TOO_LARGE"));
    }
    if (new URLSearchParams(query).size > 50) {
        return next(new AppError("At most 50 query parameters are allowed", 400, "TOO_MANY_QUERY_PARAMETERS"));
    }
    return next();
};
export default requestProtection;
//# sourceMappingURL=requestProtection.js.map