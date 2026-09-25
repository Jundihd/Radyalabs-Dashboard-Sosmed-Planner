'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  Clapperboard,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileVideo2,
  Image as ImageIcon,
  Loader2,
  Play,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  WandSparkles,
  X,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import {
  VIDEO_ENHANCEMENTS,
  VIDEO_MODELS,
  VIDEO_PRESETS,
  isVideoFailureStatus,
  isVideoPendingStatus,
  isVideoSuccessStatus,
  validateReferenceFile,
  validateVideoRequest,
  type VideoMode,
  type VideoRequest,
} from '@/lib/video';
import { humanizeClientError } from '@/lib/provider-errors';

const STORAGE_KEY = 'radya_video_task';
const POLL_LIMIT = 60 * 60 * 1000;

const MODES: Array<{ id: VideoMode; label: string; hint: string }> = [
  { id: 'prompt', label: 'Prompt Only', hint: 'Buat dari ide tertulis' },
  { id: 'face', label: 'Face Reference', hint: 'Jaga karakter wajah' },
  { id: 'poster', label: 'Poster Reference', hint: 'Hidupkan visual desain' },
  { id: 'video', label: 'Video Reference', hint: 'Remix gerak dan suasana' },
];

const RATIOS = [
  { label: '9:16 Reel', value: '720x1280' },
  { label: '16:9 Wide', value: '1280x720' },
  { label: '1:1 Square', value: '1024x1024' },
];

const PRESETS: Array<{ value: keyof typeof VIDEO_PRESETS; label: string }> = [
  { value: 'talking_head', label: 'Talking Head Viral' },
  { value: 'product_story', label: 'Product Story' },
  { value: 'ugc_review', label: 'UGC Review' },
  { value: 'cinematic_promo', label: 'Cinematic Promo' },
];

const ENHANCEMENTS: Array<{ value: keyof typeof VIDEO_ENHANCEMENTS; label: string }> = [
  { value: 'hook', label: 'Strong Hook' },
  { value: 'captions', label: 'Bold Captions' },
  { value: 'camera', label: 'Dynamic Camera' },
  { value: 'centered', label: 'Keep Centered' },
];

type VideoTask = {
  id: string;
  status: string;
  progress: number;
  model?: string;
  url?: string;
  error?: string;
  createdAt: number;
};

function ModeIcon({ mode }: { mode: VideoMode }) {
  if (mode === 'face') return <UserRound className="h-5 w-5" />;
  if (mode === 'poster') return <ImageIcon className="h-5 w-5" />;
  if (mode === 'video') return <FileVideo2 className="h-5 w-5" />;
  return <WandSparkles className="h-5 w-5" />;
}

