import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

type Tone = "success" | "danger" | "warning" | "info";

const toneClasses: Record<Tone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

const toneIcons: Record<Tone, typeof Info> = {
  success: CheckCircle2,
  danger: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

interface NoticeProps {
  message: string | null | undefined;
  tone?: Tone;
  className?: string;
}

export default function Notice({ message, tone = "info", className = "" }: NoticeProps) {
  if (!message) return null;
  const Icon = toneIcons[tone];
  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${toneClasses[tone]} ${className}`} role={tone === "danger" ? "alert" : "status"}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
