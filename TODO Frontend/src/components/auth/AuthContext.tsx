/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfilePayload,
} from "../../types/auth.types";
import { getErrorMessage } from "../../utils/errorUtils";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: "INIT_DONE"; payload: { user: User; token: string } | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_AUTH"; payload: { user: User; token: string } }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "LOGOUT" };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INIT_DONE":
      return action.payload
        ? {
            user: action.payload.user,
            token: action.payload.token,
            isLoading: false,
            isAuthenticated: true,
          }
        : { ...initialState, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_AUTH":
      return {
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case "UPDATE_USER":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: UpdateProfilePayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const raw = localStorage.getItem("auth_user");
    if (token && raw) {
      try {
        dispatch({
          type: "INIT_DONE",
          payload: { user: JSON.parse(raw) as User, token },
        });
      } catch {
        dispatch({ type: "INIT_DONE", payload: null });
      }
    } else {
      dispatch({ type: "INIT_DONE", payload: null });
    }
  }, []);

  const persist = (user: User, token: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    dispatch({ type: "SET_AUTH", payload: { user, token } });
  };

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await authApi.login(credentials);
      persist(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
    } catch (err) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw new Error(getErrorMessage(err), { cause: err });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await authApi.register(credentials);
      persist(res.data.user, res.data.token);
      toast.success(`Welcome aboard, ${res.data.user.name}! 🎉`);
    } catch (err) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw new Error(getErrorMessage(err), { cause: err });
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      dispatch({ type: "LOGOUT" });
      toast.success("Logged out successfully");
    }
  };

  const updateProfile = async (updates: UpdateProfilePayload) => {
    const res = await authApi.updateProfile(updates);
    localStorage.setItem("auth_user", JSON.stringify(res.data));
    dispatch({ type: "UPDATE_USER", payload: res.data });
    toast.success("Profile updated");
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
