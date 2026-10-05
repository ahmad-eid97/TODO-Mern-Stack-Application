import axiosInstance from "./axiosInstance";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/auth.types";

interface AuthUserResponse {
  data: Omit<User, "id"> & { _id: string };
}

const toUser = ({ data }: AuthUserResponse): User => ({
  id: data._id,
  name: data.name,
  email: data.email,
  avatar: data.avatar,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});

export const authApi = {
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
