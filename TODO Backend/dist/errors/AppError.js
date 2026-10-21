export class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = "AppError";
        this.details = details;
    }
}
//# sourceMappingURL=AppError.js.map