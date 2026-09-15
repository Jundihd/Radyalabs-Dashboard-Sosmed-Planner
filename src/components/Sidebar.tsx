'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, PenTool, CheckSquare, Sun, Moon } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { role, setRole, pendingCount } = useApp();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    if (nextTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    setIsDark(!isDark);
    try {
      localStorage.setItem('radya_theme', nextTheme);
    } catch (e) {}
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Content Calendar', href: '/calendar', icon: Calendar },
    { label: 'Content Creation', href: '/create', icon: PenTool },
    { label: 'Approval Queue', href: '/approval', icon: CheckSquare, badge: pendingCount },
  ];

  return (
    <aside className="w-[270px] bg-[var(--navy)] border-r border-[var(--navy-line)] p-6 flex flex-col gap-6 sticky top-0 h-screen overflow-y-auto">
      {/* Brand Mark */}
      <div className="flex items-center gap-3">
        <div className="w-[38px] height-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-[#1793E8] to-[#43D3A4] flex items-center justify-center font-head font-extrabold text-[16px] text-[#051021] shadow-sm flex-shrink-0">
          RL
        </div>
        <div className="flex flex-col leading-tight">
          <strong className="font-head font-bold text-[15px] text-[var(--white)]">Radya Labs</strong>
          <span className="text-[11px] text-[var(--slate-300)] tracking-wide font-semibold">Social Media Content Manager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)] px-3 mb-2">
          Workflow
        </div>
        <ul className="flex flex-col gap-1 list-none p-0 m-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[rgba(23,147,232,0.2)] to-[rgba(23,147,232,0.05)] text-[var(--white)] shadow-[inset_3px_0_0_#0F7FCE] dark:shadow-[inset_3px_0_0_#29B6F6]'
                      : 'text-[var(--slate-300)] hover:bg-[var(--navy-raised)] hover:text-[var(--white)]'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#0F7FCE] dark:text-[#29B6F6]' : 'opacity-80'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto text-[10.5px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--status-pending)] text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role Switcher */}
      <div className="mt-auto bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[10px] p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)]">
          <span>Active Role</span>
          <span className="text-[var(--teal)] font-bold text-[10px]">v1 Model</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setRole('approver')}
            className={`flex items-center gap-2.5 p-2 rounded-[6px] text-left transition-all border ${
              role === 'approver'
                ? 'bg-[rgba(23,147,232,0.12)] border-[#1793E8] text-[var(--white)]'
                : 'bg-[var(--navy)] border-transparent text-[var(--slate-300)] hover:text-[var(--white)]'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#43D3A4] to-[#1793E8] flex items-center justify-center text-[10px] font-bold text-[#051021] flex-shrink-0">
              AA
            </div>
            <div className="flex flex-col leading-tight">
              <strong className="text-[12px]">Aloysius (Approver)</strong>
              <span className="text-[10px] text-[var(--slate-400)]">CMO · Full approval rights</span>
            </div>
          </button>

          <button
            onClick={() => setRole('creator')}
            className={`flex items-center gap-2.5 p-2 rounded-[6px] text-left transition-all border ${
              role === 'creator'
                ? 'bg-[rgba(23,147,232,0.12)] border-[#1793E8] text-[var(--white)]'
                : 'bg-[var(--navy)] border-transparent text-[var(--slate-300)] hover:text-[var(--white)]'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1793E8] to-[#EC008C] flex items-center justify-center text-[10px] font-bold text-[#051021] flex-shrink-0">
              AR
            </div>
            <div className="flex flex-col leading-tight">
              <strong className="text-[12px]">Arif (Creator)</strong>
              <span className="text-[10px] text-[var(--slate-400)]">Content producer · Draft/submit</span>
            </div>
          </button>
        </div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="w-full flex items-center justify-between p-2.5 rounded-[10px] border border-[var(--navy-line)] bg-[var(--navy)] text-[var(--slate-300)] hover:text-[var(--white)] hover:border-[var(--slate-400)] text-[12px] font-semibold transition-all"
      >
        <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
      </button>
    </aside>
  );
}
