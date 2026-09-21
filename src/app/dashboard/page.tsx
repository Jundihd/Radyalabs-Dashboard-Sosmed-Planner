'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, PenTool, BarChart3, AlertCircle, Instagram, MapPin, Clock, Flame } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { BRANDS, HISTORICAL_POSTS } from '@/lib/brands';
import { RADYA_IG_SNAPSHOT } from '@/lib/radya-insights';

const SNAP = RADYA_IG_SNAPSHOT;

function Bar({ value, max, color = '#E130E8' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2.5 flex-1 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function SnapshotBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-2 py-0.5 rounded">
      <Instagram className="w-3 h-3" /> @radyalabs · snapshot IG Insights
    </span>
  );
}

export default function DashboardPage() {
  const { metrics, openMetricsModal, openPostDetail } = useApp();
  const [selectedBrand, setSelectedBrand] = useState<string>('radya');

  const brand = BRANDS[selectedBrand] || BRANDS.radya;
  const maxViewType = Math.max(...SNAP.viewsByType.map((v) => v.value), 1);
  const maxInteractType = Math.max(...SNAP.interactionsByType.map((v) => v.value), 1);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-head font-bold text-2xl text-[var(--white)] mb-1">Dashboard</h1>
          <p className="text-[13.5px] text-[var(--slate-300)] max-w-2xl">
            Instagram <strong className="text-[var(--white)]">@radyalabs</strong> · {SNAP.periodLabel} · dicatat {SNAP.recordedAt}.
            LinkedIn belum termasuk.
          </p>
        </div>
        <button
          onClick={openMetricsModal}
          className="flex items-center gap-2 bg-[var(--navy-raised)] border border-[var(--navy-line)] hover:border-[#1793E8] text-[var(--white)] px-3.5 py-2 rounded-[8px] text-[12.5px] font-bold shadow-sm transition-all"
        >
          <BarChart3 className="w-4 h-4 text-[#1793E8]" />
          Log Metrics (Manual v1)
        </button>
      </div>

      {/* Brand Switcher Pills */}
      <div className="flex gap-2 flex-wrap">
        {Object.values(BRANDS).map((b) => {
          const isSelected = selectedBrand === b.slug;
          const isConnected = b.slug === 'radya';

          return (
            <button
              key={b.slug}
              onClick={() => setSelectedBrand(b.slug)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12.5px] font-semibold transition-all ${
                isSelected
                  ? 'bg-[rgba(23,147,232,0.15)] border-[#1793E8] text-[var(--white)] shadow-sm'
                  : 'bg-[var(--navy-raised)] border-[var(--navy-line)] text-[var(--slate-300)] hover:border-[var(--slate-400)]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--teal)]' : 'bg-[var(--slate-400)]'}`} />
              <span>{b.name}</span>
            </button>
          );
        })}
      </div>

      {selectedBrand === 'radya' ? (
        <>
          {/* Stat Cards Grid — angka real snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)] mb-1.5">
                Followers (Instagram)
              </div>
              <div className="font-head font-bold text-3xl text-[var(--white)] mb-1.5">
                {SNAP.overview.followers}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[var(--teal)] font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{SNAP.overview.followersDelta}</span>
              </div>
              <div className="mt-2.5"><SnapshotBadge /></div>
            </div>

            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)] mb-1.5">
                Views · 30 hari
              </div>
              <div className="font-head font-bold text-3xl text-[var(--white)] mb-1.5">
                {SNAP.overview.views.toLocaleString('en-US')}
              </div>
              <div className="text-[12px] text-[var(--slate-300)] font-semibold">
                {SNAP.overview.followerShare}% followers · {SNAP.overview.nonFollowerShare}% non-followers
              </div>
              <div className="mt-2.5"><SnapshotBadge /></div>
            </div>

            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)] mb-1.5">
                Interactions · 30 hari
              </div>
              <div className="font-head font-bold text-3xl text-[var(--white)] mb-1.5">
                {SNAP.overview.interactions}
              </div>
              <div className="text-[12px] text-[var(--slate-300)] font-semibold">
                {SNAP.overview.viewers.toLocaleString('en-US')} viewers · net followers +{SNAP.overview.netFollowers}
              </div>
              <div className="mt-2.5"><SnapshotBadge /></div>
            </div>

            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)] mb-1.5">
                Profile Visits
              </div>
              <div className="font-head font-bold text-3xl text-[var(--white)] mb-1.5">
                {SNAP.profileActivity[0].value}
              </div>
              <div className="text-[12px] text-[var(--slate-300)] font-semibold">
                Bio taps {SNAP.profileActivity[1].value} · {metrics.followers} followers (same snapshot)
              </div>
              <div className="mt-2.5"><SnapshotBadge /></div>
            </div>
          </div>

          {/* Architecture Note — jujur: snapshot, bukan live */}
          <div className="bg-[var(--navy-raised)] border border-dashed border-[var(--navy-line)] rounded-[12px] p-4 flex items-start gap-3.5 text-[12.5px] leading-relaxed text-[var(--slate-300)]">
            <AlertCircle className="w-5 h-5 text-[#1793E8] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--white)]">Sumber data:</strong> {SNAP.note} — periode {SNAP.periodLabel}.
              Tidak ada fetch live ke Meta Graph API di v1. Detail yang tidak terbaca jelas di screenshot
              (grafik harian follower/views, split followers vs non-followers per tipe, data Cities) sengaja tidak dimasukkan.
            </div>
          </div>

          {/* Views + Interactions + Profile activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5">
              <h3 className="font-bold text-[14px] text-[var(--white)] mb-1">Views by content type</h3>
              <p className="text-[11.5px] text-[var(--slate-400)] mb-4">Viewers: {SNAP.overview.viewers.toLocaleString('en-US')}</p>
              <div className="flex flex-col gap-3">
                {SNAP.viewsByType.map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-[12.5px] mb-1.5">
                      <span className="text-[var(--slate-300)] font-semibold">{row.label}</span>
                      <span className="text-[var(--white)] font-bold">{row.display}</span>
                    </div>
                    <Bar value={row.value} max={maxViewType} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5">
              <h3 className="font-bold text-[14px] text-[var(--white)] mb-1">Interactions by content type</h3>
              <p className="text-[11.5px] text-[var(--slate-400)] mb-4">Total {SNAP.overview.interactions} interactions</p>
              <div className="flex flex-col gap-3">
                {SNAP.interactionsByType.map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-[12.5px] mb-1.5">
                      <span className="text-[var(--slate-300)] font-semibold">{row.label}</span>
                      <span className="text-[var(--white)] font-bold">{row.value}</span>
                    </div>
                    <Bar value={row.value} max={maxInteractType} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5">
              <h3 className="font-bold text-[14px] text-[var(--white)] mb-4">Profile activity</h3>
              <div className="flex flex-col gap-3">
                {SNAP.profileActivity.map((row) => (
                  <div key={row.label} className="flex items-center justify-between bg-[var(--navy)] border border-[var(--navy-line)] rounded-[10px] px-3.5 py-3">
                    <span className="text-[12.5px] text-[var(--slate-300)] font-semibold">{row.label}</span>
                    <span className="font-head font-bold text-lg text-[var(--white)]">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[var(--slate-400)] mt-3">Net followers +{SNAP.overview.netFollowers} dalam 30 hari.</p>
            </div>
          </div>

          {/* Audience */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5">
              <h3 className="font-bold text-[14px] text-[var(--white)] mb-4">Audience · Gender & Age</h3>
              <div className="flex flex-col gap-2.5 mb-5">
                {SNAP.audience.gender.map((g) => (
                  <div key={g.label} className="flex items-center gap-3">
                    <span className="w-16 text-[12.5px] text-[var(--slate-300)] font-semibold">{g.label}</span>
                    <Bar value={g.value} max={100} />
                    <span className="w-14 text-right text-[12.5px] text-[var(--white)] font-bold">{g.value}%</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2.5">
                {SNAP.audience.ageRange.map((a) => (
                  <div key={a.label} className="flex items-center gap-3">
                    <span className="w-16 text-[12px] text-[var(--slate-400)] font-semibold">{a.label}</span>
                    <Bar value={a.value} max={50} color="#F06EE8" />
                    <span className="w-14 text-right text-[12px] text-[var(--slate-300)] font-bold">{a.value}%</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[var(--slate-400)] mt-4">Dominan 25–34 tahun (48.9%), disusul 35–44 (22.9%) dan 18–24 (19.1%).</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5">
                <h3 className="font-bold text-[14px] text-[var(--white)] mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1793E8]" /> Top locations · Countries
                </h3>
                <p className="text-[11.5px] text-[var(--slate-400)] mb-4">Tab Cities tidak ada datanya di screenshot → tidak ditampilkan.</p>
                <div className="flex flex-col gap-2.5">
                  {SNAP.audience.topCountries.map((c) => (
                    <div key={c.label} className="flex items-center gap-3">
                      <span className="w-32 text-[12.5px] text-[var(--slate-300)] font-semibold truncate">{c.label}</span>
                      <Bar value={c.value} max={100} />
                      <span className="w-14 text-right text-[12.5px] text-[var(--white)] font-bold">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5">
                <h3 className="font-bold text-[14px] text-[var(--white)] mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1793E8]" /> When followers are most active
                </h3>
                <p className="text-[11.5px] text-[var(--slate-400)] mb-3">Zona waktu {SNAP.audience.activeTimes.timezone}. Grafik jam detail tidak ada angkanya → hanya ringkasan.</p>
                <ul className="flex flex-col gap-1.5">
                  {SNAP.audience.activeTimes.summary.map((s) => (
                    <li key={s} className="text-[13px] font-bold text-[var(--white)] bg-[var(--navy)] border border-[var(--navy-line)] rounded-[8px] px-3 py-2">{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Top content */}
          <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <h3 className="font-bold text-[15px] text-[var(--white)] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#E130E8]" /> Top content by views · 30 hari
              </h3>
              <span className="text-[11.5px] text-[var(--slate-400)]">Repost tidak tersedia di Insights (–) → kolom dihilangkan</span>
            </div>
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-wider text-[var(--slate-400)] border-b border-[var(--navy-line)]">
                    <th className="py-2.5 pr-3 font-bold">Content</th>
                    <th className="py-2.5 pr-3 font-bold">Age</th>
                    <th className="py-2.5 pr-3 font-bold text-right">Views</th>
                    <th className="py-2.5 pr-3 font-bold text-right">Likes</th>
                    <th className="py-2.5 pr-3 font-bold text-right">Comments</th>
                    <th className="py-2.5 font-bold text-right">Shares</th>
                  </tr>
                </thead>
                <tbody>
                  {SNAP.topContent.map((c) => (
                    <tr key={`${c.title}-${c.age}`} className="border-b border-[var(--navy-line)] last:border-0 text-[12.5px]">
                      <td className="py-2.5 pr-3 text-[var(--white)] font-semibold max-w-[280px] truncate">{c.title}</td>
                      <td className="py-2.5 pr-3 text-[var(--slate-400)]">{c.age}</td>
                      <td className="py-2.5 pr-3 text-right text-[var(--white)] font-bold">{c.views}</td>
                      <td className="py-2.5 pr-3 text-right text-[var(--slate-300)]">{c.likes}</td>
                      <td className="py-2.5 pr-3 text-right text-[var(--slate-300)]">{c.comments}</td>
                      <td className="py-2.5 text-right text-[var(--slate-300)]">{c.shares}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Posts Archive */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-head font-bold text-[17px] text-[var(--white)]">
                Recent Posts — @radyalabs Reference Archive
              </h2>
              <span className="text-[12px] text-[var(--slate-400)]">
                Real dates &amp; topics from Instagram feed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {HISTORICAL_POSTS.map((post) => (
                <div
                  key={post.id}
                  onClick={() =>
                    openPostDetail({
                      id: post.id,
                      brandSlug: 'radya',
                      platform: 'instagram',
                      status: 'posted',
                      title: post.topic,
                      caption: `Reference post from @radyalabs archive: ${post.topic}. In v1, historical posts provide context for the AI voice model.`,
                      scheduledAt: '2026-08-30T10:00:00Z',
                      createdAt: '2026-08-30T10:00:00Z',
                    })
                  }
                  className="bg-[var(--navy-raised)] border border-[var(--navy-line)] hover:border-[#1793E8] rounded-[12px] overflow-hidden shadow-sm transition-all cursor-pointer hover:-translate-y-1 flex flex-col"
                >
                  <div className={`aspect-square bg-gradient-to-br ${post.thumbClass} flex items-center justify-center p-3 relative text-white text-center font-head font-bold text-[11px]`}>
                    <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-wider">
                      {post.format}
                    </span>
                    <span className="line-clamp-3">{post.topic}</span>
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <span className="text-[11px] text-[var(--slate-400)] font-semibold mb-1">
                      {post.date}
                    </span>
                    <span className="text-[12px] text-[var(--white)] font-semibold line-clamp-2 leading-tight flex-1">
                      {post.topic}
                    </span>
                    <div className="pt-2 mt-2 border-t border-[var(--navy-line)] flex items-center justify-between text-[11px] text-[var(--slate-400)]">
                      <span>Likes: —</span>
                      <span>Comments: —</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Honest Unconnected State for Alkademi, Jangkau, Sinaptik */
        <div className="bg-[var(--navy-raised)] border border-dashed border-[var(--navy-line)] rounded-[16px] p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[var(--navy)] flex items-center justify-center text-[var(--slate-400)] mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-head font-bold text-[18px] text-[var(--white)] mb-2">
            {brand.name} — Not Connected Yet
          </h3>
          <p className="text-[13px] text-[var(--slate-400)] leading-relaxed mb-5">
            No Instagram or LinkedIn account credentials are linked for {brand.name} in v1. You can still plan and draft content for it with tailored AI voice in <strong>Content Creation</strong>.
          </p>
          <Link
            href={`/create?brand=${brand.slug}`}
            className="inline-flex items-center gap-2 bg-[#1793E8] hover:bg-[#29B6F6] text-white font-bold px-4 py-2 rounded-[8px] text-[13px] transition-all"
          >
            <PenTool className="w-4 h-4" />
            Draft Content for {brand.name}
          </Link>
        </div>
      )}
    </div>
  );
}
