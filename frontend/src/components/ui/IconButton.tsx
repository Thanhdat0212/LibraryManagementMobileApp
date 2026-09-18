import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type Tone = "default" | "danger";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  default: "text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-indigo-600",
  danger: "text-slate-500 hover:bg-red-50 hover:text-red-600 focus-visible:outline-red-600",
};

export default function IconButton({ icon: Icon, label, tone = "default", className = "", ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors
        disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 ${toneClasses[tone]} ${className}`}
      {...props}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
