import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Plus, CheckSquare } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useTodos } from "../todos/TodoContext";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import TodoForm from "../todos/TodoForm";

export default function Navbar() {
  const { user } = useAuth();
  const { setFilters, stats } = useTodos();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setSearch(value);
    setFilters({ search: value });
    if (value.trim()) navigate("/todos");
  };

  return (
    <>
      <header className="h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/50">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            TodoFlow
          </span>
        </div>

        <div className="relative hidden md:flex items-center w-72">
          <Search className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search todos..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowForm(true)}
            className="hidden sm:inline-flex"
          >
            New Todo
          </Button>

          <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <Bell className="w-5 h-5" />
            {stats && stats.overdue > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <Avatar name={user?.name ?? ""} src={user?.avatar} size="sm" />
          </button>
        </div>
      </header>

      <TodoForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </>
  );
}
