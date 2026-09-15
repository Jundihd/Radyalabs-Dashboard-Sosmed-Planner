'use client';

import React, { useState } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function ManualMetricsModal() {
  const { metricsModalOpen, closeMetricsModal, metrics, updateMetrics } = useApp();
  const [followers, setFollowers] = useState(metrics.followers);
  const [posts, setPosts] = useState(metrics.posts);
  const [engagement, setEngagement] = useState(metrics.engagement);
  const [reach, setReach] = useState(metrics.reach);

  if (!metricsModalOpen) return null;

  const handleSave = () => {
    updateMetrics({
      followers: followers.trim() || metrics.followers,
      posts: posts.trim() || metrics.posts,
      engagement: engagement.trim() || metrics.engagement,
      reach: reach.trim() || metrics.reach,
    });
    closeMetricsModal();
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[16px] p-6 w-full max-w-[480px] shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-head font-bold text-[16px] text-[var(--white)]">
            <BarChart3 className="w-5 h-5 text-[#1793E8]" />
            <h3>Log Performance Metrics (v1 Manual Log)</h3>
          </div>
          <button
            onClick={closeMetricsModal}
            className="text-[var(--slate-400)] hover:text-[var(--white)] p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[12.5px] text-[var(--slate-300)] mb-4 leading-relaxed">
          Because v1 operates without live Meta Graph API credentials, metrics are recorded periodically by hand to populate the Dashboard overview.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11.5px] font-bold text-[var(--slate-300)] uppercase tracking-wider mb-1.5">
              Followers (Instagram)
            </label>
            <input
              type="text"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              className="w-full bg-[var(--navy)] border border-[var(--navy-line)] rounded-[8px] p-2.5 text-[13px] text-[var(--white)] focus:outline-none focus:border-[#1793E8]"
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-bold text-[var(--slate-300)] uppercase tracking-wider mb-1.5">
              Posts Published (Month)
            </label>
            <input
              type="text"
              value={posts}
              onChange={(e) => setPosts(e.target.value)}
              className="w-full bg-[var(--navy)] border border-[var(--navy-line)] rounded-[8px] p-2.5 text-[13px] text-[var(--white)] focus:outline-none focus:border-[#1793E8]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[11.5px] font-bold text-[var(--slate-300)] uppercase tracking-wider mb-1.5">
              Avg. Engagement Rate
            </label>
            <input
              type="text"
              value={engagement}
              onChange={(e) => setEngagement(e.target.value)}
              className="w-full bg-[var(--navy)] border border-[var(--navy-line)] rounded-[8px] p-2.5 text-[13px] text-[var(--white)] focus:outline-none focus:border-[#1793E8]"
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-bold text-[var(--slate-300)] uppercase tracking-wider mb-1.5">
              Monthly Reach / Impr.
            </label>
            <input
              type="text"
              value={reach}
              onChange={(e) => setReach(e.target.value)}
              className="w-full bg-[var(--navy)] border border-[var(--navy-line)] rounded-[8px] p-2.5 text-[13px] text-[var(--white)] focus:outline-none focus:border-[#1793E8]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--navy-line)]">
          <button
            onClick={closeMetricsModal}
            className="bg-[var(--navy)] border border-[var(--navy-line)] text-[var(--slate-300)] hover:text-[var(--white)] px-4 py-2 rounded-[8px] text-[12.5px] font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#1793E8] hover:bg-[#29B6F6] text-white px-4 py-2 rounded-[8px] text-[12.5px] font-bold transition-all"
          >
            Save Metrics
          </button>
        </div>
      </div>
    </div>
  );
}
