import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

  // --- Supabase check ---
  let supabase: { connected: boolean; detail: string; postCount?: number } = {
    connected: false,
    detail: 'Env belum diisi',
  };
  if (url && (anon || service)) {
    try {
      const client = createClient(url, service || anon);
      const { count, error } = await client.from('posts').select('id', { count: 'exact', head: true });
      if (error) {
        supabase = { connected: false, detail: error.message };
      } else {
        supabase = { connected: true, detail: 'OK — tabel posts bisa diakses', postCount: count ?? 0 };
      }
    } catch (e: any) {
      supabase = { connected: false, detail: e?.message || 'Koneksi gagal' };
    }
  } else {
    const missing = [
      !url ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
      !anon ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
      !service ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
    ].filter(Boolean);
    supabase = { connected: false, detail: `Missing env: ${missing.join(', ')}` };
  }

  // --- Storage check ---
  let storage: { connected: boolean; detail: string } = { connected: false, detail: 'Supabase belum terhubung' };
  if (url && service) {
    try {
      const client = createClient(url, service);
      const { error } = await client.storage.getBucket('social-media');
      storage = error
        ? { connected: false, detail: `Bucket social-media: ${error.message}` }
        : { connected: true, detail: 'Bucket social-media siap' };
    } catch (e: any) {
      storage = { connected: false, detail: e?.message || 'Koneksi Storage gagal' };
    }
  } else if (!service) {
    storage = { connected: false, detail: 'SUPABASE_SERVICE_ROLE_KEY belum diisi' };
  }

  // --- Gemini check (text, ringan) ---
  let gemini: { connected: boolean; detail: string; model?: string } = {
    connected: false,
    detail: 'GEMINI_API_KEY belum diisi',
  };
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const res: any = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: 'Reply with exactly: OK' });
      const text = (res?.text || res?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
      gemini = text
        ? { connected: true, detail: `OK — model gemini-3.6-flash merespons ("${text.slice(0, 40)}")`, model: 'gemini-3.6-flash' }
        : { connected: false, detail: 'Key ada tapi model tidak mengembalikan teks' };
    } catch (e: any) {
      gemini = { connected: false, detail: e?.message?.slice(0, 200) || 'Gemini call gagal' };
    }
  }

  const allOk = supabase.connected && storage.connected && gemini.connected;

  // --- Provider video/image (ringan: GET /v1/models, key tidak pernah dibocorkan) ---
  async function checkProvider(
    label: string, baseEnv: string, keyEnv: string, fallbackBase: string
  ): Promise<{ connected: boolean; detail: string }> {
    const base = (process.env[baseEnv] || fallbackBase).replace(/\/$/, '');
    const key = (process.env[keyEnv] || '').trim();
    if (!key) return { connected: false, detail: `${keyEnv} belum diisi` };
    try {
      const res = await fetch(`${base}/v1/models`, {
        headers: { Authorization: `Bearer ${key}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) return { connected: false, detail: `${label}: provider menolak (${res.status}) — cek key` };
      const data: any = await res.json().catch(() => ({}));
      const count = Array.isArray(data?.data) ? data.data.length : 0;
      return { connected: true, detail: `${label}: OK — ${base} (${count} model)` };
    } catch (e: any) {
      return { connected: false, detail: `${label}: tidak dapat dihubungi (${e?.message || 'timeout'})` };
    }
  }

  const [video, image] = await Promise.all([
    checkProvider('Video', 'NEW_API_BASE_URL', 'NEW_API_TOKEN', 'https://aotianzz.xyz'),
    checkProvider('Image', 'IMAGE_API_BASE_URL', 'IMAGE_API_KEY', 'https://aotianzz.xyz'),
  ]);

  return NextResponse.json(
    { ok: allOk, supabase, storage, gemini, video, image, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  );
}
