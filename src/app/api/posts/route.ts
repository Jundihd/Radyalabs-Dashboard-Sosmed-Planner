import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mapRowToPost } from '@/lib/supabase/repository';

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || (!serviceKey && !anonKey)) return null;
  // Service role diutamakan agar bypass RLS untuk internal tool.
  return createClient(url, serviceKey || anonKey);
}

export async function GET() {
  const supabase = getAdmin();
  if (!supabase) {
    return NextResponse.json(
      { posts: [], error: 'SUPABASE_NOT_CONFIGURED', hint: 'Isi NEXT_PUBLIC_SUPABASE_URL + ANON_KEY + SERVICE_ROLE_KEY di .env.local' },
      { status: 503 }
    );
  }
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, brands(slug)')
      .order('scheduled_at', { ascending: true });
    if (error) throw error;
    const posts = (data || []).map((r: any) => mapRowToPost(r));
    return NextResponse.json({ posts, source: 'supabase' });
  } catch (err: any) {
    return NextResponse.json({ posts: [], error: err?.message || 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = getAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { brandSlug, platform, status, title, caption, mediaUrl, scheduledAt, rejectionComment, createdBy } = body;

    if (!title?.trim() || !caption?.trim() || !scheduledAt || Number.isNaN(+new Date(scheduledAt))) {
      return NextResponse.json({ error: 'title, caption, dan scheduledAt yang valid wajib diisi' }, { status: 400 });
    }
    if (!['radya', 'alkademi', 'jangkau', 'sinaptik'].includes(brandSlug)) {
      return NextResponse.json({ error: 'Brand tidak valid.' }, { status: 400 });
    }
    if (!['instagram', 'linkedin'].includes(platform)) {
      return NextResponse.json({ error: 'Platform tidak valid.' }, { status: 400 });
    }

    // Resolve brand_id dari slug (tabel brands wajib di-seed via supabase/seed.sql)
    let brandId: string | null = null;
    if (brandSlug) {
      const { data: brand } = await supabase.from('brands').select('id').eq('slug', brandSlug).maybeSingle();
      brandId = brand?.id || null;
    }
    if (!brandId) {
      return NextResponse.json(
        { error: `Brand ${brandSlug} belum ada di database. Jalankan supabase/seed.sql dulu.` },
        { status: 400 }
      );
    }

    const payload: Record<string, any> = {
      brand_id: brandId,
      brand_slug: brandSlug,
      platform,
      status: ['draft', 'pending_approval'].includes(status) ? status : 'draft',
      title,
      caption,
      media_url: mediaUrl || null,
      scheduled_at: scheduledAt,
      rejection_comment: rejectionComment ?? null,
    };

    const { data, error } = await supabase.from('posts').insert(payload).select('*, brands(slug)').single();
    if (error) throw error;
    return NextResponse.json({ success: true, post: mapRowToPost(data), source: 'supabase' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create post' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const supabase = getAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }
  try {
    const { id, status, rejectionComment, title, caption, mediaUrl, scheduledAt, platform, brandSlug } = await req.json();
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (rejectionComment !== undefined) updates.rejection_comment = rejectionComment;
    if (title !== undefined) updates.title = title;
    if (caption !== undefined) updates.caption = caption;
    if (mediaUrl !== undefined) updates.media_url = mediaUrl;
    if (scheduledAt !== undefined) updates.scheduled_at = scheduledAt;
    if (platform !== undefined) updates.platform = platform;
    if (brandSlug !== undefined) {
      if (!['radya', 'alkademi', 'jangkau', 'sinaptik'].includes(brandSlug)) {
        return NextResponse.json({ error: 'Brand tidak valid.' }, { status: 400 });
      }
      updates.brand_slug = brandSlug;
      const { data: brand } = await supabase.from('brands').select('id').eq('slug', brandSlug).maybeSingle();
      if (!brand?.id) return NextResponse.json({ error: `Brand ${brandSlug} belum ada di database.` }, { status: 400 });
      updates.brand_id = brand.id;
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select('*, brands(slug)')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, post: mapRowToPost(data), source: 'supabase' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const supabase = getAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id wajib (?id=...)' }, { status: 400 });
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete post' }, { status: 500 });
  }
}
