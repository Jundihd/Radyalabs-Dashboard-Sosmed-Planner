'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function RejectModal() {
  const { rejectModalPostId, closeRejectModal, updatePostStatus, showToast } = useApp();
  const [comment, setComment] = useState('');

  if (!rejectModalPostId) return null;

  const handleConfirm = async () => {
    if (!comment.trim()) {
      showToast('Rejection reason is required so the creator knows what to revise.', 'warning');
      return;
    }

    const updated = await updatePostStatus(rejectModalPostId, 'rejected', comment.trim());
    if (!updated) return;
    showToast('Post returned to Draft state with revision feedback.', 'warning');
    setComment('');
    closeRejectModal();
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--navy-raised)] border border-[var(--navy-line)] rounded-[16px] p-6 w-full max-w-[460px] shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-rose-400 font-head font-bold text-[16px]">
            <AlertCircle className="w-5 h-5" />
            <h3>Reject Post with Required Comment</h3>
          </div>
          <button
            onClick={closeRejectModal}
            className="text-[var(--slate-400)] hover:text-[var(--white)] p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[12.5px] text-[var(--slate-300)] mb-4 leading-relaxed">
          In v1, rejecting a post returns it to <strong>Draft</strong> for the creator. A specific comment is required to guide their revision.
        </p>

        <div className="mb-4">
          <label className="block text-[12px] font-bold text-[var(--slate-300)] uppercase tracking-wider mb-2">
            Feedback / Instructions for Creator
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Tone reads too promotional. Remove emojis and emphasize our enterprise compliance certifications."
            className="w-full bg-[var(--navy)] border border-[var(--navy-line)] rounded-[8px] p-3 text-[13px] text-[var(--white)] focus:outline-none focus:border-[#1793E8]"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--navy-line)]">
          <button
            onClick={closeRejectModal}
            className="bg-[var(--navy)] border border-[var(--navy-line)] text-[var(--slate-300)] hover:text-[var(--white)] px-4 py-2 rounded-[8px] text-[12.5px] font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-[8px] text-[12.5px] font-bold transition-all"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