export default function ContentVideoPage() {
  const { showToast } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<VideoMode>('prompt');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<string>(VIDEO_MODELS[0]);
  const [size, setSize] = useState('720x1280');
  const [preset, setPreset] = useState<keyof typeof VIDEO_PRESETS>('talking_head');
  const [enhancements, setEnhancements] = useState<Array<keyof typeof VIDEO_ENHANCEMENTS>>(['hook', 'captions', 'centered']);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [faceConsent, setFaceConsent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [task, setTask] = useState<VideoTask | null>(null);
  const [pollingStartedAt, setPollingStartedAt] = useState<number | null>(null);
  const [pollDelay, setPollDelay] = useState(7000);
  const [pollError, setPollError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const restored = JSON.parse(saved) as VideoTask;
      if (!restored?.id) return;
      setTask(restored);
      if (isVideoPendingStatus(restored.status)) setPollingStartedAt(Date.now());
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (task) localStorage.setItem(STORAGE_KEY, JSON.stringify(task));
  }, [task]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const checkTask = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/generate-video?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Status video gagal diperiksa.');
      setPollDelay(7000);
      setPollError('');
      setTask((current) => current?.id === id ? {
        ...current,
        status: data.status || current.status,
        progress: typeof data.progress === 'number' ? data.progress : current.progress,
        model: data.model || current.model,
        url: data.url || current.url,
        error: data.error || undefined,
      } : current);
      if (isVideoSuccessStatus(data.status || '')) {
        setPollingStartedAt(null);
        showToast('Video AI selesai dan siap dipreview.', 'success');
      } else if (isVideoFailureStatus(data.status || '')) {
        setPollingStartedAt(null);
        showToast(data.error || 'Generasi video gagal.', 'error');
      }
    } catch (error) {
      setPollDelay((current) => Math.min(current * 2, 60_000));
      setPollError(humanizeClientError(error, 'video'));
    }
  }, [showToast]);

  useEffect(() => {
    if (!task || !isVideoPendingStatus(task.status) || pollingStartedAt === null) return;
    if (Date.now() - pollingStartedAt >= POLL_LIMIT) {
      setPollingStartedAt(null);
      setPollError('Pemantauan dijeda setelah 60 menit. Task tetap tersimpan dan dapat dicek lagi.');
      return;
    }
    const timer = window.setTimeout(() => void checkTask(task.id), pollDelay);
    return () => window.clearTimeout(timer);
  }, [checkTask, pollDelay, pollingStartedAt, task]);

  const changeMode = (nextMode: VideoMode) => {
    setMode(nextMode);
    setFile(null);
    setPreviewUrl(null);
    setFaceConsent(false);
    if (inputRef.current) inputRef.current.value = '';
    if (nextMode === 'video') setModel('mg-seedance-2.0-720p');
  };

  const selectFile = (selected: File | null) => {
    if (!selected) return;
    const error = validateReferenceFile(mode, selected.type, selected.size);
    if (error) {
      showToast(error, 'error');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const toggleEnhancement = (value: keyof typeof VIDEO_ENHANCEMENTS) => {
    setEnhancements((current) => current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]);
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    let referenceUrl: string | undefined;
    const draft: VideoRequest = { mode, model, prompt, seconds: '5', size, preset, enhancements, faceConsent };
    if (mode !== 'prompt' && !file) {
      showToast('Pilih media referensi terlebih dahulu.', 'warning');
      return;
    }
    if (file) {
      const fileError = validateReferenceFile(mode, file.type, file.size);
      if (fileError) {
        showToast(fileError, 'error');
        return;
      }
    }

    setIsGenerating(true);
    try {
      if (file) {
        const signedResponse = await fetch('/api/video-reference-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, name: file.name, type: file.type, size: file.size }),
        });
        const signed = await signedResponse.json();
        if (!signedResponse.ok) throw new Error(signed?.error || 'Token upload gagal dibuat.');
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
        const { error: uploadError } = await supabase.storage
          .from('social-media')
          .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
        if (uploadError) throw new Error(`Upload referensi gagal: ${uploadError.message}`);
        referenceUrl = signed.publicUrl;
      }

      const request: VideoRequest = { ...draft, referenceUrl };
      const validationError = validateVideoRequest(request);
      if (validationError) throw new Error(validationError);
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Video gagal dibuat.');
      if (!data?.id) throw new Error('Provider tidak mengembalikan task ID.');
      const nextTask: VideoTask = {
        id: data.id,
        status: data.status || 'queued',
        progress: typeof data.progress === 'number' ? data.progress : 0,
        model: data.model || model,
        createdAt: Date.now(),
      };
      setTask(nextTask);
      setPollError('');
      setPollDelay(7000);
      setPollingStartedAt(Date.now());
      showToast('Task video dibuat. Proses biasanya memerlukan 10–25 menit.', 'success');
    } catch (error) {
      showToast(humanizeClientError(error, 'video'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearTask = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTask(null);
    setPollingStartedAt(null);
    setPollError('');
  };

  const canGenerate = Boolean(
    prompt.trim()
    && (mode === 'prompt' || file)
    && (mode !== 'face' || faceConsent),
  );
  const isPending = Boolean(task && isVideoPendingStatus(task.status));
  const progress = Math.max(0, Math.min(100, task?.progress || 0));

  return (
    <div className="mx-auto max-w-[1380px]">
      <header className="mb-7 flex flex-col gap-4 border-b border-[var(--navy-line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#1793E8]/30 bg-[#1793E8]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#0F7FCE] dark:text-[#29B6F6]">
            <Sparkles className="h-3.5 w-3.5" /> AI Video Studio
          </div>
          <h1 className="font-head text-3xl font-extrabold text-[var(--white)] sm:text-[38px]">Content Video</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--slate-300)]">
            Ubah ide, wajah, poster, atau klip referensi menjadi video sosial yang siap dipreview.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--navy-line)] bg-[var(--navy-raised)] px-3.5 py-2.5 text-xs text-[var(--slate-300)] shadow-sm">
          <Clock3 className="h-4 w-4 text-[#1FA579] dark:text-[#43D3A4]" />
          <span>Estimasi AI 10–25 menit</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
        <section className="space-y-5">
          <div className="rounded-2xl border border-[var(--navy-line)] bg-[var(--navy-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0F7FCE] dark:text-[#29B6F6]">01 · Input</span>
                <h2 className="mt-1 font-head text-lg font-bold text-[var(--white)]">Pilih bahan video</h2>
              </div>
              <span className="rounded-md bg-[var(--navy)] px-2 py-1 font-mono text-[10px] text-[var(--slate-400)]">1 MODE / 1 TASK</span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {MODES.map((item) => {
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => changeMode(item.id)}
                    className={`min-h-[92px] rounded-xl border p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#1793E8] ${active ? 'border-[#1793E8] bg-[#1793E8]/10 shadow-[inset_0_0_0_1px_rgba(23,147,232,.2)]' : 'border-[var(--navy-line)] bg-[var(--navy)] hover:border-[#1793E8]/60'}`}
                  >
                    <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${active ? 'bg-[#1793E8] text-white' : 'bg-[var(--navy-raised)] text-[var(--slate-300)]'}`}>
                      <ModeIcon mode={item.id} />
                    </span>
                    <span className="block text-[12px] font-bold text-[var(--white)]">{item.label}</span>
                    <span className="mt-1 block text-[10.5px] text-[var(--slate-400)]">{item.hint}</span>
                  </button>
                );
              })}
            </div>

            {mode !== 'prompt' ? (
              <div className="mt-4">
                <input
                  ref={inputRef}
                  type="file"
                  className="sr-only"
                  accept={mode === 'video' ? 'video/mp4,video/quicktime,video/webm' : 'image/jpeg,image/png,image/webp'}
                  onChange={(event) => selectFile(event.target.files?.[0] || null)}
                />
                {!file ? (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex min-h-[150px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#1793E8]/50 bg-[#1793E8]/5 px-5 text-center transition-colors hover:bg-[#1793E8]/10 focus:outline-none focus:ring-2 focus:ring-[#1793E8]"
                  >
                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#1793E8]/15 text-[#0F7FCE] dark:text-[#29B6F6]"><Upload className="h-5 w-5" /></span>
                    <span className="text-sm font-bold text-[var(--white)]">Upload {mode === 'video' ? 'video klip' : 'gambar referensi'}</span>
                    <span className="mt-1 text-xs text-[var(--slate-400)]">{mode === 'video' ? 'MP4, MOV, WebM · maks. 200 MB' : 'JPG, PNG, WebP · maks. 10 MB'}</span>
                  </button>
                ) : (
                  <div className="relative overflow-hidden rounded-xl border border-[var(--navy-line)] bg-[var(--navy-deep)]">
                    {mode === 'video' ? (
                      <video src={previewUrl || undefined} controls preload="metadata" className="max-h-[340px] w-full bg-black object-contain" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl || ''} alt="Preview media referensi" className="max-h-[340px] w-full object-contain" />
                    )}
                    <div className="flex items-center justify-between gap-3 border-t border-[var(--navy-line)] bg-[var(--navy-raised)] px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[var(--white)]">{file.name}</p>
                        <p className="text-[10px] text-[var(--slate-400)]">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <button type="button" onClick={() => changeMode(mode)} className="rounded-lg p-2 text-[var(--slate-400)] hover:bg-[var(--navy)] hover:text-[var(--white)]" aria-label="Hapus media referensi">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'face' ? (
                  <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-xs leading-5 text-[var(--slate-300)]">
                    <input type="checkbox" checked={faceConsent} onChange={(event) => setFaceConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-[#1793E8]" />
                    <span><strong className="text-[var(--white)]">Saya memiliki izin penggunaan wajah ini.</strong> Saya tidak menggunakannya untuk menyamar atau merugikan orang lain.</span>
                  </label>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[var(--navy-line)] bg-[var(--navy-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="mb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#1FA579] dark:text-[#43D3A4]">02 · Direction</span>
              <h2 className="mt-1 font-head text-lg font-bold text-[var(--white)]">Arahkan cerita dan gaya</h2>
            </div>

            <label htmlFor="video-prompt" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--slate-300)]">Prompt video</label>
            <textarea
              id="video-prompt"
              rows={5}
              maxLength={2000}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Contoh: Presenter UMKM berjalan di toko sambil menjelaskan strategi display produk, opening cepat, ekspresi natural, pencahayaan hangat..."
              className="w-full resize-y rounded-xl border border-[var(--navy-line)] bg-[var(--navy)] p-4 text-sm leading-6 text-[var(--white)] outline-none transition-colors placeholder:text-[var(--slate-400)] focus:border-[#1FA579]"
            />
            <div className="mt-1 text-right font-mono text-[10px] text-[var(--slate-400)]">{prompt.length}/2000</div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label htmlFor="video-model" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--slate-300)]">AI Model</label>
                <select id="video-model" value={model} onChange={(event) => setModel(event.target.value)} className="h-11 w-full rounded-lg border border-[var(--navy-line)] bg-[var(--navy)] px-3 text-xs font-semibold text-[var(--white)] outline-none focus:border-[#1793E8]">
                  {VIDEO_MODELS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="video-ratio" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--slate-300)]">Format</label>
                <select id="video-ratio" value={size} onChange={(event) => setSize(event.target.value)} className="h-11 w-full rounded-lg border border-[var(--navy-line)] bg-[var(--navy)] px-3 text-xs font-semibold text-[var(--white)] outline-none focus:border-[#1793E8]">
                  {RATIOS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="video-duration" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--slate-300)]">Duration</label>
                <select id="video-duration" value="5" disabled className="h-11 w-full rounded-lg border border-[var(--navy-line)] bg-[var(--navy)] px-3 text-xs font-semibold text-[var(--slate-300)] opacity-80">
                  <option value="5">5 sec · model may override</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[var(--slate-300)]">Viral preset</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((item) => (
                  <button key={item.value} type="button" aria-pressed={preset === item.value} onClick={() => setPreset(item.value)} className={`min-h-10 rounded-lg border px-3 text-xs font-bold transition-colors ${preset === item.value ? 'border-[#1FA579] bg-[#1FA579]/15 text-[var(--white)]' : 'border-[var(--navy-line)] bg-[var(--navy)] text-[var(--slate-300)] hover:border-[#1FA579]/60'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[var(--slate-300)]">Creative boosts</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ENHANCEMENTS.map((item) => {
                  const active = enhancements.includes(item.value);
                  return (
                    <button key={item.value} type="button" aria-pressed={active} onClick={() => toggleEnhancement(item.value)} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-2 text-[11px] font-bold transition-colors ${active ? 'border-[#1793E8] bg-[#1793E8]/10 text-[var(--white)]' : 'border-[var(--navy-line)] bg-[var(--navy)] text-[var(--slate-400)]'}`}>
                      {active ? <Check className="h-3.5 w-3.5 text-[#1793E8]" /> : null}{item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-[var(--navy-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-[11px] text-[var(--slate-400)]">
                <ShieldCheck className="h-4 w-4 text-[#1FA579] dark:text-[#43D3A4]" /> Satu klik membuat satu task berbayar.
              </div>
              <button type="button" disabled={!canGenerate || isGenerating} onClick={handleGenerate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F7FCE] to-[#1FA579] px-6 text-sm font-extrabold text-white shadow-lg shadow-[#1793E8]/15 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? 'Creating task…' : 'Generate with AI'}
              </button>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-[var(--navy-line)] bg-[var(--navy-raised)] p-4 shadow-[var(--shadow-card)] xl:sticky xl:top-6">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--slate-400)]">Output Monitor</span>
              <h2 className="mt-1 font-head text-base font-bold text-[var(--white)]">Preview &amp; download</h2>
            </div>
            {task ? <button type="button" onClick={clearTask} className="rounded-lg p-2 text-[var(--slate-400)] hover:bg-[var(--navy)] hover:text-[var(--white)]" aria-label="Hapus task dari tampilan"><X className="h-4 w-4" /></button> : null}
          </div>

          {!task ? (
            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-xl border border-[var(--navy-line)] bg-[var(--navy-deep)] p-8">
              <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(23,147,232,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(23,147,232,.08)_1px,transparent_1px)] [background-size:32px_32px]" />
              <div className="relative text-center">
                <div className="mx-auto mb-5 flex aspect-[9/16] h-48 items-center justify-center rounded-[22px] border-2 border-[var(--navy-line)] bg-[var(--navy-raised)] shadow-xl">
                  <Play className="h-9 w-9 text-[#1793E8]" />
                </div>
                <p className="font-head text-base font-bold text-[var(--white)]">Output muncul di sini</p>
                <p className="mx-auto mt-2 max-w-[250px] text-xs leading-5 text-[var(--slate-400)]">Pilih mode, tulis prompt, lalu buat satu task video AI.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--navy-line)] bg-[var(--navy-deep)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--navy-line)] bg-[var(--navy)] px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--slate-400)]">Task ID</p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--slate-300)]">{task.id}</p>
                </div>
                <button type="button" onClick={() => navigator.clipboard.writeText(task.id).then(() => showToast('Task ID disalin.', 'success'))} className="rounded-lg border border-[var(--navy-line)] bg-[var(--navy-raised)] p-2 text-[var(--slate-300)] hover:text-[var(--white)]" aria-label="Salin task ID"><Copy className="h-3.5 w-3.5" /></button>
              </div>

              {isPending ? (
                <div className="flex min-h-[440px] flex-col items-center justify-center p-8 text-center" aria-live="polite">
                  <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#1793E8]/30 bg-[#1793E8]/10">
                    <Clapperboard className="h-8 w-8 text-[#1793E8]" />
                    {pollingStartedAt !== null ? <span className="absolute inset-[-7px] animate-spin rounded-full border-2 border-transparent border-t-[#43D3A4]" /> : null}
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0F7FCE] dark:text-[#29B6F6]">{task.status.replaceAll('_', ' ')}</p>
                  <p className="mt-2 font-head text-xl font-bold text-[var(--white)]">AI sedang menyusun video</p>
                  <p className="mt-2 max-w-[280px] text-xs leading-5 text-[var(--slate-400)]">Task tetap berjalan di provider meski halaman ditutup.</p>
                  <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[var(--navy-line)]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1793E8] to-[#43D3A4] transition-[width] duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-2 flex w-full justify-between font-mono text-[10px] text-[var(--slate-400)]"><span>{progress}%</span><span>{task.model}</span></div>
                  {pollError ? <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-left text-[11px] leading-5 text-amber-700 dark:text-amber-200">{pollError}</p> : null}
                  {pollingStartedAt === null ? (
                    <button type="button" onClick={() => { setPollingStartedAt(Date.now()); setPollDelay(1000); setPollError(''); void checkTask(task.id); }} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--navy-line)] bg-[var(--navy-raised)] px-3 py-2 text-xs font-bold text-[var(--white)]">
                      <RotateCw className="h-3.5 w-3.5" /> Check again
                    </button>
                  ) : null}
                </div>
              ) : null}

              {isVideoFailureStatus(task.status) ? (
                <div className="flex min-h-[440px] flex-col items-center justify-center p-8 text-center" aria-live="assertive">
                  <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500"><X className="h-7 w-7" /></span>
                  <p className="font-head text-xl font-bold text-[var(--white)]">Generasi gagal</p>
                  <p className="mt-3 max-w-[290px] text-xs leading-5 text-[var(--slate-300)]">{task.error || 'Provider tidak dapat menyelesaikan video ini. Coba ubah prompt atau referensi.'}</p>
                </div>
              ) : null}

              {isVideoSuccessStatus(task.status) && task.url ? (
                <div aria-live="polite">
                  <video src={task.url} controls playsInline preload="metadata" className="max-h-[600px] w-full bg-black object-contain" />
                  <div className="space-y-3 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1FA579] dark:text-[#43D3A4]"><Check className="h-4 w-4" /> Video siap digunakan</div>
                    <div className="grid grid-cols-2 gap-2">
                      <a href={task.url} download target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1FA579] px-3 text-xs font-extrabold text-white"><Download className="h-4 w-4" /> Download</a>
                      <a href={task.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--navy-line)] bg-[var(--navy-raised)] px-3 text-xs font-bold text-[var(--white)]"><ExternalLink className="h-4 w-4" /> Open video</a>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <p className="mt-3 px-1 text-[10.5px] leading-5 text-[var(--slate-400)]">Media referensi harus dapat diakses provider selama proses. Jangan unggah materi rahasia.</p>
        </aside>
      </div>
    </div>
  );
}
