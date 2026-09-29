'use client';

import React from 'react';
import { X, Copy, Download, Check, AlertCircle, Edit3, Send, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { BRANDS } from '@/lib/brands';
import { useRouter } from 'next/navigation';

export default function PostDetailModal() {
  const { selectedPost, closePostDetail, updatePostStatus, deletePost, openRejectModal, showToast, role } = useApp();
  const router = useRouter();

  if (!selectedPost) return null;

  const brand = BRANDS[selectedPost.brandSlug] || BRANDS.radya;

  const copyCaption = () => {
    navigator.clipboard.writeText(selectedPost.caption).then(() => {
      showToast('Caption copied to clipboard ready to paste!', 'success');
    }).catch(() => {
      showToast('Caption copied to clipboard!', 'success');
    });
  };

  const downloadImage = async () => {
    if (!selectedPost.mediaUrl) return;
    const a = document.createElement('a');
    a.href = selectedPost.mediaUrl;
    a.download = `${brand.slug}_${selectedPost.id}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Foto AI diunduh!', 'success');
  };

  const markPosted = async () => {
    const updated = await updatePostStatus(selectedPost.id, 'posted');
    if (!updated) return;
    showToast('Post marked as live on platform!', 'success');
    closePostDetail();
  };

  const handleApprove = async () => {
    const updated = await updatePostStatus(selectedPost.id, 'approved');
    if (updated) showToast('Post approved! Manual posting toolkit is now active.', 'success');
  };

  const handleEditResubmit = () => {
    closePostDetail();
    router.push(`/create?edit=${selectedPost.id}`);
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[16px] p-6 w-full max-w-[560px] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-head font-bold text-[17px] text-[var(--white)]">Post Details</h3>
          <button
            onClick={closePostDetail}
            className="text-[var(--slate-400)] hover:text-[var(--white)] p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap text-[12px]">
          <span className="font-extrabold text-[10.5px] px-2.5 py-0.5 rounded bg-[rgba(23,147,232,0.16)] text-[#0F7FCE] dark:text-[#29B6F6] uppercase tracking-wider">
            {brand.name}
          </span>
          <span className="font-semibold text-[var(--slate-300)] uppercase tracking-wider">
            {selectedPost.platform}
          </span>
          <span className={`font-extrabold text-[10.5px] px-2 py-0.5 rounded uppercase tracking-wider ${
            selectedPost.status === 'posted' ? 'bg-emerald-500/20 text-emerald-400' :
            selectedPost.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
            selectedPost.status === 'pending_approval' ? 'bg-amber-500/20 text-amber-400' :
            selectedPost.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {selectedPost.status.replace('_', ' ')}
          </span>
          <span className="text-[11.5px] text-[var(--slate-400)] ml-auto font-medium">
            {new Date(selectedPost.scheduledAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Visual Preview — REAL mediaUrl kalau ada */}
        {selectedPost.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selectedPost.mediaUrl} alt={selectedPost.title} className="w-full rounded-[8px] border border-[var(--navy-line)] object-cover max-h-[320px] mb-4" />
        ) : (
          <div
            className="w-full h-36 rounded-[8px] flex items-center justify-center p-4 mb-4 text-center overflow-hidden relative shadow-inner"
            style={{ background: brand.themeGrad }}
          >
            <div className="font-head font-extrabold text-[16px] text-white drop-shadow-md z-10">
              Foto AI belum dibuat untuk post ini.
            </div>
          </div>
        )}

        {/* Caption */}
        <div className="text-[12px] font-bold text-[var(--slate-300)] uppercase tracking-wider mb-1.5">
          Caption
        </div>
        <div className="bg-[var(--navy-deep)] border border-[var(--navy-line)] p-3.5 rounded-[10px] text-[13px] leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap text-[var(--slate-100)] mb-4">
          {selectedPost.caption}
        </div>

        {/* Rejection Alert if any */}
        {selectedPost.rejectionComment && (
          <div className="bg-rose-500/10 border-l-4 border-rose-500 p-3 rounded-r-[6px] text-[12px] text-rose-400 mb-4">
            <strong>Approver Rejection Feedback:</strong> {selectedPost.rejectionComment}
          </div>
        )}

        {/* Contextual Action Toolkit */}
        {selectedPost.status === 'approved' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[10px] p-3.5 mb-4">
            <div className="text-[11.5px] font-bold text-[#1FA579] flex items-center gap-1.5 mb-2.5">
              <Check className="w-3.5 h-3.5" />
              v1 Manual Posting Toolkit: Post by hand, then mark posted.
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedPost.mediaUrl && <button
                onClick={copyCaption}
                className="flex items-center gap-1.5 bg-[var(--navy-raised)] border border-[var(--navy-line)] text-[var(--white)] px-3 py-1.5 rounded-[6px] text-[12px] font-semibold hover:border-[#1793E8]"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Caption
              </button>}
              <button
                onClick={downloadImage}
                className="flex items-center gap-1.5 bg-[var(--navy-raised)] border border-[var(--navy-line)] text-[var(--white)] px-3 py-1.5 rounded-[6px] text-[12px] font-semibold hover:border-[#1793E8]"
              >
                <Download className="w-3.5 h-3.5" />
                Download Image
              </button>
              <button
                onClick={markPosted}
                className="flex items-center gap-1.5 bg-[#1793E8] text-white px-3.5 py-1.5 rounded-[6px] text-[12px] font-bold hover:bg-[#29B6F6]"
              >
                <Check className="w-3.5 h-3.5" />
                Mark as Posted
              </button>
            </div>
          </div>
        )}

        {/* Draft Actions: Edit Draft or Submit for Approval */}
        {selectedPost.status === 'draft' && (
          <div className="bg-[var(--navy-deep)] border border-[var(--navy-line)] rounded-[12px] p-3.5 mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[12px] font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Status: Draft (Belum disubmit ke Approver)
              </span>
              <span className="text-[11px] text-[var(--slate-400)]">
                Langkah berikutnya: Edit atau Ajukan
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleEditResubmit}
                className="flex-1 bg-[#1793E8] hover:bg-[#29B6F6] text-white font-bold py-2 px-3 rounded-[8px] text-[12.5px] flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                Edit Draft
              </button>
              <button
                onClick={async () => {
                  const updated = await updatePostStatus(selectedPost.id, 'pending_approval');
                  if (updated) {
                    showToast('Draft berhasil diajukan untuk approval! Masuk antrean.', 'success');
                    closePostDetail();
                  }
                }}
                className="flex-1 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold py-2 px-3 rounded-[8px] text-[12.5px] flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                Submit for Approval
              </button>
              <button
                onClick={async () => {
                  if (confirm('Yakin ingin menghapus draft ini?')) {
                    const ok = await deletePost(selectedPost.id);
                    if (ok) closePostDetail();
                  }
                }}
                className="bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-400 px-3 py-2 rounded-[8px] flex items-center justify-center transition-all text-[12px] font-semibold gap-1.5"
                title="Hapus Draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {selectedPost.status === 'pending_approval' && role === 'approver' && (
          <div className="flex gap-2.5 mb-4">
            <button
              onClick={handleApprove}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-[8px] text-[12.5px] flex items-center justify-center gap-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Approve Post
            </button>
            <button
              onClick={() => {
                closePostDetail();
                openRejectModal(selectedPost.id);
              }}
              className="flex-1 bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 text-rose-400 font-bold py-2 px-3 rounded-[8px] text-[12.5px] flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Reject with Comment
            </button>
          </div>
        )}

        {selectedPost.status === 'pending_approval' && role !== 'approver' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-[10px] p-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[12px] font-semibold text-amber-300">
              Sedang menunggu review &amp; approval dari Approver.
            </span>
            <button
              onClick={handleEditResubmit}
              className="bg-[var(--navy-raised)] border border-[var(--navy-line)] hover:border-[#1793E8] text-[var(--white)] text-[12px] font-bold px-3 py-1.5 rounded-[6px] flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit / Revisi Post
            </button>
          </div>
        )}

        {selectedPost.status === 'rejected' && (
          <div className="flex gap-2.5 mb-4">
            <button
              onClick={handleEditResubmit}
              className="flex-1 bg-[#1793E8] hover:bg-[#29B6F6] text-white font-bold py-2 px-4 rounded-[8px] text-[13px] flex items-center justify-center gap-2 shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit &amp; Resubmit Draft
            </button>
            <button
              onClick={async () => {
                if (confirm('Yakin ingin menghapus post ini?')) {
                  const ok = await deletePost(selectedPost.id);
                  if (ok) closePostDetail();
                }
              }}
              className="bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-400 px-3 py-2 rounded-[8px] flex items-center justify-center transition-all text-[12px] font-semibold"
              title="Hapus Post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-[var(--navy-line)]">
          <button
            onClick={closePostDetail}
            className="bg-[var(--navy)] border border-[var(--navy-line)] text-[var(--slate-300)] hover:text-[var(--white)] px-4 py-2 rounded-[8px] text-[12.5px] font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
