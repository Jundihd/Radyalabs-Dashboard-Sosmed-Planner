export type PostPlatform = 'instagram' | 'linkedin';

export type PostStatus = 'draft' | 'pending_approval' | 'approved' | 'posted' | 'rejected';

export type UserRole = 'creator' | 'approver';

export interface Brand {
  id: string;
  slug: 'radya' | 'alkademi' | 'jangkau' | 'sinaptik';
  name: string;
  audienceSummary: string;
  toneContext: string;
  themeGrad: string;
  quickPrompts: string[];
  defaultPrompt: string;
}

export interface Post {
  id: string;
  brandSlug: 'radya' | 'alkademi' | 'jangkau' | 'sinaptik';
  platform: PostPlatform;
  status: PostStatus;
  title: string;
  caption: string;
  mediaUrl?: string;
  scheduledAt: string; // ISO string or YYYY-MM-DDTHH:mm
  rejectionComment?: string | null;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PerformanceMetrics {
  followers: string;
  posts: string;
  engagement: string;
  reach: string;
  updatedAt?: string;
}

export interface HistoricalPost {
  id: string;
  date: string;
  format: 'Carousel' | 'Video' | 'Photo';
  topic: string;
  thumbClass: string;
}
