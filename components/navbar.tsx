"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  Sun,
  Moon,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

export function Navbar({
  user: suppliedUser,
}: {
  user?: { role: "teacher" | "student"; name: string; studentCode?: string } | null;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ role: "teacher" | "student"; name: string; studentCode?: string } | null>(null);
  const user = suppliedUser === undefined ? sessionUser : suppliedUser;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (suppliedUser !== undefined) return;
    let cancelled = false;
    const client = createClient();
    void client.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await client.from("profiles").select("role,full_name,student_code").eq("id", user.id).single();
      if (data && !cancelled) setSessionUser({ role: data.role, name: data.full_name, studentCode: data.student_code });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [suppliedUser]);

  const navLinks = [
    { href: "/learn", label: "บทเรียน 9 หน่วย", icon: BookOpen },
    { href: "/simulations", label: "กิจกรรมจำลอง 3 ภารกิจ", icon: Sparkles },
    { href: "/certificate", label: "เกียรติบัตร", icon: Award },
  ];

  if (user?.role === "teacher") {
    navLinks.push({ href: "/teacher", label: "แดชบอร์ดอาจารย์", icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Course Info */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-['Prompt'] font-bold text-sm sm:text-base leading-tight bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                31910-2028 การพาณิชย์บนสื่อสังคมออนไลน์
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-normal hidden sm:block">
                วอศ. ภาวนาโพธิคุณ · ระดับ ปวส.
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Theme toggle */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="สลับโหมดกลางวัน/กลางคืน"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {user.role === "teacher" ? "อาจารย์ผู้สอน" : `รหัส: ${user.studentCode}`}
                  </span>
                </div>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    title="ออกจากระบบ"
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 text-white text-sm font-medium shadow-sm hover:opacity-95 transition-opacity"
              >
                <User className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-base font-medium ${
                    isActive
                      ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
