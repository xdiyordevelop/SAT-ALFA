import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "error" | "success" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
}

const typeConfig = {
  error: {
    bg: "bg-red-950/30",
    border: "border-red-800",
    text: "text-red-200",
    icon: AlertCircle,
    iconColor: "text-red-600",
  },
  success: {
    bg: "bg-emerald-950/30",
    border: "border-emerald-800",
    text: "text-emerald-200",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
  },
  warning: {
    bg: "bg-yellow-950/30",
    border: "border-yellow-800",
    text: "text-yellow-200",
    icon: AlertTriangle,
    iconColor: "text-slate-900 dark:text-yellow-500",
  },
  info: {
    bg: "bg-blue-950/30",
    border: "border-blue-800",
    text: "text-blue-200",
    icon: Info,
    iconColor: "text-blue-600",
  },
};

export const Alert: React.FC<AlertProps> = ({
  className,
  type = "info",
  title,
  children,
  onClose,
  closable = false,
  ...props
}) => {
  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-4 flex gap-3",
        config.bg,
        config.border,
        config.text,
        className,
      )}
      {...props}
    >
      <IconComponent
        className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)}
      />
      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
      {closable && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 hover:opacity-75 transition-opacity"
          aria-label="Close alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

Alert.displayName = "Alert";
