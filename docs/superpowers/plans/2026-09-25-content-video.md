# Content Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add and deploy a Content Video workflow with four reference modes, asynchronous AoTian generation, preview, and download.

**Architecture:** A pure TypeScript module owns validation and provider payload mapping. Two Next.js route handlers create/query provider tasks and issue Supabase signed upload credentials, while one client page uploads references directly to Supabase, polls generation state, and renders the result. The existing sidebar gains a nested Content Creation group.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Supabase Storage, native Node test runner, AoTian `/v1/videos` API, Vercel.

## Global Constraints

- Keep `/create` as Content Post and add `/create/video` as Content Video.
- Support exactly prompt-only, face-reference, poster-reference, and video-reference modes.
- Keep `NEW_API_TOKEN` server-only and never log it.
- Use the existing public Supabase `social-media` bucket and direct signed uploads.
- One Generate click creates one provider task; never auto-create retries or batches.
- Poll every seven seconds, preserve the full task ID, and stop local polling after 60 minutes.
- Require explicit face-use consent in face-reference mode.
- Add no runtime or test dependency.
- Do not submit a paid generation request during verification without separate user confirmation.

---

### Task 1: Provider Contract and Route

**Files:**
- Create: `src/lib/video.ts`
- Create: `src/lib/video.test.mjs`
- Create: `src/app/api/generate-video/route.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `VIDEO_MODELS`, `VideoMode`, `VideoRequest`, `validateVideoRequest(input)`, and `buildVideoPayload(input)`.
- Produces: `POST /api/generate-video` returning `{ id, status, progress }` and `GET /api/generate-video?id=...` returning normalized provider state.

- [ ] **Step 1: Write the failing native Node tests**

Create `src/lib/video.test.mjs` with assertions for all four modes, the model allowlist, required media, face consent, `images`, and `reference_videos` mapping:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVideoPayload, validateVideoRequest } from './video.ts';

const base = { model: 'wan-3.0-720p', prompt: 'Create a bold product reel', seconds: '5', size: '720x1280' };

test('maps prompt-only without reference fields', () => {
  assert.deepEqual(buildVideoPayload({ ...base, mode: 'prompt' }), base);
});

test('maps face and poster references to images', () => {
  for (const mode of ['face', 'poster']) {
    const input = { ...base, mode, referenceUrl: 'https://cdn.example/ref.png', faceConsent: mode === 'face' };
    assert.deepEqual(buildVideoPayload(input).images, ['https://cdn.example/ref.png']);
  }
});

test('maps clip reference to reference_videos', () => {
  const input = { ...base, mode: 'video', referenceUrl: 'https://cdn.example/ref.mp4' };
  assert.deepEqual(buildVideoPayload(input).reference_videos, ['https://cdn.example/ref.mp4']);
});

test('rejects missing media, consent, and unknown models', () => {
  assert.match(validateVideoRequest({ ...base, mode: 'video' }) ?? '', /referensi/i);
  assert.match(validateVideoRequest({ ...base, mode: 'face', referenceUrl: 'https://cdn.example/ref.png' }) ?? '', /persetujuan/i);
  assert.match(validateVideoRequest({ ...base, mode: 'prompt', model: 'unknown' }) ?? '', /model/i);
});
```

- [ ] **Step 2: Run the focused test and confirm red**

Run: `node --test src/lib/video.test.mjs`

Expected: FAIL because `src/lib/video.ts` does not exist.

- [ ] **Step 3: Implement the pure contract**

Create `src/lib/video.ts` with the six verified model IDs, strict mode/type definitions, a validation function returning an Indonesian error string or `null`, and payload mapping that only adds `images` or `reference_videos` for the selected mode. Append creative preset/toggle guidance to the prompt before mapping.

Core shape:

