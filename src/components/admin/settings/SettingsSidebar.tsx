"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  User,
  Lock,
  Bell,
  Clock,
  CreditCard,
  Info,
} from "lucide-react";

export function SettingsSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: <Settings className="w-5 h-5" />,
      label: "General",
      href: "/admin/settings",
      active: pathname === "/admin/settings",
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "Profile",
      href: "/admin/settings/profile",
      active: pathname === "/admin/settings/profile",
    },
    {
      icon: <Lock className="w-5 h-5" />,
      label: "Security",
      href: "/admin/settings/security",
      active: pathname === "/admin/settings/security",
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: "Notifications",
      href: "/admin/settings/notifications",
      active: pathname === "/admin/settings/notifications",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Attendance",
      href: "/admin/settings/attendance",
      active: pathname === "/admin/settings/attendance",
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: "Payments",
      href: "/admin/settings/payments",
      active: pathname === "/admin/settings/payments",
    },
    {
      icon: <Info className="w-5 h-5" />,
      label: "System",
      href: "/admin/settings/system",
      active: pathname === "/admin/settings/system",
    },
  ];

  return (
    <div className="bg-transparent h-fit sticky top-24">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
              item.active
                ? "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium border-l-2 border-yellow-500"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-2 border-transparent"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
