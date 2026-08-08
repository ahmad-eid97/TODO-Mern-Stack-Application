import { useTodos } from "../todos/TodoContext";
import DashboardHeader from "./DashboardHeader";
import OverdueAlert from "./OverdueAlert";
import RecentTodos from "./RecentTodos";
import UpcomingDeadlines from "./UpcomingDeadlines";
import PriorityBreakdown from "./PriorityBreakdown";
import TodoStats from "../todos/TodoStats";

export default function Dashboard() {
  const { todos } = useTodos();

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <TodoStats />
      <OverdueAlert />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTodos />
        <UpcomingDeadlines />
      </div>
      {todos.length > 0 && <PriorityBreakdown />}
    </div>
  );
}
