import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const avatarDirectory = fileURLToPath(
  new URL("../../uploads/avatars/", import.meta.url),
);

export const saveImage = async (buffer: Buffer): Promise<string> => {
  await mkdir(avatarDirectory, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const filePath = path.join(avatarDirectory, filename);

  await writeFile(filePath, buffer, { flag: "wx" });

  return `/uploads/avatars/${filename}`;
};
