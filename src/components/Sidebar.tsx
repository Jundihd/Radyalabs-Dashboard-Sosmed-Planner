'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, PenTool, CheckSquare, Sun, Moon, Clapperboard } from 'lucide-react';
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
  ];

  const contentItems = [
    { label: 'Content Post', href: '/create', icon: PenTool },
    { label: 'Content Video', href: '/create/video', icon: Clapperboard },
  ];

  return (
    <aside className="sticky top-0 z-30 flex h-auto w-full flex-col gap-3 overflow-visible border-b border-[var(--navy-line)] bg-[var(--navy)] p-3 lg:h-screen lg:w-[270px] lg:gap-6 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-6">
      {/* Brand Mark */}
      <div className="flex items-center gap-3">
        <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#1793E8] to-[#43D3A4] font-head text-[14px] font-extrabold text-[#051021] shadow-sm lg:h-[38px] lg:w-[38px] lg:rounded-[10px] lg:text-[16px]">
          RL
        </div>
        <div className="flex flex-col leading-tight">
          <strong className="font-head font-bold text-[15px] text-[var(--white)]">Radya Labs</strong>
          <span className="hidden text-[11px] font-semibold tracking-wide text-[var(--slate-300)] sm:block">Social Media Content Manager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex min-w-0 flex-col gap-1">
        <div className="mb-2 hidden px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)] lg:block">
          Workflow
        </div>
        <ul className="m-0 flex list-none flex-row gap-1 overflow-x-auto p-0 pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

            return (
              <li key={item.href} className="flex-shrink-0">
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-[12px] font-semibold transition-all lg:gap-3 lg:text-[13.5px] ${
                    isActive
                      ? 'bg-gradient-to-r from-[rgba(23,147,232,0.2)] to-[rgba(23,147,232,0.05)] text-[var(--white)] shadow-[inset_3px_0_0_#0F7FCE] dark:shadow-[inset_3px_0_0_#29B6F6]'
                      : 'text-[var(--slate-300)] hover:bg-[var(--navy-raised)] hover:text-[var(--white)]'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#0F7FCE] dark:text-[#29B6F6]' : 'opacity-80'}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}

          <li className="flex flex-shrink-0 lg:mt-2 lg:block">
            <div className={`hidden items-center gap-3 px-3 py-2 text-[12px] font-bold uppercase tracking-wider lg:flex ${pathname.startsWith('/create') ? 'text-[var(--white)]' : 'text-[var(--slate-400)]'}`}>
              <PenTool className={`h-4 w-4 ${pathname.startsWith('/create') ? 'text-[#0F7FCE] dark:text-[#29B6F6]' : ''}`} />
              <span>Content Creation</span>
            </div>
            <ul className="flex list-none flex-row gap-1 lg:ml-5 lg:flex-col lg:border-l lg:border-[var(--navy-line)] lg:py-1 lg:pl-3">
              {contentItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href} className="flex-shrink-0">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-[9px] px-3 py-2.5 text-[12px] font-semibold transition-all lg:gap-2.5 lg:text-[12.5px] ${isActive ? 'bg-gradient-to-r from-[rgba(23,147,232,0.2)] to-[rgba(23,147,232,0.05)] text-[var(--white)] shadow-[inset_3px_0_0_#0F7FCE] dark:shadow-[inset_3px_0_0_#29B6F6]' : 'text-[var(--slate-300)] hover:bg-[var(--navy-raised)] hover:text-[var(--white)]'}`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-[#0F7FCE] dark:text-[#29B6F6]' : 'opacity-75'}`} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          <li className="flex-shrink-0 lg:mt-1">
            <Link
              href="/approval"
              className={`flex items-center gap-2 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-[12px] font-semibold transition-all lg:gap-3 lg:text-[13.5px] ${pathname === '/approval' ? 'bg-gradient-to-r from-[rgba(23,147,232,0.2)] to-[rgba(23,147,232,0.05)] text-[var(--white)] shadow-[inset_3px_0_0_#0F7FCE] dark:shadow-[inset_3px_0_0_#29B6F6]' : 'text-[var(--slate-300)] hover:bg-[var(--navy-raised)] hover:text-[var(--white)]'}`}
            >
              <CheckSquare className={`h-[18px] w-[18px] flex-shrink-0 ${pathname === '/approval' ? 'text-[#0F7FCE] dark:text-[#29B6F6]' : 'opacity-80'}`} />
              <span>Approval Queue</span>
              {pendingCount > 0 ? <span className="ml-auto rounded-full bg-[var(--status-pending)] px-2 py-0.5 text-[10.5px] font-extrabold text-white">{pendingCount}</span> : null}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Role Switcher */}
      <div className="mt-auto hidden flex-col gap-2.5 rounded-[10px] border border-[var(--navy-line)] bg-[var(--navy-raised)] p-3.5 lg:flex">
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
        className="hidden w-full items-center justify-between rounded-[10px] border border-[var(--navy-line)] bg-[var(--navy)] p-2.5 text-[12px] font-semibold text-[var(--slate-300)] transition-all hover:border-[var(--slate-400)] hover:text-[var(--white)] lg:flex"
      >
        <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
      </button>
    </aside>
  );
}
