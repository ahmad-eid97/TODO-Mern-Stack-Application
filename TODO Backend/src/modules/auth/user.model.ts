import { Schema, model } from "mongoose";
//= Types
import type { IUser } from "./auth.types.js";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: "string",
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: "string",
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: "string",
      required: true,
      minLength: 6,
      maxLength: 100,
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
    avatar: {
      type: "string",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = model<IUser>("User", userSchema);

export default UserModel;
