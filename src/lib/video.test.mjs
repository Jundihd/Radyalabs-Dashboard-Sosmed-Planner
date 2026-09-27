import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VIDEO_DURATIONS,
  buildVideoPayload,
  buildVideoCaptionBrief,
  isVideoFailureStatus,
  isVideoPendingStatus,
  isVideoSuccessStatus,
  validateReferenceFile,
  validateVideoRequest,
} from './video.ts';

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

test('validates reference media type and size', () => {
  assert.equal(validateReferenceFile('face', 'image/png', 1024), null);
  assert.equal(validateReferenceFile('video', 'video/mp4', 1024), null);
  assert.match(validateReferenceFile('video', 'image/png', 1024) ?? '', /video/i);
  assert.match(validateReferenceFile('poster', 'image/png', 11 * 1024 * 1024) ?? '', /10 MB/i);
  assert.match(validateReferenceFile('video', 'video/mp4', 201 * 1024 * 1024) ?? '', /200 MB/i);
});

test('classifies provider task statuses without treating unknown states as complete', () => {
  assert.equal(isVideoPendingStatus('queued'), true);
  assert.equal(isVideoPendingStatus('processing'), true);
  assert.equal(isVideoPendingStatus('archiving'), true);
  assert.equal(isVideoSuccessStatus('completed'), true);
  assert.equal(isVideoSuccessStatus('succeeded'), true);
  assert.equal(isVideoFailureStatus('failed'), true);
  assert.equal(isVideoFailureStatus('cancelled'), true);
  assert.equal(isVideoSuccessStatus('archiving'), false);
  assert.equal(isVideoFailureStatus('archiving'), false);
});

test('accepts only 5–8 second videos', () => {
  assert.deepEqual(VIDEO_DURATIONS, ['5', '6', '7', '8']);
  for (const seconds of VIDEO_DURATIONS) {
    assert.equal(validateVideoRequest({ ...base, mode: 'prompt', seconds }), null);
  }
  assert.match(validateVideoRequest({ ...base, mode: 'prompt', seconds: '4' }) ?? '', /5–8 detik/i);
  assert.match(validateVideoRequest({ ...base, mode: 'prompt', seconds: '9' }) ?? '', /5–8 detik/i);
});

test('builds a caption brief from video direction and optional user guidance', () => {
  assert.match(
    buildVideoCaptionBrief('Demo produk', 'product_story', 'Tambahkan CTA'),
    /Demo produk.*Product-story.*Tambahkan CTA/s,
  );
  assert.doesNotMatch(buildVideoCaptionBrief('Demo produk', 'product_story'), /Arahan caption:/);
});

test('builds a caption brief from manual direction when no video prompt was saved', () => {
  const brief = buildVideoCaptionBrief('', 'talking_head', 'Caption santai dengan CTA');
  assert.doesNotMatch(brief, /Konten video:\s*$/m);
  assert.match(brief, /talking-head.*Caption santai dengan CTA/is);
});
