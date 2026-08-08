// import axiosInstance from './axiosInstance'; // ← Uncomment this when backend is ready
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
  UpdateProfilePayload,
} from "../types/auth.types";
import type { ApiResponse } from "../types/api.types";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

type StoredUser = User & { password: string };

const USERS_STORE = "mock_users";

const readUsers = (): StoredUser[] =>
  JSON.parse(localStorage.getItem(USERS_STORE) || "[]");

const writeUsers = (users: StoredUser[]) =>
  localStorage.setItem(USERS_STORE, JSON.stringify(users));

const mockToken = (userId: string) => btoa(`${userId}:${Date.now()}`);

const dicebearAvatar = (seed: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=7c3aed&fontColor=ffffff`;
// ──────────────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthResponse>> => {
    // return (await axiosInstance.post('/auth/login', credentials)).data;

    await delay(600);
    const users = readUsers();
    const found = users.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password,
    );
    if (!found) {
      throw {
        response: {
          status: 401,
          data: { message: "Invalid email or password" },
        },
      };
    }
    const safeUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      avatar: found.avatar,
      createdAt: found.createdAt,
    };
    const token = mockToken(safeUser.id);
    return {
      data: { user: safeUser, token },
      message: "Login successful",
      success: true,
    };
  },

  register: async (
    credentials: RegisterCredentials,
  ): Promise<ApiResponse<AuthResponse>> => {
    // return (await axiosInstance.post('/auth/register', credentials)).data;

    await delay(800);
    const users = readUsers();
    if (users.find((u) => u.email === credentials.email)) {
      throw {
        response: { status: 409, data: { message: "Email already in use" } },
      };
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
      avatar: dicebearAvatar(credentials.name),
      createdAt: new Date().toISOString(),
    };
    writeUsers([...users, newUser]);
    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
    };
    const token = mockToken(safeUser.id);
    return {
      data: { user: safeUser, token },
      message: "Registration successful",
      success: true,
    };
  },

  logout: async (): Promise<void> => {
    // await axiosInstance.post('/auth/logout');

    await delay(200);
    // Server would invalidate the token on its side
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    // return (await axiosInstance.get('/auth/me')).data;

    await delay(400);
    const raw = localStorage.getItem("auth_user");
    if (!raw)
      throw { response: { status: 401, data: { message: "Unauthorized" } } };
    return {
      data: JSON.parse(raw) as User,
      message: "Profile fetched",
      success: true,
    };
  },

  updateProfile: async (
    updates: UpdateProfilePayload,
  ): Promise<ApiResponse<User>> => {
    // return (await axiosInstance.patch('/auth/me', updates)).data;

    await delay(500);
    const raw = localStorage.getItem("auth_user");
    if (!raw)
      throw { response: { status: 401, data: { message: "Unauthorized" } } };
    const current: User = JSON.parse(raw);
    const updated: User = { ...current, ...updates };
    localStorage.setItem("auth_user", JSON.stringify(updated));
    const users = readUsers();
    writeUsers(
      users.map((u) => (u.id === updated.id ? { ...u, ...updates } : u)),
    );
    return { data: updated, message: "Profile updated", success: true };
  },
};
