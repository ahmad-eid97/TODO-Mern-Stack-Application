//= Models
import bcrypt from "bcrypt";
//= Middlewares
import { AppError } from "../../errors/AppError.js";
//= Model
import UserModel from "./user.model.js";
const registerUser = async (userData) => {
    const { name, email, password } = userData;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        throw new AppError("This email is already registered", 409, "EMAIL_ALREADY_REGISTERED");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const avatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;
    const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        avatar,
    });
    return user;
};
const loginUser = async ({ email, password, }) => {
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
        throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }
    return user;
};
export default {
    registerUser,
    loginUser,
};
//# sourceMappingURL=auth.service.js.map