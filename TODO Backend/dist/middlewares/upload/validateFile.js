import { AppError } from "../../errors/AppError.js";
import { fileSchema } from "./file.validation.js";
const validateFile = (req, _res, next) => {
    const files = req.file ? [req.file] : Array.isArray(req.files)
        ? req.files
        : Object.values(req.files ?? {}).flat();
    for (const file of files) {
        const result = fileSchema.safeParse(file);
        if (!result.success) {
            const details = result.error.issues.map((issue) => ({
                field: [file.fieldname, ...issue.path].join("."),
                message: issue.message,
            }));
            return next(new AppError("Validation Error", 400, "VALIDATION_ERROR", details));
        }
    }
    next();
};
export default validateFile;
//# sourceMappingURL=validateFile.js.map