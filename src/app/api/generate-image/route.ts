import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { BRANDS } from '@/lib/brands';
import { DEFAULT_IMAGE_MODEL, orderedImageModels } from '@/lib/image-models';

const GEMINI_IMAGE_MODELS = ['gemini-3.1-flash-image', 'gemini-3-pro-image', 'gemini-2.5-flash-image'];
const BUCKET = 'social-media';

export async function GET() {
  return NextResponse.json({
    provider: (process.env.IMAGE_API_BASE_URL || 'https://aotianzz.xyz').replace(/\/$/, ''),
    defaultModel: process.env.IMAGE_DEFAULT_MODEL || DEFAULT_IMAGE_MODEL,
    models: orderedImageModels(process.env.IMAGE_DEFAULT_MODEL || DEFAULT_IMAGE_MODEL),
    fallback: 'gemini (bila IMAGE_API_KEY tidak dikonfigurasi / semua model gagal)',
  });
}

function storageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return url && key ? createClient(url, key) : null;
}

function buildPrompt(subject: string, brandName: string, brandContext: string, style?: string, caption?: string) {
  let full =
    `Create a premium, square 1:1 social media image for ${brandName}. ` +
    `Subject: ${subject}.` +
    `${style ? ` Visual style: ${style}.` : ''} ` +
    `Brand context: ${brandContext}.`;
  if (caption?.trim()) {
    full += ` Caption context (use for thematic alignment only, do NOT render any text in the image): ${caption.trim().slice(0, 800)}.`;
  }
  full += ' Use a clean composition, professional lighting, no watermark, and no text in the image.';
  return full;
}

async function saveToStorage(
  supabase: ReturnType<typeof storageClient> & {},
  brandSlug: string,
  buffer: Buffer,
  mimeType: string
) {
  const extension = mimeType.includes('jpeg') ? 'jpg' : mimeType.includes('webp') ? 'webp' : 'png';
  const path = `generated/${brandSlug}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });
  if (uploadError) throw new Error(`Gagal menyimpan gambar ke Supabase Storage: ${uploadError.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) throw new Error('Supabase Storage tidak mengembalikan URL publik gambar.');
  return { publicUrl: data.publicUrl, path };
}

// Gateway NewAPI-compatible (OpenAI-style): POST {base}/v1/images/generations
async function tryGatewayModel(baseUrl: string, apiKey: string, model: string, fullPrompt: string) {
  const res = await fetch(`${baseUrl}/v1/images/generations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt: fullPrompt, size: '1024x1024', n: 1 }),
    cache: 'no-store',
    signal: AbortSignal.timeout(180_000),
  });
  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Model ${model}: respons provider tidak valid.`);
  }
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(`Model ${model} gagal: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
  }
  const item = data?.data?.[0];
  if (item?.b64_json) {
    return { buffer: Buffer.from(item.b64_json, 'base64'), mimeType: 'image/png' };
  }
  const url = item?.url;
  if (url) {
    const imgRes = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(120_000) });
    if (!imgRes.ok) throw new Error(`Model ${model}: gagal mengunduh hasil gambar.`);
    const mimeType = imgRes.headers.get('content-type') || 'image/png';
    return { buffer: Buffer.from(await imgRes.arrayBuffer()), mimeType };
  }
  throw new Error(`Model ${model} tidak mengembalikan gambar.`);
}

export async function POST(req: Request) {
  try {
    const { prompt, brandSlug, style, model: requestedModel, caption } = await req.json();
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt visual wajib diisi.' }, { status: 400 });

    const supabase = storageClient();
    if (!supabase) return NextResponse.json({ error: 'Supabase service role belum dikonfigurasi; gambar tidak dapat disimpan.' }, { status: 503 });

    const brand = BRANDS[brandSlug] || BRANDS.radya;
    const fullPrompt = buildPrompt(prompt.trim(), brand.name, brand.toneContext, style, caption);
    const errors: string[] = [];

    // 1) Provider utama: gateway aotianzz — model pilihan dulu, lalu fallback berurutan.
    const baseUrl = (process.env.IMAGE_API_BASE_URL || 'https://aotianzz.xyz').replace(/\/$/, '');
    const apiKey = (process.env.IMAGE_API_KEY || '').trim();
    if (apiKey) {
      for (const model of orderedImageModels(requestedModel || process.env.IMAGE_DEFAULT_MODEL || DEFAULT_IMAGE_MODEL)) {
        try {
          const { buffer, mimeType } = await tryGatewayModel(baseUrl, apiKey, model, fullPrompt);
          const { publicUrl, path } = await saveToStorage(supabase, brand.slug, buffer, mimeType);
          return NextResponse.json({ imageUrl: publicUrl, storagePath: path, source: 'aotian-image', model });
        } catch (error: any) {
          const msg = error?.message || `Panggilan ${model} gagal.`;
          errors.push(msg);
          console.warn(msg);
        }
      }
    } else {
      errors.push('IMAGE_API_KEY belum dikonfigurasi; lewati ke fallback Gemini.');
    }

    // 2) Fallback terakhir: Gemini (bila key tersedia).
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      for (const model of GEMINI_IMAGE_MODELS) {
        try {
          const response: any = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: { responseModalities: ['TEXT', 'IMAGE'] } as any,
          });
          const parts: any[] = response?.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find((part) => part?.inlineData?.data || part?.inline_data?.data);
          const base64 = imagePart?.inlineData?.data || imagePart?.inline_data?.data;
          const mimeType = imagePart?.inlineData?.mimeType || imagePart?.inline_data?.mime_type || 'image/png';
          if (!base64) {
            errors.push(`${model} tidak mengembalikan gambar.`);
            continue;
          }
          const { publicUrl, path } = await saveToStorage(supabase, brand.slug, Buffer.from(base64, 'base64'), mimeType);
          return NextResponse.json({ imageUrl: publicUrl, storagePath: path, source: 'gemini', model });
        } catch (error: any) {
          const msg = error?.message || `Panggilan ${model} gagal.`;
          errors.push(msg);
          console.warn(`Gemini image model ${model} gagal:`, msg);
        }
      }
    }

    return NextResponse.json({ error: `Foto AI gagal dibuat: ${errors[errors.length - 1] || 'semua model gagal.'}`, triedDetails: errors }, { status: 503 });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate image' }, { status: 500 });
  }
}
