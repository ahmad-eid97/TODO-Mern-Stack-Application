import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../auth/AuthContext";
import { useTodos } from "../todos/TodoContext";
import Avatar from "../ui/Avatar";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/todos", icon: CheckSquare, label: "My Todos" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { stats } = useTodos();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={clsx(
        "relative flex flex-col bg-slate-900 border-r border-slate-800 shrink-0 transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600 flex items-center justify-center transition-all"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent",
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
            {!collapsed && to === "/todos" && stats && stats.pending > 0 && (
              <span className="ml-auto text-xs bg-violet-600 text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                {stats.pending > 99 ? "99+" : stats.pending}
              </span>
            )}
          </NavLink>
        ))}

        {!collapsed && (
          <div className="pt-4 mt-2 border-t border-slate-800">
            <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              Quick Stats
            </p>
            <div className="px-3 space-y-1.5">
              {[
                {
                  label: "Total",
                  value: stats?.total ?? 0,
                  color: "text-slate-300",
                },
                {
                  label: "Completed",
                  value: stats?.completed ?? 0,
                  color: "text-emerald-400",
                },
                {
                  label: "Overdue",
                  value: stats?.overdue ?? 0,
                  color: "text-red-400",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-500">{s.label}</span>
                  <span className={clsx("font-semibold", s.color)}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div
        className={clsx(
          "px-3 py-4 border-t border-slate-800",
          collapsed && "flex justify-center",
        )}
      >
        {collapsed ? (
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar name={user?.name ?? ""} src={user?.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
