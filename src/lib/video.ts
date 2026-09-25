export const VIDEO_MODELS = [
  'wan-3.0-720p',
  'wan-3.0-1080p',
  'grok-imagine-video',
  'grok-imagine-video-1.5',
  'sd4-seedance2.0mini-720p',
  'mg-seedance-2.0-720p',
] as const;

export const VIDEO_PRESETS = {
  talking_head: 'Vertical talking-head reel with a fast hook, natural presenter delivery, and energetic social pacing.',
  product_story: 'Product-story reel with clear visual progression, benefit-led scenes, and polished commercial lighting.',
  ugc_review: 'Authentic UGC review with handheld realism, conversational energy, and credible reactions.',
  cinematic_promo: 'Cinematic promotional reel with purposeful camera movement, premium lighting, and dramatic pacing.',
} as const;

export const VIDEO_ENHANCEMENTS = {
  hook: 'Open with a strong visual hook in the first second.',
  captions: 'Use bold, readable social-video captions inside safe margins.',
  camera: 'Use dynamic but stable camera movement and purposeful cuts.',
  centered: 'Keep the main subject centered and clearly visible for vertical cropping.',
} as const;

export type VideoMode = 'prompt' | 'face' | 'poster' | 'video';

export type VideoRequest = {
  mode: VideoMode;
  model: string;
  prompt: string;
  seconds: string;
  size: string;
  referenceUrl?: string;
  faceConsent?: boolean;
  preset?: keyof typeof VIDEO_PRESETS;
  enhancements?: Array<keyof typeof VIDEO_ENHANCEMENTS>;
};

const SUCCESS_STATUSES = new Set(['completed', 'success', 'succeeded']);
const FAILURE_STATUSES = new Set(['failed', 'failure', 'cancelled', 'canceled']);

export function isVideoSuccessStatus(status: string) {
  return SUCCESS_STATUSES.has(status.toLowerCase());
}

export function isVideoFailureStatus(status: string) {
  return FAILURE_STATUSES.has(status.toLowerCase());
}

export function isVideoPendingStatus(status: string) {
  return !isVideoSuccessStatus(status) && !isVideoFailureStatus(status);
}

const MODES = new Set<VideoMode>(['prompt', 'face', 'poster', 'video']);
const SIZES = new Set(['720x1280', '1280x720', '1024x1024']);
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

export function validateReferenceFile(mode: VideoMode, mime: string, bytes: number): string | null {
  if (mode === 'prompt') return 'Mode prompt tidak memerlukan media referensi.';
  if (!Number.isFinite(bytes) || bytes <= 0) return 'File referensi tidak valid.';
  if (mode === 'video') {
    if (!VIDEO_TYPES.has(mime)) return 'Gunakan video MP4, MOV, atau WebM.';
    return bytes > 200 * 1024 * 1024 ? 'Ukuran video maksimal 200 MB.' : null;
  }
  if (!IMAGE_TYPES.has(mime)) return 'Gunakan gambar JPG, PNG, atau WebP.';
  return bytes > 10 * 1024 * 1024 ? 'Ukuran gambar maksimal 10 MB.' : null;
}

export function validateVideoRequest(input: Partial<VideoRequest> | null | undefined): string | null {
  if (!input || !MODES.has(input.mode as VideoMode)) return 'Mode video tidak valid.';
  if (!VIDEO_MODELS.includes(input.model as (typeof VIDEO_MODELS)[number])) return 'Model video tidak tersedia.';
  if (typeof input.prompt !== 'string' || !input.prompt.trim()) return 'Prompt video wajib diisi.';
  if (input.prompt.trim().length > 2000) return 'Prompt video maksimal 2.000 karakter.';
  if (input.seconds !== '5') return 'Durasi yang didukung pada versi ini adalah 5 detik.';
  if (!input.size || !SIZES.has(input.size)) return 'Format video tidak valid.';

  if (input.mode !== 'prompt') {
    try {
      const url = new URL(input.referenceUrl || '');
      if (url.protocol !== 'https:') return 'URL referensi harus memakai HTTPS.';
    } catch {
      return 'Media referensi wajib diupload.';
    }
  }
  if (input.mode === 'face' && input.faceConsent !== true) {
    return 'Persetujuan penggunaan wajah wajib dikonfirmasi.';
  }
  if (input.preset && !(input.preset in VIDEO_PRESETS)) return 'Preset video tidak valid.';
  if (input.enhancements?.some((item) => !(item in VIDEO_ENHANCEMENTS))) return 'Opsi enhancement tidak valid.';
  return null;
}

export function buildVideoPayload(input: VideoRequest): Record<string, unknown> {
  const additions = [
    input.preset ? VIDEO_PRESETS[input.preset] : '',
    ...(input.enhancements || []).map((item) => VIDEO_ENHANCEMENTS[item]),
  ].filter(Boolean);
  const payload: Record<string, unknown> = {
    model: input.model,
    prompt: additions.length ? `${input.prompt.trim()}\n\nCreative direction: ${additions.join(' ')}` : input.prompt.trim(),
    seconds: input.seconds,
    size: input.size,
  };

  if (input.mode === 'face' || input.mode === 'poster') payload.images = [input.referenceUrl];
  if (input.mode === 'video') payload.reference_videos = [input.referenceUrl];
  return payload;
}
