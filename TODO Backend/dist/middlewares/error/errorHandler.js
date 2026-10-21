import { AppError } from "../../errors/AppError.js";
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message,
            code: err.code,
            ...(err.details !== undefined && { details: err.details }),
        });
    }
    // Return safe client errors for the documented express.json() parser failures.
    const parserErrors = {
        "entity.too.large": {
            status: 413,
            message: "Request body exceeds 10 KB",
            code: "PAYLOAD_TOO_LARGE",
        },
        "entity.parse.failed": {
            status: 400,
            message: "Invalid JSON payload",
            code: "INVALID_JSON",
        },
        "encoding.unsupported": {
            status: 415,
            message: "Compressed or unsupported body encodings are not allowed",
            code: "UNSUPPORTED_CONTENT_ENCODING",
        },
        "charset.unsupported": {
            status: 415,
            message: "Unsupported JSON character encoding",
            code: "UNSUPPORTED_CHARSET",
        },
        "request.size.invalid": {
            status: 400,
            message: "Invalid request body length",
            code: "INVALID_BODY_LENGTH",
        },
        "request.aborted": {
            status: 400,
            message: "Request body was interrupted",
            code: "REQUEST_ABORTED",
        },
    };
    const parserError = typeof err?.type === "string" && Object.hasOwn(parserErrors, err.type)
        ? parserErrors[err.type]
        : undefined;
    if (parserError) {
        return res.status(parserError.status).json({
            status: parserError.status,
            message: parserError.message,
            code: parserError.code,
        });
    }
    //= For us as a BE development team, we want to know what went wrong in the server, so we log the error to the console.
    console.error("Unexpected Error:", err);
    res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
    });
};
export default errorHandler;
//# sourceMappingURL=errorHandler.js.map