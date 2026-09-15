import { GoogleGenAI } from '@google/genai';
import { BRANDS } from './brands';

export type CaptionSource = string;

// Model prioritas — dicoba berurutan sampai berhasil.
const TEXT_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];

export async function generateCaptionWithGemini(
  brief: string,
  brandSlug: string,
  platform: string
): Promise<{ text: string; source: CaptionSource; model: string }> {
  const brand = BRANDS[brandSlug] || BRANDS.radya;
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi. Caption AI tidak dapat dibuat tanpa koneksi Gemini.');
  }

  const prompt = `You are the lead social media strategist for ${brand.name}.
Target Brand Context:
- Audience: ${brand.audienceSummary}
- Tone & Voice: ${brand.toneContext}

Task:
Write an authentic, highly engaging ${platform} post based on this brief:
"${brief}"

Guidelines:
1. Match the exact tone of ${brand.name} (e.g. Radya Labs is credible and mission-critical without sales hype; Alkademi is educational and friendly for students; Jangkau is practical and benefit-driven for UMKM; Sinaptik is understated corporate training documentation).
2. Format clearly with readable spacing, bullet points or arrows if relevant, and 2-4 appropriate hashtags.
3. Output only the caption text directly.`;

  let lastError = 'Model tidak mengembalikan caption.';
  for (const model of TEXT_MODELS) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({ model, contents: prompt });
      const text = (response as any)?.text?.trim?.()
        || (response as any)?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
      if (text) return { text, source: 'gemini', model };
      lastError = `${model} tidak mengembalikan caption.`;
    } catch (err) {
      lastError = (err as Error)?.message || `Panggilan ke ${model} gagal.`;
      console.warn(`Gemini model ${model} gagal, coba berikutnya:`, lastError);
    }
  }
  throw new Error(`Gemini tidak dapat membuat caption: ${lastError}`);
}
