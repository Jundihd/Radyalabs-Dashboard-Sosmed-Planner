'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Post, UserRole, PerformanceMetrics, PostStatus } from '../types';
import { INITIAL_METRICS } from '../supabase/repository';

interface ToastData {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  posts: Post[];
  loadingPosts: boolean;
  backendError: string | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<Post | null>;
  updatePostStatus: (id: string, status: PostStatus, rejectionComment?: string | null, extra?: Partial<Post>) => Promise<Post | null>;
  refreshPosts: () => Promise<void>;
  metrics: PerformanceMetrics;
  updateMetrics: (newMetrics: Partial<PerformanceMetrics>) => void;
  toasts: ToastData[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  selectedPost: Post | null;
  openPostDetail: (post: Post) => void;
  closePostDetail: () => void;
  rejectModalPostId: string | null;
  openRejectModal: (id: string) => void;
  closeRejectModal: () => void;
  metricsModalOpen: boolean;
  openMetricsModal: () => void;
  closeMetricsModal: () => void;
  pendingCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [role, setRoleState] = useState<UserRole>('approver');
  const [metrics, setMetrics] = useState<PerformanceMetrics>(INITIAL_METRICS);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [rejectModalPostId, setRejectModalPostId] = useState<string | null>(null);
  const [metricsModalOpen, setMetricsModalOpen] = useState<boolean>(false);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `t_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshPosts = useCallback(async () => {
    setLoadingPosts(true);
    setBackendError(null);
    try {
      const res = await fetch('/api/posts', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.hint || `HTTP ${res.status}`);
      }
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (e: any) {
      setPosts([]);
      setBackendError(e?.message || 'Gagal memuat posts dari Supabase');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    refreshPosts();
    try {
      const savedRole = localStorage.getItem('radya_role') as UserRole;
      if (savedRole) setRoleState(savedRole);
      const savedMetrics = localStorage.getItem('radya_metrics');
      if (savedMetrics) setMetrics(JSON.parse(savedMetrics));
    } catch {}
  }, [refreshPosts]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem('radya_role', newRole);
    } catch {}
    showToast(
      newRole === 'approver'
        ? 'Switched to Aloysius (Approver). Full approval rights active.'
        : 'Switched to Arif (Creator). Draft and submit rights active.',
      'info'
    );
  };

  // REAL: tulis ke Supabase via /api/posts, lalu refresh state dari respons.
  const addPost = async (postData: Omit<Post, 'id' | 'createdAt'>): Promise<Post | null> => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal menyimpan ke database');
      const created: Post = data.post;
      setPosts((prev) => {
        const merged = [created, ...prev];
        return merged.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
      });
      return created;
    } catch (e: any) {
      showToast(e?.message || 'Gagal menyimpan post', 'error');
      return null;
    }
  };

  const updatePostStatus = async (
    id: string,
    status: PostStatus,
    rejectionComment?: string | null,
    extra?: Partial<Post>
  ) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          rejectionComment,
          title: extra?.title,
          caption: extra?.caption,
          mediaUrl: extra?.mediaUrl,
          scheduledAt: extra?.scheduledAt,
          platform: extra?.platform,
          brandSlug: extra?.brandSlug,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal update status');
      const updated: Post = data.post;
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      if (selectedPost && selectedPost.id === id) setSelectedPost(updated);
      return updated;
    } catch (e: any) {
      showToast(e?.message || 'Gagal update post', 'error');
      return null;
    }
  };

  const updateMetrics = (newMetrics: Partial<PerformanceMetrics>) => {
    const updated = { ...metrics, ...newMetrics, updatedAt: new Date().toISOString() };
    setMetrics(updated);
    try {
      localStorage.setItem('radya_metrics', JSON.stringify(updated));
    } catch {}
    showToast('Dashboard metrics updated! (dummy dashboard)', 'success');
  };

  const pendingCount = posts.filter((p) => p.status === 'pending_approval').length;

  return (
    <AppContext.Provider
      value={{
        posts,
        loadingPosts,
        backendError,
        role,
        setRole,
        addPost,
        updatePostStatus,
        refreshPosts,
        metrics,
        updateMetrics,
        toasts,
        showToast,
        removeToast,
        selectedPost,
        openPostDetail: (post) => setSelectedPost(post),
        closePostDetail: () => setSelectedPost(null),
        rejectModalPostId,
        openRejectModal: (id) => setRejectModalPostId(id),
        closeRejectModal: () => setRejectModalPostId(null),
        metricsModalOpen,
        openMetricsModal: () => setMetricsModalOpen(true),
        closeMetricsModal: () => setMetricsModalOpen(false),
        pendingCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
