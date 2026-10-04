import type { PublicUser } from "./auth.types.js";

// Explicitly allow public fields so new private fields stay out of API responses.
export const toPublicUser = (user: PublicUser): PublicUser => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
