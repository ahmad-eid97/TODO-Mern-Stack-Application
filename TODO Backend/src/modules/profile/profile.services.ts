//= Modules
import bcrypt from "bcrypt";
//= Utils
import { AppError } from "../../errors/AppError.js";
import { compressImage } from "../../utils/compressImage.js"
import { saveImage } from "../../utils/saveImage.js";
//= Types
import type { IUser } from "../auth/auth.types.js"
import UserModel from "../auth/user.model.js";
import type { PasswordEditType, UpdateUser } from "./profile.validations.js";

const handleEditUser = async (user: IUser, body: UpdateUser, file: Express.Multer.File | undefined) => {
  const existingUser = await UserModel.findById(user._id);

  if (!existingUser) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  Object.assign(existingUser, body);

  if (file) {
    const compressed = await compressImage(file.buffer);
    const avatarPath = await saveImage(compressed);
    existingUser.avatar = avatarPath;
  }

  await existingUser.save();

  return existingUser;
}

const handleEditUserPassword = async (userId: string, body: PasswordEditType) => {
  const existingUser = await UserModel.findById(userId).select("+password");

  if (!existingUser) {
    throw new AppError("User not found!", 404, "USER_NOT_FOUND")
  }

  const checkOldPassword = await bcrypt.compare(body.oldPassword, existingUser.password);

  if (!checkOldPassword) {
    throw new AppError("Old password is wrong!", 401, "WRONG_OLD_PASSWORD");
  }

  const newPasswordHashed = await bcrypt.hash(body.password, 12);

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: userId, password: existingUser.password },
    { $set: { password: newPasswordHashed }, $inc: { tokenVersion: 1 } },
    { new: true, runValidators: true },
  );

  if (!updatedUser) {
    throw new AppError("Password changed during this request. Please log in again", 401, "AUTH_SESSION_REVOKED");
  }

  return updatedUser;
}

export {
  handleEditUser,
  handleEditUserPassword
}
