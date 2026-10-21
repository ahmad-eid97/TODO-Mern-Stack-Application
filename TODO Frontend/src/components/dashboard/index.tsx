import { useTodos } from "../todos/TodoContext";
import DashboardHeader from "./DashboardHeader";
import OverdueAlert from "./OverdueAlert";
import RecentTodos from "./RecentTodos";
import UpcomingDeadlines from "./UpcomingDeadlines";
import PriorityBreakdown from "./PriorityBreakdown";
import TodoStats from "../todos/TodoStats";
import Button from "../ui/Button";

export default function Dashboard() {
  const { dashboard, isLoading, error, refreshTodos } = useTodos();

  return (
    <div className="space-y-6">
      <DashboardHeader />
      {isLoading && <p role="status" className="text-sm text-slate-400">Loading dashboard...</p>}
      {error && <div role="alert" className="space-y-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-red-300">{error}</p>
        <Button onClick={() => { void refreshTodos(); }} variant="secondary">Try again</Button>
      </div>}
      {!isLoading && !error && dashboard && (
        <>
          <TodoStats />
          <OverdueAlert />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTodos />
            <UpcomingDeadlines />
          </div>
          <PriorityBreakdown />
        </>
      )}
    </div>
  );
}
