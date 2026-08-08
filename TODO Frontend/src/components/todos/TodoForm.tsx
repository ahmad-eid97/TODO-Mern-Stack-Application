import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea, Select } from "../ui/Input";
import TagInput from "../ui/TagInput";
import { useTodos } from "./TodoContext";
import type { Todo } from "../../types/todo.types";
import { toDateInputValue, todayInputValue } from "../../utils/dateUtils";
import { getErrorMessage } from "../../utils/errorUtils";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Max 120 characters"),
  description: z.string().max(500, "Max 500 characters").optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  category: z.string().max(40).optional(),
  dueDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  todo?: Todo;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "🟦  Low" },
  { value: "medium", label: "🟨  Medium" },
  { value: "high", label: "🟧  High" },
  { value: "urgent", label: "🟥  Urgent" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function TodoForm({ isOpen, onClose, todo }: TodoFormProps) {
  const { createTodo, updateTodo, categories } = useTodos();
  const isEditing = !!todo;

  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: "medium",
      status: "pending",
    },
  });

  useEffect(() => {
    if (todo && isOpen) {
      reset({
        title: todo.title,
        description: todo.description ?? "",
        priority: todo.priority,
        status: todo.status,
        category: todo.category ?? "",
        dueDate: toDateInputValue(todo.dueDate),
      });
      queueMicrotask(() => {
        setTags(todo.tags ?? []);
        setSubtasks(todo.subtasks.map((s) => s.title));
      });
    } else if (!isOpen) {
      reset({ priority: "medium", status: "pending" });
      queueMicrotask(() => {
        setTags([]);
        setSubtasks([]);
        setSubtaskInput("");
        setError("");
      });
    }
  }, [todo, isOpen, reset]);

  const addSubtask = () => {
    const t = subtaskInput.trim();
    if (t && !subtasks.includes(t)) {
      setSubtasks((prev) => [...prev, t]);
      setSubtaskInput("");
    }
  };

  const removeSubtask = (idx: number) =>
    setSubtasks((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (values: FormValues) => {
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        category: values.category || undefined,
        dueDate: values.dueDate || undefined,
        tags,
      };

      if (isEditing && todo) {
        await updateTodo(todo.id, {
          ...payload,
          status: values.status,
          subtasks: subtasks.map((title, i) => ({
            id: todo.subtasks[i]?.id ?? crypto.randomUUID(),
            title,
            completed: todo.subtasks[i]?.completed ?? false,
            createdAt: todo.subtasks[i]?.createdAt ?? new Date().toISOString(),
          })),
        });
      } else {
        await createTodo({
          ...payload,
          subtasks: subtasks.map((title) => ({ title })),
        });
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Todo" : "New Todo"}
      size="lg"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={submitting}
          >
            {isEditing ? "Save Changes" : "Create Todo"}
          </Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Title *"
          placeholder="What needs to be done?"
          error={errors.title?.message}
          {...register("title")}
        />

        <Textarea
          label="Description"
          placeholder="Add more details..."
          rows={3}
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                label="Priority"
                options={PRIORITY_OPTIONS}
                error={errors.priority?.message}
                {...field}
              />
            )}
          />
          {isEditing && (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select label="Status" options={STATUS_OPTIONS} {...field} />
              )}
            />
          )}
          {!isEditing && (
            <Input
              label="Category"
              placeholder="e.g. Work, Personal..."
              list="category-suggestions"
              error={errors.category?.message}
              {...register("category")}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isEditing && (
            <Input
              label="Category"
              placeholder="e.g. Work, Personal..."
              list="category-suggestions"
              error={errors.category?.message}
              {...register("category")}
            />
          )}
          <datalist id="category-suggestions">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <Input
            label="Due Date"
            type="date"
            min={todayInputValue()}
            error={errors.dueDate?.message}
            {...register("dueDate")}
          />
        </div>

        <TagInput
          label="Tags"
          tags={tags}
          onChange={setTags}
          placeholder="Add tags..."
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Subtasks</label>
          <div className="space-y-2">
            {subtasks.map((task, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2"
              >
                <span className="flex-1 text-sm text-slate-300">{task}</span>
                <button
                  type="button"
                  onClick={() => removeSubtask(i)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add a subtask..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addSubtask}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
