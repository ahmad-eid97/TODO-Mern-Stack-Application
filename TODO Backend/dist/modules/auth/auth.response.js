// Explicitly allow public fields so new private fields stay out of API responses.
export const toPublicUser = (user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
//# sourceMappingURL=auth.response.js.map