```ts
export const VIDEO_MODELS = ['wan-3.0-720p', 'wan-3.0-1080p', 'grok-imagine-video', 'grok-imagine-video-1.5', 'sd4-seedance2.0mini-720p', 'mg-seedance-2.0-720p'] as const;
export type VideoMode = 'prompt' | 'face' | 'poster' | 'video';
export type VideoRequest = { mode: VideoMode; model: string; prompt: string; seconds: string; size: string; referenceUrl?: string; faceConsent?: boolean; preset?: string; enhancements?: string[] };
export function validateVideoRequest(input: VideoRequest): string | null;
export function buildVideoPayload(input: VideoRequest): Record<string, unknown>;
```

- [ ] **Step 4: Implement the server proxy**

Create `src/app/api/generate-video/route.ts`:

```ts
export async function POST(req: Request) {
  const input = await req.json();
  const error = validateVideoRequest(input);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return providerFetch('/v1/videos', { method: 'POST', body: JSON.stringify(buildVideoPayload(input)) });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id?.startsWith('task_')) return NextResponse.json({ error: 'Task ID tidak valid.' }, { status: 400 });
  return providerFetch(`/v1/videos/${encodeURIComponent(id)}`);
}
```

`providerFetch` must read `NEW_API_BASE_URL` and `NEW_API_TOKEN`, set Bearer authentication, normalize non-JSON/provider errors, and return only task fields needed by the browser.

- [ ] **Step 5: Add and run the test script**

Add `"test:video": "node --test src/lib/video.test.mjs"` to `package.json`.

Run: `npm run test:video`

Expected: four passing tests, zero failures.

- [ ] **Step 6: Commit Task 1**

```bash
git add package.json src/lib/video.ts src/lib/video.test.mjs src/app/api/generate-video/route.ts
git commit -m "feat: add video generation API"
```

---

### Task 2: Signed Reference Upload

**Files:**
- Create: `src/app/api/video-reference-upload/route.ts`

