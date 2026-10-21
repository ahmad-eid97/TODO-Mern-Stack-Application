import axiosInstance from "./axiosInstance";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
  ProfileUpdate,
  PasswordChange,
} from "../types/auth.types";

interface AuthUserResponse {
  data: Omit<User, "id"> & { _id: string };
}

const toUser = ({ data }: AuthUserResponse): User => ({
  id: data._id,
  name: data.name,
  email: data.email,
  avatar: data.avatar?.startsWith("/uploads/")
    ? new URL(data.avatar, axiosInstance.defaults.baseURL).href
    : data.avatar,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});

export const authApi = {
  updateProfile: async (changes: ProfileUpdate): Promise<User> => {
    const body = new FormData();
    if (changes.name !== undefined) body.append("name", changes.name);
    if (changes.email !== undefined) body.append("email", changes.email);
    if (changes.avatar !== undefined) body.append("avatar", changes.avatar);
    const response = await axiosInstance.patch<AuthUserResponse>("/profile/me", body, {
      headers: { "Content-Type": undefined },
    });
    return toUser(response.data);
  },

  changePassword: async (values: PasswordChange): Promise<void> => {
    await axiosInstance.patch("/profile/password", values);
  },

  login: async ({ email, password }: LoginCredentials): Promise<User> => {
    const response = await axiosInstance.post<AuthUserResponse>("/auth/login", {
      email,
      password,
    });
    return toUser(response.data);
  },

  register: async (credentials: RegisterCredentials): Promise<User> => {
    const response = await axiosInstance.post<AuthUserResponse>(
      "/auth/register",
      credentials,
    );
    return toUser(response.data);
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  getProfile: async (signal?: AbortSignal): Promise<User> => {
    const response = await axiosInstance.get<AuthUserResponse>("/auth/me", {
      signal,
    });
    return toUser(response.data);
  },
};
