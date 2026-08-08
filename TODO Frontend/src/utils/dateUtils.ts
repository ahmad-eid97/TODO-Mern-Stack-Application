import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isPast,
  isThisWeek,
} from "date-fns";

export const formatDate = (dateStr: string): string =>
  format(new Date(dateStr), "MMM d, yyyy");

export const formatDateTime = (dateStr: string): string =>
  format(new Date(dateStr), "MMM d, yyyy · h:mm a");

export const timeAgo = (dateStr: string): string =>
  formatDistanceToNow(new Date(dateStr), { addSuffix: true });

export const formatDueDate = (
  dateStr: string,
): { label: string; isOverdue: boolean; isUrgent: boolean } => {
  const date = new Date(dateStr);
  const overdue = isPast(date) && !isToday(date);
  const urgent = isToday(date) || isTomorrow(date);

  let label: string;
  if (isToday(date)) label = "Today";
  else if (isTomorrow(date)) label = "Tomorrow";
  else if (overdue) label = `Overdue · ${formatDate(dateStr)}`;
  else if (isThisWeek(date))
    label = format(date, "EEEE"); // e.g. "Wednesday"
  else label = formatDate(dateStr);

  return { label, isOverdue: overdue, isUrgent: urgent };
};

export const toDateInputValue = (dateStr?: string): string => {
  if (!dateStr) return "";
  return format(new Date(dateStr), "yyyy-MM-dd");
};

export const todayInputValue = (): string => format(new Date(), "yyyy-MM-dd");
