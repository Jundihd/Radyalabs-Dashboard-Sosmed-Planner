import { NextResponse } from 'next/server';
import { generateCaptionWithGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brief, brandSlug, platform } = body;

    if (!brief) {
      return NextResponse.json({ error: 'Brief or prompt is required' }, { status: 400 });
    }

    const result = await generateCaptionWithGemini(brief, brandSlug || 'radya', platform || 'instagram');
    return NextResponse.json({
      caption: result.text,
      source: result.source,
      model: result.model,
      geminiConnected: true,
    });
  } catch (error: any) {
    console.error('Error generating caption:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate caption' }, { status: 503 });
  }
}
