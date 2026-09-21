import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BRANDS } from '@/lib/brands';

const BUCKET = 'social-media';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function storageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return url && key ? createClient(url, key) : null;
}

export async function POST(req: Request) {
  try {
    const supabase = storageClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase service role belum dikonfigurasi; upload tidak dapat disimpan.' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const brandSlugRaw = formData.get('brandSlug');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File foto wajib diisi.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP.' },
        { status: 400 }
      );
    }
    if (file.size <= 0) {
      return NextResponse.json({ error: 'File kosong / rusak.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Ukuran maksimal 5MB. File kamu ${(file.size / 1024 / 1024).toFixed(1)}MB.` },
        { status: 400 }
      );
    }

    const brandSlug = typeof brandSlugRaw === 'string' && BRANDS[brandSlugRaw] ? brandSlugRaw : 'radya';
    const brand = BRANDS[brandSlug] || BRANDS.radya;

    const ext =
      file.type.includes('jpeg') || file.type.includes('jpg')
        ? 'jpg'
        : file.type.includes('webp')
          ? 'webp'
          : 'png';
    const safeName = (file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
    const path = `uploads/${brand.slug}/${Date.now()}-${crypto.randomUUID()}-${safeName}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (uploadError) {
      return NextResponse.json(
        { error: `Gagal menyimpan foto ke Supabase Storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
      return NextResponse.json(
        { error: 'Supabase Storage tidak mengembalikan URL publik foto.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: data.publicUrl,
      storagePath: path,
      source: 'upload',
      fileName: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: error?.message || 'Gagal mengunggah foto' }, { status: 500 });
  }
}
