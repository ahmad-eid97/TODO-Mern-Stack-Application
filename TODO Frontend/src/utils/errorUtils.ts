export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const e = error as {
      message?: string;
      response?: {
        data?: {
          message?: string;
          code?: string;
          details?: { message: string }[];
        };
      };
    };
    const data = e.response?.data;
    if (data?.code === "VALIDATION_ERROR") {
      return data.details?.[0]?.message ?? data.message ?? "Invalid request";
    }
    return data?.message ?? e.message ?? "An error occurred";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
