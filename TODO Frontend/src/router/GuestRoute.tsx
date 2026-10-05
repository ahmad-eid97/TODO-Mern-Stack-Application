import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";
import Spinner from "../components/ui/Spinner";

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