**Interfaces:**
- Consumes: existing `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `social-media` bucket.
- Produces: `POST /api/video-reference-upload` returning `{ path, token, publicUrl }` for direct browser upload.

- [ ] **Step 1: Extend the failing validation test**

Add table assertions to `src/lib/video.test.mjs` for allowed MIME types and size limits through exported `validateReferenceFile(mode, mime, bytes)`:

```js
assert.equal(validateReferenceFile('face', 'image/png', 1024), null);
assert.equal(validateReferenceFile('video', 'video/mp4', 1024), null);
assert.match(validateReferenceFile('video', 'image/png', 1024) ?? '', /video/i);
assert.match(validateReferenceFile('poster', 'image/png', 11 * 1024 * 1024) ?? '', /10 MB/i);
assert.match(validateReferenceFile('video', 'video/mp4', 201 * 1024 * 1024) ?? '', /200 MB/i);
```

- [ ] **Step 2: Run the focused test and confirm red**

Run: `npm run test:video`

Expected: FAIL because `validateReferenceFile` is not exported.

- [ ] **Step 3: Add minimal file validation**

Export `validateReferenceFile(mode, mime, bytes)` from `src/lib/video.ts`, accepting JPEG/PNG/WebP up to 10 MB for face/poster and MP4/QuickTime/WebM up to 200 MB for video.

- [ ] **Step 4: Implement signed-upload route**

Validate `name`, `type`, `size`, and `mode`; create a randomized `video-references/<mode>/<uuid>.<ext>` path; call `createSignedUploadUrl`; and return its token plus `getPublicUrl(path).data.publicUrl`. Never accept file bytes in this route.

- [ ] **Step 5: Verify and commit Task 2**

Run: `npm run test:video`

Expected: all tests pass.

```bash
git add src/lib/video.ts src/lib/video.test.mjs src/app/api/video-reference-upload/route.ts
git commit -m "feat: add signed video reference uploads"
```

---

### Task 3: Content Video UI and Navigation

**Files:**
- Create: `src/app/create/video/page.tsx`
- Modify: `src/components/Sidebar.tsx`

**Interfaces:**
- Consumes: `VIDEO_MODELS`, browser Supabase client, both new API routes, and existing `showToast`.
- Produces: accessible `/create/video` workflow and nested Content Creation navigation.

- [ ] **Step 1: Build the four-mode form**

Create a client page with:

```ts
const MODES = [
  { id: 'prompt', label: 'Prompt Only' },
  { id: 'face', label: 'Face Reference' },
  { id: 'poster', label: 'Poster Reference' },
  { id: 'video', label: 'Video Reference' },
] as const;
```

Add prompt, model, aspect ratio, 5-second duration, preset, enhancement toggles, contextual file input, media preview, and consent checkbox. Disable Generate until the current mode is valid.

- [ ] **Step 2: Add direct upload and task creation**

On Generate, request signed upload metadata when needed, call `supabase.storage.from('social-media').uploadToSignedUrl(path, token, file)`, then POST the assembled request to `/api/generate-video`. Save the returned full task ID and creation timestamp under `radya_video_task` in local storage.

- [ ] **Step 3: Add polling recovery and result UI**

Poll `/api/generate-video?id=...` every seven seconds while status is queued/in-progress/processing. Restore the saved task after refresh, keep unknown states pending, stop after terminal state or 60 minutes, and show:

- task ID with copy action;
- progress/status with `aria-live="polite"`;
- provider failure text;
- native `<video controls playsInline>` preview;
- download/open link using the exact completed result URL.

- [ ] **Step 4: Nest the sidebar items**

Replace the single Content Creation link with a visible parent label and two child links:

```ts
{ label: 'Content Post', href: '/create' }
{ label: 'Content Video', href: '/create/video' }
```

Ensure exact-path active styling so `/create/video` does not activate Content Post.

- [ ] **Step 5: Run static verification and commit Task 3**

Run: `npm run test:video && npx tsc --noEmit && npm run build`

Expected: tests pass, TypeScript exits 0, and Next.js production build exits 0 with `/create/video` and both API routes listed.

```bash
git add src/app/create/video/page.tsx src/components/Sidebar.tsx
git commit -m "feat: add content video workspace"
```

---

### Task 4: Configuration, Browser Check, and Production Deploy

**Files:**
- Modify: `.env.example`

**Interfaces:**
- Consumes: existing Vercel project and domain `https://radyalabs-dashboard-sosmed-planner.vercel.app`.
- Produces: configured production deployment with the secret held in Vercel environment variables.

- [ ] **Step 1: Document environment names without secrets**

Append:

```dotenv
# === AOTIAN VIDEO (server-only) ===
NEW_API_BASE_URL=https://aotianzz.xyz
NEW_API_TOKEN=your-new-api-token
```

- [ ] **Step 2: Run final local verification**

Run: `npm run test:video && npx tsc --noEmit && npm run build && git diff --check`

Expected: every command exits 0.

- [ ] **Step 3: Commit configuration**

```bash
git add .env.example
git commit -m "docs: add video API environment variables"
```

- [ ] **Step 4: Configure and deploy**

Confirm Vercel CLI authentication and link the repository to the existing project. Add `NEW_API_BASE_URL` and `NEW_API_TOKEN` to production without echoing the token, then run `vercel --prod`.

Expected: deployment succeeds and the production alias remains `https://radyalabs-dashboard-sosmed-planner.vercel.app`.

- [ ] **Step 5: Smoke-test the deployed feature**

Open `/create/video`; verify the sidebar nesting, all four modes, responsive layout, model selector, validation, disabled duplicate submission, and absence of browser console errors. Call only `GET /v1/models` for provider connectivity; do not click Generate because that creates a paid task.

- [ ] **Step 6: Record deployment commit**

Run: `git status --short && git log -5 --oneline`

Expected: clean worktree and feature/configuration commits visible.
