// Daftar model image generator via gateway NewAPI-compatible (server-only).
// Default: gpt-image-2.5-sunburst-4k. Sisanya dipakai sebagai fallback otomatis
// berurutan bila model utama gagal / token habis.

export const DEFAULT_IMAGE_MODEL = 'gpt-image-2.5-sunburst-4k';

export const IMAGE_MODEL_OPTIONS: { value: string; label: string }[] = [
  { value: 'gpt-image-2.5-sunburst-4k', label: 'gpt-image-2.5-sunburst-4k (Default)' },
  { value: 'gpt-image-2-4k', label: 'gpt-image-2-4k' },
  { value: 'gpt-image-2.5-flare-4k', label: 'gpt-image-2.5-flare-4k' },
  { value: 'gpt-image-2.5', label: 'gpt-image-2.5' },
  { value: 'gpt-image-2.5-sunburst', label: 'gpt-image-2.5-sunburst' },
  { value: 'gpt-image-2.5-flare', label: 'gpt-image-2.5-flare' },
  { value: 'nano-banana-pro-1k', label: 'nano-banana-pro-1k' },
  { value: 'nano-banana2-1k', label: 'nano-banana2-1k' },
  { value: 'gpt-image-2', label: 'gpt-image-2' },
  { value: 'grok-imagine-image', label: 'grok-imagine-image' },
];

export function orderedImageModels(requested?: string): string[] {
  const all = IMAGE_MODEL_OPTIONS.map((m) => m.value);
  if (!requested || !all.includes(requested)) return all;
  return [requested, ...all.filter((m) => m !== requested)];
}
