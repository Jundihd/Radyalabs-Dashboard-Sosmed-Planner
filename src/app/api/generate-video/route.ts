import { NextResponse } from 'next/server';
import { buildVideoPayload, validateVideoRequest, type VideoRequest } from '@/lib/video';
import { humanizeProviderError } from '@/lib/provider-errors';

export const maxDuration = 300;

function providerConfig() {
  const baseUrl = (process.env.NEW_API_BASE_URL || 'https://aotianzz.xyz').replace(/\/$/, '');
  const token = (process.env.NEW_API_TOKEN || '').trim();
  return { baseUrl, token };
}

function messageFrom(data: any, fallback: string) {
  return data?.error?.message || data?.error || data?.message || data?.fail_reason || fallback;
}

async function providerFetch(path: string, init?: RequestInit) {
  const { baseUrl, token } = providerConfig();
  if (!token) return NextResponse.json({ error: 'NEW_API_TOKEN belum dikonfigurasi.' }, { status: 503 });

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(init?.body ? 180_000 : 60_000),
    });
    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || 'Respons provider tidak valid.' };
    }
    if (!response.ok) {
      const status = response.status >= 400 && response.status < 600 ? response.status : 502;
      return NextResponse.json(
        { error: humanizeProviderError({ status, message: messageFrom(data, ''), action: 'video' }) },
        { status },
      );
    }
    return NextResponse.json({
      id: data.id,
      model: data.model,
      status: data.status,
      progress: typeof data.progress === 'number' ? data.progress : 0,
      url: data.url || data.video_url || data.result_url || data.metadata?.url,
      error: data.error?.message || data.fail_reason,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    return NextResponse.json(
      {
        error: humanizeProviderError({
          message: timedOut ? 'timeout' : 'fetch failed',
          action: 'video',
        }),
      },
      { status: 503 }
    );
  }
}

export async function POST(req: Request) {
  let input: VideoRequest;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }
  const error = validateVideoRequest(input);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return providerFetch('/v1/videos', { method: 'POST', body: JSON.stringify(buildVideoPayload(input)) });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !/^task_[A-Za-z0-9_-]{1,180}$/.test(id)) {
    return NextResponse.json({ error: 'Task ID tidak valid.' }, { status: 400 });
  }
  return providerFetch(`/v1/videos/${encodeURIComponent(id)}`);
}
