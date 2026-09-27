# Video Caption Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep caption creation below video Direction at all times and offer a one-click, prompt-based caption action after video completion.

**Architecture:** Reuse the existing caption state, `/api/generate-caption`, and `buildVideoCaptionBrief`. The persistent form uses the current draft; the completed-video call-to-action passes the task’s saved prompt and preset, with current-form fallback for legacy tasks.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, Node test runner

## Global Constraints

- Do not analyze or upload generated video for captioning.
- Add no dependency and no new API route.
- A caption requires either a video prompt or caption-direction text.

---

### Task 1: Reposition and Decouple Caption Generation

**Files:**
- Modify: `src/lib/video.test.mjs`
- Modify: `src/lib/video.ts`
- Modify: `src/app/create/video/page.tsx`

**Interfaces:**
- Consumes: `buildVideoCaptionBrief(prompt, preset, direction)` and existing `POST /api/generate-caption`.
- Produces: an always-visible caption form and a completed-video caption call-to-action using saved task context.

- [x] **Step 1: Write the failing legacy-context test**

Add to `src/lib/video.test.mjs`:

```js
test('builds a caption brief from manual direction when no video prompt was saved', () => {
  const brief = buildVideoCaptionBrief('', 'talking_head', 'Caption santai dengan CTA');
  assert.doesNotMatch(brief, /Konten video:\s*$/m);
  assert.match(brief, /Talking-head.*Caption santai dengan CTA/s);
});
```

- [x] **Step 2: Run the test and verify red**

Run: `npm run test:video`

Expected: FAIL because the current helper emits an empty `Konten video:` line.

- [x] **Step 3: Make the helper omit empty prompt content**

Update `buildVideoCaptionBrief` in `src/lib/video.ts`:

```ts
const content = prompt.trim();
const captionDirection = direction.trim();
return [
  content && `Konten video: ${content}`,
  `Gaya video: ${VIDEO_PRESETS[preset]}`,
  captionDirection && `Arahan caption: ${captionDirection}`,
].filter(Boolean).join('\n');
```

- [x] **Step 4: Move the full form and reuse one handler**

In `src/app/create/video/page.tsx`:

- add `captionSectionRef` and `captionDirectionRef`;
- make `handleGenerateCaption(sourcePrompt = prompt, sourcePreset = preset): Promise<boolean>` accept current or task context and report whether generation succeeded;
- return `false` with a warning, scroll the caption section into view, and focus the caption-direction field when both source prompt and caption direction are empty;
- enable the persistent button with `Boolean(prompt.trim() || captionDirection.trim())`;
- render the full caption form immediately after the Direction card;
- replace the existing output-side form with a compact prompt and button whose click calls `handleGenerateCaption(task.prompt || prompt, task.preset || preset)`, then scrolls to `captionSectionRef` when it returns `true`;
- keep the editable result and Copy action only in the persistent form.

- [x] **Step 5: Verify green and production compatibility**

Run:

```bash
npm run test:video
npx tsc --noEmit
npm run build
git diff --check
```

Expected: all tests pass, TypeScript reports no errors, build succeeds, and diff check is empty.

- [x] **Step 6: Smoke-test without paid generation**

Open `/create/video` locally and verify the caption form is directly below Direction. Confirm the duration options remain 5–8 seconds and browser console has no errors. Do not click the paid video-generation action.

- [x] **Step 7: Commit and push**

```bash
git add src/lib/video.test.mjs src/lib/video.ts src/app/create/video/page.tsx
git commit -m "fix: make video captions always available"
git push
```
