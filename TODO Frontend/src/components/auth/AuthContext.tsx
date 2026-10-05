/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";
import { AUTH_SESSION_EXPIRED_EVENT } from "../../api/axiosInstance";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../../types/auth.types";
import { getErrorMessage } from "../../utils/errorUtils";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: "INIT_DONE"; payload: User | null }
  | { type: "SET_AUTH"; payload: User }
  | { type: "LOGOUT" };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

function reducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INIT_DONE":
    case "SET_AUTH":
      return {
        user: action.payload,
        isLoading: false,
        isAuthenticated: action.payload !== null,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
  }
}

function cacheUser(user: User | null) {
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("mock_users");
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
  } catch {
    // An unavailable optional cache must not prevent cookie authentication.
  }
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const sessionRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    sessionRequest.current = controller;
    cacheUser(null);

    const clearSession = () => {
      controller.abort();
      cacheUser(null);
      dispatch({ type: "LOGOUT" });
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, clearSession);

    const restoreSession = async () => {
      try {
        const user = await authApi.getProfile(controller.signal);
        if (!controller.signal.aborted) {
          cacheUser(user);
          dispatch({ type: "INIT_DONE", payload: user });
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        cacheUser(null);
        dispatch({ type: "INIT_DONE", payload: null });
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          toast.error("Could not restore your session. Please try signing in.");
        }
      }
    };
    const restoreTimer = setTimeout(() => {
      void restoreSession();
    }, 0);

    return () => {
      clearTimeout(restoreTimer);
      controller.abort();
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, clearSession);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    sessionRequest.current?.abort();
    try {
      const user = await authApi.login(credentials);
      cacheUser(user);
      dispatch({ type: "SET_AUTH", payload: user });
      toast.success(`Welcome back, ${user.name}!`);
    } catch (error) {
      throw new Error(getErrorMessage(error), { cause: error });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    sessionRequest.current?.abort();
    try {
      const user = await authApi.register(credentials);
      cacheUser(user);
      dispatch({ type: "SET_AUTH", payload: user });
      toast.success(`Welcome aboard, ${user.name}!`);
    } catch (error) {
      throw new Error(getErrorMessage(error), { cause: error });
    }
  };

  const logout = async () => {
    await authApi.logout();
    sessionRequest.current?.abort();
    cacheUser(null);
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
