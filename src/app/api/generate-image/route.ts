import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { BRANDS } from '@/lib/brands';

const IMAGE_MODELS = ['gemini-3.1-flash-image', 'gemini-3-pro-image', 'gemini-2.5-flash-image'];
const BUCKET = 'social-media';

function storageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return url && key ? createClient(url, key) : null;
}

export async function POST(req: Request) {
  try {
    const { prompt, brandSlug, style } = await req.json();
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt visual wajib diisi.' }, { status: 400 });

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY belum dikonfigurasi.' }, { status: 503 });
    const supabase = storageClient();
    if (!supabase) return NextResponse.json({ error: 'Supabase service role belum dikonfigurasi; gambar tidak dapat disimpan.' }, { status: 503 });

    const brand = BRANDS[brandSlug] || BRANDS.radya;
    const fullPrompt = `Create a premium, square 1:1 social media image for ${brand.name}. Subject: ${prompt}. ${style ? `Visual style: ${style}.` : ''} Brand context: ${brand.toneContext}. Use a clean composition, professional lighting, no watermark, and no text in the image.`;
    const ai = new GoogleGenAI({ apiKey });
    let lastError = 'Gemini tidak mengembalikan data gambar.';

    for (const model of IMAGE_MODELS) {
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
          lastError = `${model} tidak mengembalikan gambar.`;
          continue;
        }

        const extension = mimeType.includes('jpeg') ? 'jpg' : mimeType.includes('webp') ? 'webp' : 'png';
        const path = `generated/${brand.slug}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, Buffer.from(base64, 'base64'), { contentType: mimeType, upsert: false });
        if (uploadError) throw new Error(`Gagal menyimpan gambar ke Supabase Storage: ${uploadError.message}`);
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        if (!data.publicUrl) throw new Error('Supabase Storage tidak mengembalikan URL publik gambar.');

        return NextResponse.json({ imageUrl: data.publicUrl, storagePath: path, source: 'gemini', model });
      } catch (error: any) {
        lastError = error?.message || `Panggilan ${model} gagal.`;
        console.warn(`Gemini image model ${model} gagal:`, lastError);
      }
    }
    return NextResponse.json({ error: `Foto AI gagal dibuat: ${lastError}` }, { status: 503 });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate image' }, { status: 500 });
  }
}
