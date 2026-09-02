"use client";
interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}
export function Avatar({
  src,
  alt = "Avatar",
  initials,
  size = "md",
  className = "",
}: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-slate-900 dark:text-white font-bold ${sizes[size]} ${className}`}
    >
      {" "}
      {initials}{" "}
    </div>
  );
}
