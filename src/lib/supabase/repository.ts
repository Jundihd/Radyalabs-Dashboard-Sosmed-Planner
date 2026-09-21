// NOTE: Dummy posts dihapus. Semua post bersifat REAL dari Supabase.
// Dashboard memakai snapshot MANUAL Instagram Insights @radyalabs (bukan live API).
// Lihat src/lib/radya-insights.ts untuk rincian audience & top content.

import { Post, PerformanceMetrics } from '../types';

// Snapshot real IG @radyalabs 30 hari (18 Agu – 17 Sep): 628 followers, 13.266 views.
export const INITIAL_METRICS: PerformanceMetrics = {
  followers: '628',
  posts: '24',
  engagement: '1.0%',
  reach: '13,266',
};

// ---- DB row <-> Post mapping helpers (dipakai API route) ----
export interface PostRow {
  id: string;
  brand_slug?: string | null;
  brand_id?: string | null;
  brands?: { slug: string } | { slug: string }[] | null;
  platform: string;
  status: string;
  title: string;
  caption: string | null;
  media_url: string | null;
  scheduled_at: string | null;
  rejection_comment: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export function mapRowToPost(row: PostRow): Post {
  let slug: Post['brandSlug'] = 'radya';
  const rawSlug =
    row.brand_slug ||
    (Array.isArray(row.brands) ? row.brands[0]?.slug : (row.brands as any)?.slug);
  if (rawSlug === 'alkademi' || rawSlug === 'jangkau' || rawSlug === 'sinaptik' || rawSlug === 'radya') {
    slug = rawSlug;
  }
  return {
    id: row.id,
    brandSlug: slug,
    platform: row.platform === 'linkedin' ? 'linkedin' : 'instagram',
    status: (row.status as Post['status']) || 'draft',
    title: row.title || 'Untitled',
    caption: row.caption || '',
    mediaUrl: row.media_url || undefined,
    scheduledAt: row.scheduled_at || row.created_at,
    rejectionComment: row.rejection_comment ?? null,
    createdBy: row.created_by || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}
