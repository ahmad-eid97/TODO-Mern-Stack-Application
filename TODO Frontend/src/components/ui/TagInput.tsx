import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxTagLength?: number;
  label?: string;
  error?: string;
}

export default function TagInput({
  tags,
  onChange,
  placeholder = "Add tag, press Enter",
  maxTags = 8,
  maxTagLength = 40,
  label,
  error,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (
      !tag ||
      tag.length > maxTagLength ||
      tags.includes(tag) ||
      tags.length >= maxTags
    )
      return;
    onChange([...tags, tag]);
    setInput("");
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <div
        className={clsx(
          "flex flex-wrap gap-2 bg-slate-800 border rounded-xl px-3 py-2 min-h-[44px]",
          error ? "border-red-500/60" : "border-slate-700",
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-violet-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            type="text"
            value={input}
            maxLength={maxTagLength}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(input)}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] border-0 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none!"
          />
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && (
        <p className="text-xs text-slate-600">
          Press Enter or comma to add tags
        </p>
      )}
    </div>
  );
}
