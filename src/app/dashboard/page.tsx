'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, PenTool, BarChart3, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { BRANDS, HISTORICAL_POSTS } from '@/lib/brands';

export default function DashboardPage() {
  const { metrics, openMetricsModal, openPostDetail } = useApp();
  const [selectedBrand, setSelectedBrand] = useState<string>('radya');

  const brand = BRANDS[selectedBrand] || BRANDS.radya;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-head font-bold text-2xl text-[var(--white)] mb-1">Dashboard</h1>
          <p className="text-[13.5px] text-[var(--slate-300)] max-w-2xl">
            Multi-brand performance overview. In v1, all metrics are manually logged or tracked via sample entries.
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
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)] mb-1.5">
                Followers (Instagram)
              </div>
              <div className="font-head font-bold text-3xl text-[var(--white)] mb-1.5">
                {metrics.followers}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[var(--teal)] font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4.2% this month</span>
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded">
                Manual / Sample Data
              </div>
            </div>

            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)] mb-1.5">
                Posts Published (Month)
              </div>
              <div className="font-head font-bold text-3xl text-[var(--white)] mb-1.5">
                {metrics.posts}
              </div>
              <div className="text-[12px] text-[var(--slate-300)] font-semibold">
                Across Instagram &amp; LinkedIn
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded">
                Manual / Sample Data
              </div>
            </div>

            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)] mb-1.5">
                Avg. Engagement Rate
              </div>
              <div className="font-head font-bold text-3xl text-[var(--white)] mb-1.5">
                {metrics.engagement}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[var(--teal)] font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+0.4pt vs last month</span>
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded">
                Manual / Sample Data
              </div>
            </div>

            <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[14px] p-5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate-400)] mb-1.5">
                Monthly Impressions
              </div>
              <div className="font-head font-bold text-3xl text-[var(--white)] mb-1.5">
                {metrics.reach}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[var(--teal)] font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+11.8% vs last month</span>
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded">
                Manual / Sample Data
              </div>
            </div>
          </div>

          {/* Architecture Note */}
          <div className="bg-[var(--navy-raised)] border border-dashed border-[var(--navy-line)] rounded-[12px] p-4 flex items-start gap-3.5 text-[12.5px] leading-relaxed text-[var(--slate-300)]">
            <AlertCircle className="w-5 h-5 text-[#1793E8] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--white)]">v1 Metrics Architecture:</strong> In version 1, there is no live Meta Graph API connection. Metrics are recorded by hand using the "Log Metrics" button above. The 10 posts below are the real historical reference posts from <code className="text-[#29B6F6]">@radyalabs</code>; automated live Graph API metrics will arrive in v2 alongside auto-publishing.
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
