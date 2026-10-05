import { format } from "date-fns";
import { Mail, Calendar } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import Avatar from "../ui/Avatar";
export default function ProfileCard() {
  const { user } = useAuth();

  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
      <div className="flex items-start gap-5">
        <Avatar
          name={user?.name ?? ""}
          src={user?.avatar}
          size="xl"
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
          <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
            <Mail className="w-3.5 h-3.5" />
            {user?.email}
          </div>
          {user?.createdAt && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Calendar className="w-3 h-3" />
              Member since {format(new Date(user.createdAt), "MMMM yyyy")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
