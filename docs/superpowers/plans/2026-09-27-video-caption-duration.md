# Short Video Duration and Caption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Limit generated videos to 5–8 seconds and offer an optional editable caption generated from the video prompt after completion.

**Architecture:** Extend the existing pure video helper with a duration allowlist and caption-brief builder, covered by the native Node test. Reuse the existing `/api/generate-caption` route from the existing Content Video client page; persist only the prompt metadata required after refresh.

**Tech Stack:** Next.js 15, React 19, TypeScript, native Node test runner, existing Gemini caption API.

## Global Constraints

- Accept only string durations `5`, `6`, `7`, or `8`; default to `5`.
- Keep caption generation optional and unavailable until video completion.
- Derive the caption from the original prompt/preset plus optional user direction; do not upload the result video to Gemini.
- Reuse `/api/generate-caption`; add no endpoint or dependency.
- Preserve existing API-key and face-consent protections.

---

### Task 1: Duration and Caption-Brief Contract

**Files:**
- Modify: `src/lib/video.test.mjs`
- Modify: `src/lib/video.ts`

**Interfaces:**
- Produces: `VIDEO_DURATIONS` and `buildVideoCaptionBrief(prompt, preset, direction)`.
- Changes: `validateVideoRequest` accepts exactly 5–8 seconds.

- [ ] **Step 1: Write failing contract tests**

Add tests that loop over `['5', '6', '7', '8']`, assert each request validates, assert `4` and `9` fail, and assert the brief includes the source prompt, human-readable preset direction, and optional caption direction:

```js
for (const seconds of ['5', '6', '7', '8']) {
  assert.equal(validateVideoRequest({ ...base, mode: 'prompt', seconds }), null);
}
assert.match(validateVideoRequest({ ...base, mode: 'prompt', seconds: '9' }) ?? '', /5–8 detik/i);
assert.match(buildVideoCaptionBrief('Demo produk', 'product_story', 'Tambahkan CTA'), /Demo produk.*Product-story.*Tambahkan CTA/s);
```

- [ ] **Step 2: Run red**

Run: `npm run test:video`

Expected: FAIL because durations above 5 are rejected and `buildVideoCaptionBrief` is missing.

- [ ] **Step 3: Implement the minimum contract**

Export:

```ts
export const VIDEO_DURATIONS = ['5', '6', '7', '8'] as const;

export function buildVideoCaptionBrief(
  prompt: string,
  preset: keyof typeof VIDEO_PRESETS,
  direction = '',
) {
  return [`Konten video: ${prompt.trim()}`, `Gaya video: ${VIDEO_PRESETS[preset]}`, direction.trim() && `Arahan caption: ${direction.trim()}`]
    .filter(Boolean)
    .join('\n');
}
```

Use `VIDEO_DURATIONS.includes(...)` in `validateVideoRequest` and return `Durasi video harus 5–8 detik.` outside the allowlist.

- [ ] **Step 4: Run green and commit**

Run: `npm run test:video && npx tsc --noEmit`

Expected: all tests pass and TypeScript exits 0.

```bash
git add src/lib/video.ts src/lib/video.test.mjs
git commit -m "feat: limit AI video duration"
```

---

### Task 2: Optional Caption Panel

**Files:**
- Modify: `src/app/create/video/page.tsx`

**Interfaces:**
- Consumes: `VIDEO_DURATIONS`, `buildVideoCaptionBrief`, existing `BRANDS`, and `POST /api/generate-caption`.
- Produces: duration selector, persisted prompt metadata, and post-completion caption UI.

- [ ] **Step 1: Add duration and task metadata state**

Add `seconds` state defaulting to `VIDEO_DURATIONS[0]`; use it in `VideoRequest`. Extend `VideoTask` with `prompt` and `preset`, store them when the task is created, and retain them in local storage through the existing task persistence effect.

- [ ] **Step 2: Replace the disabled duration control**

Render a normal select over `VIDEO_DURATIONS` with labels `5 sec` through `8 sec`. Keep a helper line stating that a model may enforce a shorter fixed duration.

- [ ] **Step 3: Add the optional completed-video caption panel**

Below the completed preview, render:

- “Mau sekalian dibuatkan caption agar siap diposting?”
- brand select using `Object.values(BRANDS)`;
- platform select for Instagram/LinkedIn;
- optional direction textarea;
- Generate Caption button;
- editable caption textarea and Copy action.

Generate with:

```ts
const brief = buildVideoCaptionBrief(task.prompt, task.preset, captionDirection);
await fetch('/api/generate-caption', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ brief, brandSlug: captionBrand, platform: captionPlatform }),
});
```

Disable only while the caption request is in progress; show existing toast messages on success/failure.

- [ ] **Step 4: Verify production behavior**

Run: `npm run test:video && npx tsc --noEmit && npm run build && git diff --check`

Expected: tests, typecheck, build, and whitespace check exit 0; `/create/video` remains statically generated.

- [ ] **Step 5: Browser smoke-test without paid generation**

Open `/create/video`, confirm durations 5–8, all original modes, responsive layout, and no console errors. Do not click Generate Video because it creates a paid task. The caption panel is covered by its tested brief builder and build/type checks until a completed task exists.

- [ ] **Step 6: Commit and push**

```bash
git add src/app/create/video/page.tsx
git commit -m "feat: add companion video captions"
git push -u origin codex/video-caption-duration
```
