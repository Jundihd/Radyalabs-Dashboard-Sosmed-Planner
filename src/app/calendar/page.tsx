'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight, Instagram, Linkedin, RefreshCw, AlertTriangle } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { Post } from '@/lib/types';

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function postDateKey(scheduledAt: string): string {
  const date = new Date(scheduledAt);
  return Number.isNaN(+date) ? '' : toISODate(date);
}

function monthLabel(y: number, m: number): string {
  return new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function statusClasses(status: Post['status']): string {
  if (status === 'pending_approval') return 'bg-amber-500/15 text-amber-300 border-amber-500/35';
  if (status === 'approved') return 'bg-blue-500/15 text-blue-300 border-blue-500/35';
  if (status === 'posted') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';
  if (status === 'rejected') return 'bg-rose-500/15 text-rose-300 border-rose-500/35';
  return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
}

function PostChip({ post, onOpen }: { post: Post; onOpen: (p: Post) => void }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onOpen(post);
      }}
      className={`border rounded-[5px] p-1.5 text-[10px] font-bold leading-tight flex items-center gap-1.5 transition-transform hover:-translate-y-0.5 shadow-xs ${statusClasses(post.status)}`}
    >
      {post.platform === 'instagram' ? <Instagram className="w-3 h-3 flex-shrink-0" /> : <Linkedin className="w-3 h-3 flex-shrink-0" />}
      <span className="truncate">
        {post.brandSlug.toUpperCase()} — {post.title}
      </span>
    </div>
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const { posts, openPostDetail, showToast, loadingPosts, backendError, refreshPosts } = useApp();

  const today = useMemo(() => new Date(), []);
  const [activeView, setActiveView] = useState<'month' | 'week' | 'day'>('month');
  const [cursor, setCursor] = useState<Date>(() => new Date()); // bulan/minggu/hari yang dilihat
  const [selectedDay, setSelectedDay] = useState<string>(() => toISODate(new Date()));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Grid bulan: selalu 42 sel (6 minggu) agar efek ganti bulan terlihat real
  const monthCells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = first.getDay(); // 0=Sun
    const start = new Date(year, month, 1 - startOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [year, month]);

  // Minggu berjalan dari cursor/selectedDay
  const weekDays = useMemo(() => {
    const base = new Date(selectedDay + 'T12:00:00');
    if (isNaN(+base)) return [];
    const sunday = new Date(base);
    sunday.setDate(base.getDate() - base.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d;
    });
  }, [selectedDay]);

  const postsByDate = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const p of posts) {
      const key = postDateKey(p.scheduledAt || '');
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    // urut per jam
    for (const [, arr] of map) arr.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
    return map;
  }, [posts]);

  const handleDayClick = (iso: string) => {
    setSelectedDay(iso);
    showToast(`Scheduling new post for ${iso}`, 'info');
    router.push(`/create?date=${iso}`);
  };

  const shift = (dir: 1 | -1) => {
    const next = new Date(cursor);
    if (activeView === 'month') next.setMonth(next.getMonth() + dir);
    else if (activeView === 'week') next.setDate(next.getDate() + dir * 7);
    else next.setDate(next.getDate() + dir);
    setCursor(next);
    setSelectedDay(toISODate(next));
  };

  const goToday = () => {
    setCursor(new Date());
    setSelectedDay(toISODate(new Date()));
  };

  const headerLabel =
    activeView === 'month'
      ? monthLabel(year, month)
      : activeView === 'week'
        ? `Week of ${weekDays[0] ? weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}`
        : new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-head font-bold text-2xl text-[var(--white)] mb-1">Content Calendar</h1>
          <p className="text-[13.5px] text-[var(--slate-300)] max-w-2xl">
            Real data dari Supabase. Klik tanggal untuk draft, klik chip post untuk detail &amp; lifecycle.
            {loadingPosts ? ' Memuat…' : ` (${posts.length} post)`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshPosts}
            className="flex items-center gap-2 bg-[var(--navy-raised)] border border-[var(--navy-line)] hover:border-[#1793E8] text-[var(--white)] font-bold px-4 py-2 rounded-[8px] text-[13px] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/create"
            className="flex items-center gap-2 bg-[#1793E8] hover:bg-[#29B6F6] text-white font-bold px-4 py-2 rounded-[8px] text-[13px] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>
      </div>

      {backendError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-[10px] p-4 flex items-start gap-3 text-[13px] text-rose-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong>Supabase belum konek:</strong> {backendError}
            <div className="mt-1 text-[12px] opacity-80">
              Isi <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,{' '}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> di <code>.env.local</code>, jalankan{' '}
              <code>supabase/schema.sql</code> + <code>seed.sql</code>, lalu restart dev server. Cek{' '}
              <code>/api/health</code> untuk status backend.
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[8px] p-1 gap-1">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
            onClick={() => {
              setActiveView(v);
              setCursor(new Date(`${selectedDay}T12:00:00`));
            }}
              className={`px-3.5 py-1 rounded-[6px] text-[12.5px] font-bold transition-all capitalize ${
                activeView === v ? 'bg-[#1793E8] text-white' : 'text-[var(--slate-300)] hover:text-[var(--white)]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => shift(-1)} className="w-8 h-8 rounded-[6px] border border-[var(--navy-line)] bg-[var(--navy-raised)] flex items-center justify-center text-[var(--slate-300)] hover:text-[var(--white)] hover:border-[#1793E8]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-head font-bold text-[15px] text-[var(--white)] min-w-[180px] text-center">{headerLabel}</span>
          <button onClick={() => shift(1)} className="w-8 h-8 rounded-[6px] border border-[var(--navy-line)] bg-[var(--navy-raised)] flex items-center justify-center text-[var(--slate-300)] hover:text-[var(--white)] hover:border-[#1793E8]">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={goToday} className="text-[12px] font-bold px-3 py-1.5 rounded-[6px] border border-[var(--navy-line)] bg-[var(--navy-raised)] text-[var(--slate-300)] hover:text-white hover:border-[#1793E8]">
            Today
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[8px] px-4 py-2 text-[11.5px] font-semibold text-[var(--slate-300)]">
        {[['bg-slate-400', 'Draft'], ['bg-amber-400', 'Pending approval'], ['bg-blue-400', 'Approved (Ready to post)'], ['bg-emerald-400', 'Posted'], ['bg-rose-400', 'Rejected (Needs revision)']].map(([dot, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {loadingPosts ? (
        <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-12 text-center text-[var(--slate-400)] text-[13px]">
          Loading real posts dari Supabase…
        </div>
      ) : activeView === 'month' ? (
        <div className="grid grid-cols-7 gap-[1px] bg-[var(--navy-line)] border border-[var(--navy-line)] rounded-[14px] overflow-hidden shadow-sm">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="bg-[var(--navy)] p-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)]">
              {d}
            </div>
          ))}
          {monthCells.map((d) => {
            const iso = toISODate(d);
            const inMonth = d.getMonth() === month;
            const isToday = toISODate(today) === iso;
            const isSelected = selectedDay === iso;
            const dayPosts = postsByDate.get(iso) || [];
            return (
              <div
                key={iso}
                onClick={() => handleDayClick(iso)}
                className={`min-h-[110px] p-2 flex flex-col gap-1.5 cursor-pointer group transition-colors ${
                  inMonth ? 'bg-[var(--navy-deep)] hover:bg-[var(--navy-raised)]' : 'bg-[var(--navy-deep)]/40 opacity-50 hover:bg-[var(--navy-raised)]/60'
                } ${isSelected ? 'outline outline-1 outline-[#1793E8]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[12px] font-bold ${isToday ? 'w-5 h-5 rounded-full bg-[#1793E8] text-white flex items-center justify-center' : 'text-[var(--slate-300)]'}`}>
                    {d.getDate()}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 text-[11px] text-[#1793E8] font-bold transition-opacity">+</span>
                </div>
                {dayPosts.slice(0, 4).map((post) => (
                  <PostChip key={post.id} post={post} onOpen={openPostDetail} />
                ))}
                {dayPosts.length > 4 && <span className="text-[10px] text-[var(--slate-400)] font-bold">+{dayPosts.length - 4} more</span>}
              </div>
            );
          })}
        </div>
      ) : activeView === 'week' ? (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d) => {
            const iso = toISODate(d);
            const dayPosts = postsByDate.get(iso) || [];
            return (
              <div key={iso} onClick={() => handleDayClick(iso)} className="bg-[var(--navy-deep)] border border-[var(--navy-line)] rounded-[12px] p-3 min-h-[220px] cursor-pointer hover:border-[#1793E8] flex flex-col gap-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)]">
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="font-head font-bold text-[16px] text-[var(--white)]">{d.getDate()}</div>
                <div className="text-[11px] text-[var(--slate-400)]">{iso}</div>
                <div className="flex flex-col gap-1.5">
                  {dayPosts.length === 0 && <span className="text-[11px] text-[var(--slate-400)]">— empty, click to draft —</span>}
                  {dayPosts.map((p) => (
                    <PostChip key={p.id} post={p} onOpen={openPostDetail} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--navy-deep)] border border-[var(--navy-line)] rounded-[14px] p-5 flex flex-col gap-3">
          <div className="text-[13px] text-[var(--slate-300)]">
            {(postsByDate.get(selectedDay) || []).length} post terjadwal pada <strong className="text-white">{selectedDay}</strong>
          </div>
          {(postsByDate.get(selectedDay) || []).length === 0 ? (
            <button onClick={() => handleDayClick(selectedDay)} className="bg-[#1793E8] hover:bg-[#29B6F6] text-white font-bold px-4 py-2 rounded-[8px] text-[13px] w-fit">
              + Draft post untuk hari ini
            </button>
          ) : (
            (postsByDate.get(selectedDay) || []).map((p) => (
              <div key={p.id} className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[10px] p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[12px] flex-wrap">
                  <span className="font-bold text-white">{p.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${statusClasses(p.status)} border`}>{p.status.replace('_', ' ')}</span>
                  <span className="text-[var(--slate-400)] ml-auto">{new Date(p.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-[12.5px] text-[var(--slate-300)] line-clamp-3 whitespace-pre-wrap">{p.caption}</div>
                <button onClick={() => openPostDetail(p)} className="text-[12px] font-bold text-[#29B6F6] w-fit">Open detail →</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
