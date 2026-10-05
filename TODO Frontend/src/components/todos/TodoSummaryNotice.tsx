import { useTodos } from "./TodoContext";
import Button from "../ui/Button";

export default function TodoSummaryNotice() {
  const { error, metadataError, isLoading, refreshTodos, refreshMetadata } =
    useTodos();
  if (error || metadataError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 space-y-3"
      >
        <p className="text-sm text-red-300">{error ?? metadataError}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            void refreshTodos();
            void refreshMetadata();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="h-24 rounded-xl skeleton" aria-label="Loading Todos" />
    );
  }
  return null;
}
