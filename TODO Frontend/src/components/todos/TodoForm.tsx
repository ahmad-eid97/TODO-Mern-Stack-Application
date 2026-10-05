import { useEffect, useState, useRef, useId } from "react";
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
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Max 120 characters"),
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

interface DraftSubtask {
  key: string;
  id?: string;
  title: string;
  completed: boolean;
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
  const [subtasks, setSubtasks] = useState<DraftSubtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submissionPending = useRef(false);
  const formId = useId();

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
        setSubtasks(
          todo.subtasks.map((subtask) => ({ ...subtask, key: subtask.id })),
        );
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
    if (
      t &&
      t.length <= 120 &&
      subtasks.length < 50 &&
      !subtasks.some((task) => task.title === t)
    ) {
      setSubtasks((prev) => [
        ...prev,
        { key: crypto.randomUUID(), title: t, completed: false },
      ]);
      setSubtaskInput("");
    }
  };

  const removeSubtask = (key: string) =>
    setSubtasks((prev) => prev.filter((task) => task.key !== key));

  const onSubmit = async (values: FormValues) => {
    if (submissionPending.current) return;
    submissionPending.current = true;
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        description: values.description ?? "",
        priority: values.priority,
        category: values.category ?? "",
        dueDate: values.dueDate || undefined,
        tags,
      };

      if (isEditing && todo) {
        await updateTodo(todo.id, {
          ...payload,
          status: values.status,
          dueDate: values.dueDate
            ? values.dueDate === toDateInputValue(todo.dueDate)
              ? todo.dueDate
              : values.dueDate
            : null,
          subtasks: subtasks.map((task) => ({
            ...(task.id && { id: task.id }),
            title: task.title,
            completed: task.completed,
          })),
        });
      } else {
        await createTodo({
          ...payload,
          subtasks: subtasks.map((task) => ({ title: task.title })),
        });
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      submissionPending.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!submitting) onClose();
      }}
      title={isEditing ? "Edit Todo" : "New Todo"}
      size="lg"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={formId}
            isLoading={submitting}
          >
            {isEditing ? "Save Changes" : "Create Todo"}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        className="space-y-4"
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
      >
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
            min={isEditing ? undefined : todayInputValue()}
            error={errors.dueDate?.message}
            {...register("dueDate")}
          />
        </div>

        <TagInput
          label="Tags"
          tags={tags}
          onChange={setTags}
          maxTags={20}
          placeholder="Add tags..."
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Subtasks</label>
          <div className="space-y-2">
            {subtasks.map((task) => (
              <div
                key={task.key}
                className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2"
              >
                <span className="flex-1 text-sm text-slate-300">
                  {task.title}
                </span>
                <button
                  type="button"
                  onClick={() => removeSubtask(task.key)}
                  aria-label={`Remove subtask ${task.title}`}
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
                maxLength={120}
                disabled={submitting || subtasks.length >= 50}
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
                disabled={
                  submitting || subtasks.length >= 50 || !subtaskInput.trim()
                }
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
