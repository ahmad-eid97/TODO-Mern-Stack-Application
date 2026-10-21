import sharp from "sharp";
import { AppError } from "../errors/AppError.js";
export const compressImage = async (buffer) => {
    try {
        const image = sharp(buffer, {
            limitInputPixels: 25_000_000,
            failOn: "warning"
        });
        const metadata = await image.metadata();
        if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) {
            throw new Error("Unsupported image format");
        }
        return await image.rotate().resize(512, 512, {
            fit: "cover",
            withoutEnlargement: true
        })
            .webp({ quality: 80 })
            .toBuffer();
    }
    catch {
        throw new AppError("Upload a valid JPG, PNG, or WebP image", 400, "INVALID_IMAGE");
    }
};
//# sourceMappingURL=compressImage.js.map