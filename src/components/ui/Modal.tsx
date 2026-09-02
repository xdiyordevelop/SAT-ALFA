import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  closeOnBackdropClick?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "md",
  closeOnBackdropClick = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-[#0a0a0a]/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={() => closeOnBackdropClick && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card
          className={cn("w-full animate-slide-up", maxWidthClasses[maxWidth])}
        >
          {title && (
            <div className="mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
            </div>
          )}

          <div className="mb-4">{children}</div>

          {footer && (
            <div className="flex gap-3 justify-end border-t border-slate-200 dark:border-white/10 pt-4">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};
Modal.displayName = "Modal";
