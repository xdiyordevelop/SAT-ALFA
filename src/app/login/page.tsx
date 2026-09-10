import { Metadata } from "next";
import Image from "next/image";
import { NeonLoginForm } from "@/components/auth/NeonLoginForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export const metadata: Metadata = {
  title: "Sign In | SAT ALFA",
  description: "SAT ALFA Learning Platform - Sign in to your account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-500 font-sans">

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left Side - Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] flex-col justify-center items-center p-12 overflow-hidden border-r border-white/5">

        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1c1b1b] via-[#0a0a0a] to-[#0a0a0a] opacity-80" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#EBFF00]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Branding Content */}
        <div className="relative z-10 flex flex-col items-center max-w-md text-center mt-[-10%]">

          {/* Logo */}
          <div className="w-40 h-40 relative mb-8">
            <Image
              src="/images/sat-alfa.jpg"
              alt="SAT ALFA Logo"
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              priority
              sizes="160px"
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black text-[#EBFF00] tracking-tighter mb-4 leading-tight drop-shadow-[0_0_20px_rgba(235,255,0,0.2)]">
            SAT-ALFA
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-slate-300 font-medium">
            Your Path to Success <br/>
            <span className="text-slate-400 text-base mt-2 block font-normal">Students Platform</span>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#EBFF00]/30 to-transparent opacity-50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 border-r border-t border-white/10 opacity-30 rounded-tr-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 border-l border-b border-white/10 opacity-30 rounded-bl-full pointer-events-none"></div>
      </div>

      {/* Right Side - Form Area (Mobile: 100%, Desktop: 50%) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white dark:bg-[#0a0a0a] transition-colors duration-500">

        {/* Mobile Header */}
        <div className="lg:hidden flex flex-col items-center gap-4 mb-10 z-10">
          <div className="w-20 h-20 relative">
            <Image
              src="/images/sat-alfa.jpg"
              alt="SAT ALFA Logo"
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-[#EBFF00] tracking-tighter">
            SAT-ALFA
          </h1>
        </div>

        {/* Login Form */}
        <div className="w-full flex justify-center z-10">
          <NeonLoginForm />
        </div>
      </div>

    </div>
  );
}

