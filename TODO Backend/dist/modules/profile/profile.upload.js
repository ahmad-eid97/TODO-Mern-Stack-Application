import multer from "multer";
import { AppError } from "../../errors/AppError.js";
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 3, parts: 4, fieldSize: 1024 },
    fileFilter: (_req, file, callback) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            return callback(new AppError("Choose a JPG, PNG, or WebP image", 400, "INVALID_AVATAR"));
        }
        callback(null, true);
    },
}).single("avatar");
export const uploadAvatar = (req, res, next) => {
    upload(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            return next(new AppError(error.code === "LIMIT_FILE_SIZE" ? "Avatar must be at most 5 MB" : "Invalid upload: one avatar and up to three text fields are allowed", error.code === "LIMIT_FILE_SIZE" ? 413 : 400, "INVALID_UPLOAD"));
        }
        if (error)
            return next(error instanceof AppError ? error : new AppError("Malformed multipart upload", 400, "INVALID_UPLOAD"));
        next();
    });
};
//# sourceMappingURL=profile.upload.js.map