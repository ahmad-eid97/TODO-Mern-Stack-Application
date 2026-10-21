import { z } from "zod";
export const userEditSchema = z.object({
    name: z.string().trim().min(1, "Name is required")
        .max(50, "Name must be less than 50 characters").optional(),
    email: z.email("Invalid email address").optional(),
});
export const passwordEditSchema = z
    .object({
    oldPassword: z
        .string()
        .min(1, "Current password is required"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
        message: "Password must be at most 72 UTF-8 bytes",
    }),
    confirmPassword: z
        .string()
        .min(1, "Please confirm your new password"),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})
    .refine((data) => data.oldPassword !== data.password, {
    message: "New password must be different from current password",
    path: ["password"],
});
//# sourceMappingURL=profile.validations.js.map