import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function statusTone(status: string) {
  if (status === "ACTIVE") {
    return "good" as const;
  }

  if (status === "BLOCKED") {
    return "bad" as const;
  }

  return "warn" as const;
}
