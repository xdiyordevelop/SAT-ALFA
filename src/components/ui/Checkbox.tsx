"use client";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Checkbox({
  label,
  error,
  className = "",
  ...props
}: CheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center h-6">
        <input
          type="checkbox"
          className={`w-5 h-5 rounded border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-yellow-500 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-yellow-200 ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
      </div>
      <div className="flex-1">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer block">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
