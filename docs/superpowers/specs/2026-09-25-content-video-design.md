# Content Video Design

## Goal

Add a **Content Video** submenu under **Content Creation** where users can create an AI video from one of four inputs, monitor the asynchronous generation task, preview the result, and download it.

The first release is a hybrid AI generator, not a full timeline editor. For an uploaded clip, the clip is a generation reference; the app does not promise deterministic cutting, transcription, or frame-accurate face tracking.

## Navigation and Page

- Keep the existing `/create` page as **Content Post**.
- Add `/create/video` as **Content Video**.
- Show both items nested below **Content Creation** in the sidebar.
- Match the existing Radya Labs color tokens and component styling.
- Use a two-column desktop layout and a single-column mobile layout:
  - left: input and creative controls;
  - right: generation status, task ID, preview, and download.

## Input Modes

The user chooses exactly one mode:

1. **Prompt Only** — prompt without reference media.
2. **Face Reference** — prompt plus one JPG, PNG, or WebP portrait.
3. **Poster Reference** — prompt plus one JPG, PNG, or WebP design.
4. **Video Reference** — prompt plus one MP4, MOV, or WebM clip.

Changing mode clears an incompatible selected file. Face Reference requires the user to confirm they own or have permission to use the face and are not impersonating someone without consent.

## Creative Controls

- Model selector populated from the six models currently available to the supplied account:
  - `wan-3.0-720p`
  - `wan-3.0-1080p`
  - `grok-imagine-video`
  - `grok-imagine-video-1.5`
  - `sd4-seedance2.0mini-720p`
  - `mg-seedance-2.0-720p`
- Aspect ratio: 9:16, 16:9, or 1:1; default 9:16.
- Duration: 5 seconds by default. The UI explains that the selected model may enforce its own duration.
- Viral style preset:
  - Talking Head Viral
  - Product Story
  - UGC Review
  - Cinematic Promo
- Optional toggles that enrich the submitted prompt rather than claim deterministic post-production:
  - strong opening hook;
  - bold social captions;
  - dynamic camera movement;
  - keep subject centered.

One Generate click creates one billable provider task. Multiple variants and automatic multi-clip creation are intentionally excluded to avoid surprise charges.

## API and Data Flow

1. Reference files upload directly from the browser to the existing public Supabase `social-media` bucket using a short-lived signed upload token created by a server route. This avoids routing large video bodies through Vercel Functions.
2. `POST /api/generate-video` validates the prompt, model allowlist, mode, media URL, duration, and size, then calls `POST https://aotianzz.xyz/v1/videos` with the API token held only in server environment variables.
3. Prompt/image modes send the uploaded image URL through `images`; video mode sends it through `reference_videos`.
4. The browser stores the returned full task ID in local storage and polls `GET /api/generate-video?id=...` every seven seconds.
5. The server route proxies `GET https://aotianzz.xyz/v1/videos/{id}`. Polling stops on completion, failure, or after 60 minutes. A timeout preserves the task ID so the user can resume checking without creating another paid task.
6. A completed response supplies the provider's public result URL directly to the native video player and download link.

Required server variables:

- `NEW_API_BASE_URL=https://aotianzz.xyz`
- `NEW_API_TOKEN` containing the supplied key
- existing Supabase URL and service-role variables

The API token must never be returned to the browser, written into source code, or logged.

## Validation and Errors

- Prompt is required and length-limited.
- Reference media is required for modes 2–4.
- Image types: JPEG, PNG, WebP; maximum 10 MB.
- Video types: MP4, QuickTime, WebM; maximum 200 MB.
- Provider errors are normalized into an Indonesian user-facing message while retaining the task ID.
- Unknown processing states remain pending rather than being treated as success.
- Generate is disabled during file upload or task creation to prevent duplicate billing.
- No automatic retry creates a second task. Transient polling failures retry with backoff.

## Safety and Privacy

- Face uploads require explicit consent confirmation.
- The page warns users not to upload confidential media because references must remain reachable by the video provider during generation.
- Reference URLs and task IDs are not printed to server logs.
- Uploaded media uses randomized storage paths and validated MIME types.

## Verification

- Add one small test for request validation and provider payload mapping across all four modes.
- Run lint/type checks and the production build.
- Verify responsive layout, keyboard focus, labeled inputs, status announcements, preview playback, and download behavior in the browser.
- Validate the API connection with `GET /v1/models`, which is non-billable.
- Do not create a paid video generation task without separate confirmation because one Generate request can incur provider charges and may take 10–25 minutes or longer.
- Deploy to the linked Vercel project, configure server environment variables, and smoke-test the deployed page without submitting a paid generation task.

## Deliberate Exclusions

- No multi-track editor, deterministic scene detection, automatic transcript generation, burned-in subtitles, or FFmpeg processing.
- No generation history database in this release; local storage retains only the latest task needed for recovery.
- No batch generation or five-clip mode.

These features should be added only when a real editing pipeline and its extra storage, queueing, processing cost, and user controls are explicitly requested.
