//= Validation
import { AppError } from "../../errors/AppError.js";
const validate = (schema, part = "body") => {
    return (req, _res, next) => {
        const result = schema.safeParse(req[part]);
        if (!result.success) {
            // Keep invalid arrays from producing excessively large error responses.
            const details = result.error.issues.slice(0, 20).map((error) => ({
                field: error.path.join("."),
                message: error.message,
            }));
            return next(new AppError("Validation Error", 400, "VALIDATION_ERROR", details));
        }
        if (part === "query") {
            req.validatedQuery = result.data;
        }
        else {
            req[part] = result.data;
        }
        next();
    };
};
export default validate;
//# sourceMappingURL=validate.js.map