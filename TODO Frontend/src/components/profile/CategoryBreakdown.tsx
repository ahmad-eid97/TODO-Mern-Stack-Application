import { useTodos } from "../todos/TodoContext";

export default function CategoryBreakdown() {
  const { todos, stats } = useTodos();

  const breakdown = Object.entries(
    todos.reduce<Record<string, number>>((acc, t) => {
      const cat = t.category || "Uncategorised";
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  if (breakdown.length === 0) return null;

  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
      <h3 className="text-base font-semibold text-white mb-4">
        Todos by Category
      </h3>
      <div className="space-y-2.5">
        {breakdown.map(([cat, count]) => {
          const pct = stats?.total
            ? Math.round((count / stats.total) * 100)
            : 0;
          return (
            <div key={cat}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-300">{cat}</span>
                <span className="text-slate-400">
                  {count} ({pct}%)
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
