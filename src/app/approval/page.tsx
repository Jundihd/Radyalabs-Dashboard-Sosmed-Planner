'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle, Copy, Download, Instagram, Linkedin, Eye, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { BRANDS } from '@/lib/brands';
import { PostStatus } from '@/lib/types';

export default function ApprovalPage() {
  const router = useRouter();
  const { posts, updatePostStatus, openRejectModal, openPostDetail, showToast, role, loadingPosts, backendError, refreshPosts } = useApp();
  const [filter, setFilter] = useState<'pending_approval' | 'approved' | 'all'>('pending_approval');

  const pendingPosts = posts.filter((p) => p.status === 'pending_approval');
  const approvedPosts = posts.filter((p) => p.status === 'approved');

  const filteredPosts = posts.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const handleApprove = async (id: string) => {
    const updated = await updatePostStatus(id, 'approved');
    if (updated) showToast('Post approved! Manual publishing toolkit is now available.', 'success');
  };

  const handleMarkPosted = async (id: string) => {
    const updated = await updatePostStatus(id, 'posted');
    if (updated) showToast('Post marked as live on platform!', 'success');
  };

  const handleCopyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption).then(() => {
      showToast('Caption copied to clipboard ready to paste!', 'success');
    }).catch(() => {
      showToast('Caption copied!', 'success');
    });
  };

  const handleDownloadImage = (imageUrl: string, title: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${title || 'ai-social-image'}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Foto AI diunduh!', 'success');
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-head font-bold text-2xl text-[var(--white)] mb-1">Approval Queue &amp; Publishing</h1>
        <p className="text-[13.5px] text-[var(--slate-300)] max-w-2xl">
          Review posts waiting on sign-off. Approving a post unlocks the <strong>v1 Manual Posting Toolkit</strong> (Copy caption, Download image, Mark as posted).
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[var(--navy-line)] pb-3 flex-wrap">
        <button
          onClick={() => setFilter('pending_approval')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all ${
            filter === 'pending_approval'
              ? 'bg-[#1793E8] text-white shadow-sm'
              : 'bg-[var(--navy-raised)] border border-[var(--navy-line)] text-[var(--slate-300)] hover:text-[var(--white)]'
          }`}
        >
          <span>Pending Approval</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10.5px]">
            {pendingPosts.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('approved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all ${
            filter === 'approved'
              ? 'bg-[#1793E8] text-white shadow-sm'
              : 'bg-[var(--navy-raised)] border border-[var(--navy-line)] text-[var(--slate-300)] hover:text-[var(--white)]'
          }`}
        >
          <span>Approved (Ready for Manual Posting)</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10.5px]">
            {approvedPosts.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all ${
            filter === 'all'
              ? 'bg-[#1793E8] text-white shadow-sm'
              : 'bg-[var(--navy-raised)] border border-[var(--navy-line)] text-[var(--slate-300)] hover:text-[var(--white)]'
          }`}
        >
          <span>All Posts</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10.5px]">
            {posts.length}
          </span>
        </button>
      </div>

      {/* Queue List */}
      <div className="flex flex-col gap-4">
        {backendError && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-[10px] p-4 text-[13px] text-rose-300">
            <strong>Supabase belum konek:</strong> {backendError} — isi .env.local lalu restart. Status: <code>/api/health</code>.
            <button onClick={refreshPosts} className="ml-3 underline font-bold">Retry</button>
          </div>
        )}
        {loadingPosts ? (
          <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[16px] p-12 text-center text-[var(--slate-400)] text-[13px]">
            Loading real queue dari Supabase…
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-[var(--navy-raised)] border border-dashed border-[var(--navy-line)] rounded-[16px] p-12 text-center text-[var(--slate-400)] flex flex-col items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[var(--teal)] mb-3" />
            <h3 className="font-head font-bold text-[16px] text-[var(--white)] mb-1">
              No posts in this queue view
            </h3>
            <p className="text-[12.5px] max-w-sm mb-4">
              All submitted posts have been reviewed or are in a different status.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-[#1793E8] hover:bg-[#29B6F6] text-white font-bold px-4 py-2 rounded-[8px] text-[12.5px]"
            >
              Draft a New Post
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const brand = BRANDS[post.brandSlug] || BRANDS.radya;

            return (
              <div
                key={post.id}
                className="bg-[var(--navy-raised)] border border-[var(--navy-line)] hover:border-[#1793E8]/50 rounded-[16px] p-5 shadow-sm transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center"
              >
                {/* Visual Thumbnail — REAL foto AI kalau ada */}
                {post.mediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.mediaUrl}
                    alt={post.title}
                    onClick={() => openPostDetail(post)}
                    className="w-full sm:w-28 h-28 rounded-[12px] object-cover shadow-sm flex-shrink-0 cursor-pointer"
                  />
                ) : (
                  <div
                    onClick={() => openPostDetail(post)}
                    className="w-full sm:w-28 h-28 rounded-[12px] flex items-center justify-center text-center p-2 text-white font-head font-extrabold text-[12px] shadow-sm flex-shrink-0 cursor-pointer overflow-hidden relative"
                    style={{ background: brand.themeGrad }}
                  >
                    <span className="text-[11px] text-slate-200">Belum ada foto AI</span>
                  </div>
                )}

                {/* Post Content Details */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-[11.5px]">
                    <span className="font-extrabold text-[10.5px] px-2 py-0.5 rounded bg-[rgba(23,147,232,0.16)] text-[#0F7FCE] dark:text-[#29B6F6] uppercase tracking-wider">
                      {brand.name}
                    </span>
                    <span className="flex items-center gap-1 text-[var(--slate-300)] font-semibold uppercase tracking-wider">
                      {post.platform === 'instagram' ? <Instagram className="w-3.5 h-3.5" /> : <Linkedin className="w-3.5 h-3.5" />}
                      {post.platform}
                    </span>
                    <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                      post.status === 'posted' ? 'bg-emerald-500/20 text-emerald-400' :
                      post.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                      post.status === 'pending_approval' ? 'bg-amber-500/20 text-amber-400' :
                      post.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {post.status.replace('_', ' ')}
                    </span>
                    <span className="text-[var(--slate-400)] ml-auto font-medium">
                      Scheduled: {new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="text-[13px] text-[var(--slate-100)] line-clamp-2 leading-relaxed">
                    {post.caption}
                  </div>

                  {post.rejectionComment && (
                    <div className="bg-rose-500/10 border-l-4 border-rose-500 p-2 text-[11.5px] text-rose-400 rounded-r-[4px]">
                      <strong>Rejection Reason:</strong> {post.rejectionComment}
                    </div>
                  )}

                  {/* v1 Manual Posting Toolkit on Approved Posts */}
                  {post.status === 'approved' && (
                    <div className="mt-1 bg-emerald-500/10 border border-emerald-500/25 rounded-[8px] p-2.5 flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-[11.5px] font-bold text-[#1FA579] flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        v1 Manual Publish: Copy copy &amp; graphic, post by hand
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleCopyCaption(post.caption)}
                          className="flex items-center gap-1 bg-[var(--navy-raised)] border border-[var(--navy-line)] hover:border-[#1793E8] text-[var(--white)] px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Caption
                        </button>
                        {post.mediaUrl && <button
                          onClick={() => handleDownloadImage(post.mediaUrl!, post.title)}
                          className="flex items-center gap-1 bg-[var(--navy-raised)] border border-[var(--navy-line)] hover:border-[#1793E8] text-[var(--white)] px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold"
                        >
                          <Download className="w-3 h-3" />
                          Download Image
                        </button>}
                        <button
                          onClick={() => handleMarkPosted(post.id)}
                          className="flex items-center gap-1 bg-[#1793E8] hover:bg-[#29B6F6] text-white px-3 py-1 rounded-[6px] text-[11.5px] font-bold"
                        >
                          <Check className="w-3 h-3" />
                          Mark as Posted
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Queue Actions Column */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                  {post.status === 'pending_approval' && (
                    role === 'approver' ? (
                      <>
                        <button
                          onClick={() => handleApprove(post.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-[8px] text-[12px] shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(post.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 text-rose-400 font-bold px-3.5 py-1.5 rounded-[8px] text-[12px]"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <div className="text-[11px] font-semibold text-[var(--slate-400)] bg-[var(--navy)] p-2 rounded text-center">
                        Awaiting Approver
                      </div>
                    )
                  )}

                  {post.status === 'rejected' && (
                    <button
                      onClick={() => router.push(`/create?edit=${post.id}`)}
                      className="flex-1 sm:flex-none bg-[#1793E8] text-white font-bold px-3 py-1.5 rounded-[8px] text-[11.5px]"
                    >
                      Edit Draft
                    </button>
                  )}

                  {post.status === 'posted' && (
                    <span className="text-[11.5px] font-bold text-[#1FA579] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Live
                    </span>
                  )}

                  <button
                    onClick={() => openPostDetail(post)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-[var(--slate-400)] hover:text-[var(--white)] text-[11px] font-semibold p-1"
                  >
                    <Eye className="w-3 h-3" />
                    Inspect
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
