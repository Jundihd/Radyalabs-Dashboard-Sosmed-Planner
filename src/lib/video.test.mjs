import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVideoPayload, validateVideoRequest } from './video.ts';

const base = {
  model: 'wan-3.0-720p',
  prompt: 'Create a bold product reel',
  seconds: '5',
  size: '720x1280',
};

test('maps prompt-only without reference fields', () => {
  assert.deepEqual(buildVideoPayload({ ...base, mode: 'prompt' }), base);
});

test('maps face and poster references to images', () => {
  for (const mode of ['face', 'poster']) {
    const input = {
      ...base,
      mode,
      referenceUrl: 'https://cdn.example/ref.png',
      faceConsent: mode === 'face',
    };
    assert.deepEqual(buildVideoPayload(input).images, ['https://cdn.example/ref.png']);
  }
});

test('maps clip reference to reference_videos', () => {
  const input = { ...base, mode: 'video', referenceUrl: 'https://cdn.example/ref.mp4' };
  assert.deepEqual(buildVideoPayload(input).reference_videos, ['https://cdn.example/ref.mp4']);
});

test('rejects missing media, consent, and unknown models', () => {
  assert.match(validateVideoRequest({ ...base, mode: 'video' }) ?? '', /referensi/i);
  assert.match(
    validateVideoRequest({ ...base, mode: 'face', referenceUrl: 'https://cdn.example/ref.png' }) ?? '',
    /persetujuan/i,
  );
  assert.match(validateVideoRequest({ ...base, mode: 'prompt', model: 'unknown' }) ?? '', /model/i);
});
