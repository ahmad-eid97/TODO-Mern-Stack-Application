import { z } from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const fileSchema = z.object({
  originalname: z.string().min(1, "Filename is required"),
  mimetype: z.enum(["image/jpeg", "image/png", "image/webp"], {
    error: "File must be a JPG, PNG, or WebP image",
  }),
  size: z.number().int().positive("File must not be empty")
    .max(MAX_FILE_SIZE, "File must be at most 5 MB"),
}).passthrough();
