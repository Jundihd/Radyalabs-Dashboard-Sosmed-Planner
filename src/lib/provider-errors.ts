// Menerjemahkan error teknis provider / jaringan menjadi pesan Bahasa Indonesia
// yang mudah dipahami orang non-teknis. Bisa dipakai di server maupun client.

export type ProviderErrorInput = {
  status?: number;
  message?: string;
  /** 'image' | 'video' — dipakai untuk saran yang kontekstual */
  action?: 'image' | 'video';
};

const QUOTA_PATTERNS = [
  'insufficient', 'quota', 'balance', 'credit', 'billing', 'token habis',
  'out of', 'exceeded', 'rate limit', 'too many requests', 'overloaded',
  'capacity', '402',
];
const AUTH_PATTERNS = ['unauthorized', 'invalid api key', 'incorrect api key', 'invalid_api_key', 'forbidden', 'authenticate'];
const NOT_FOUND_PATTERNS = ['model not found', 'not exist', 'no such model', 'unknown model'];
const TIMEOUT_PATTERNS = ['timeout', 'timed out', 'timeouterror', 'abort', 'melewati batas waktu'];
const NETWORK_PATTERNS = [
  'failed to fetch', 'fetch failed', 'networkerror', 'network request failed',
  'enotfound', 'eai_again', 'econnrefused', 'econnreset', 'dns', 'offline',
  'tidak dapat dihubungi', 'tidak terhubung',
];
const POLICY_PATTERNS = ['content policy', 'moderation', 'blocked', 'safety', 'inappropriate', 'not allowed'];

function includesAny(haystack: string, patterns: string[]) {
  return patterns.some((p) => haystack.includes(p));
}

export function humanizeProviderError(input: ProviderErrorInput): string {
  const status = input?.status;
  const raw = (input?.message || '').trim();
  const lower = raw.toLowerCase();
  const isVideo = input?.action === 'video';

  if (includesAny(lower, TIMEOUT_PATTERNS) || status === 408 || status === 504) {
    return isVideo
      ? 'Prosesnya terlalu lama dan koneksi kami hentikan agar tidak menggantung. Task video yang sudah dibuat tetap tersimpan — cek lagi statusnya beberapa menit kemudian.'
      : 'Prosesnya terlalu lama dan kami hentikan agar tidak menggantung. Coba generate sekali lagi.';
  }
  if (includesAny(lower, NETWORK_PATTERNS)) {
    return 'Tidak terhubung ke server AI. Periksa koneksi internet kamu, lalu coba lagi.';
  }
  if (status === 401 || status === 403 || includesAny(lower, AUTH_PATTERNS)) {
    return 'API key AI ditolak oleh provider. Minta admin untuk memeriksa key di Environment Variables, lalu redeploy.';
  }
  if (status === 402 || status === 429 || includesAny(lower, QUOTA_PATTERNS)) {
    return isVideo
      ? 'Kuota/token AI habis atau sedang dibatasi. Coba ganti model video lain, atau isi ulang kuota provider lalu coba lagi.'
      : 'Kuota/token AI habis atau sedang dibatasi. Sistem sudah mencoba model cadangan — coba ganti model dari dropdown, atau isi ulang kuota provider lalu coba lagi.';
  }
  if (status === 404 || includesAny(lower, NOT_FOUND_PATTERNS)) {
    return 'Model AI yang dipilih tidak tersedia di provider. Pilih model lain dari dropdown lalu coba lagi.';
  }
  if (status === 400 || includesAny(lower, POLICY_PATTERNS)) {
    return includesAny(lower, POLICY_PATTERNS)
      ? 'Prompt ditolak oleh filter keamanan provider. Coba ubah kata-katanya menjadi lebih netral lalu generate ulang.'
      : 'Request ditolak provider (parameter tidak valid). Coba sederhanakan prompt lalu generate ulang. Detail: ' +
          (raw ? raw.slice(0, 160) : 'tidak ada keterangan.');
  }
  if (status === 500 || status === 502 || status === 503) {
    return 'Server AI sedang bermasalah. Tunggu 1–2 menit lalu coba lagi — tidak perlu mengubah apa pun.';
  }

  if (raw) {
    const short = raw.length > 200 ? `${raw.slice(0, 200)}…` : raw;
    return `Gagal generate${isVideo ? ' video' : ' foto'}: ${short}`;
  }
  return `Gagal generate${isVideo ? ' video' : ' foto'}. Coba lagi sebentar lagi.`;
}

/** Untuk catch di browser (fetch gagal, offline, timeout). */
export function humanizeClientError(error: unknown, action: 'image' | 'video'): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'Kamu sedang offline. Sambungkan internet lalu coba lagi.';
  }
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? '');
  const lower = message.toLowerCase();
  if (lower.includes('timeout') || lower.includes('abort')) {
    return humanizeProviderError({ message: 'timeout', action });
  }
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('fetch')) {
    return 'Tidak terhubung ke server. Periksa koneksi internet kamu, lalu coba lagi.';
  }
  // Pesan dari API route kita sendiri sudah human-friendly — teruskan apa adanya.
  if (error instanceof Error && error.message) return error.message;
  return humanizeProviderError({ action });
}
