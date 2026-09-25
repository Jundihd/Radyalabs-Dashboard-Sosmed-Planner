import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateReferenceFile, type VideoMode } from '@/lib/video';

const BUCKET = 'social-media';
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

export async function POST(req: Request) {
  let input: { mode?: VideoMode; name?: string; type?: string; size?: number };
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const mode = input.mode;
  if (!mode || !['face', 'poster', 'video'].includes(mode)) {
    return NextResponse.json({ error: 'Mode referensi tidak valid.' }, { status: 400 });
  }
  const error = validateReferenceFile(mode, input.type || '', Number(input.size));
  if (error) return NextResponse.json({ error }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase Storage belum dikonfigurasi.' }, { status: 503 });
  }

  const path = `video-references/${mode}/${Date.now()}-${crypto.randomUUID()}.${EXTENSIONS[input.type || '']}`;
  const supabase = createClient(url, key);
  const { data, error: uploadError } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (uploadError || !data?.token) {
    return NextResponse.json({ error: uploadError?.message || 'Token upload tidak dapat dibuat.' }, { status: 503 });
  }
  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ path, token: data.token, publicUrl: publicData.publicUrl });
}
