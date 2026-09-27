# Video Caption Flow Design

## Goal

Make caption generation available at any time from the video Direction area while keeping the post-generation prompt close to the completed video.

## Interface

- Move the complete caption form below the video Direction card.
- Keep brand, platform, optional caption direction, generate, editable result, and copy controls there.
- Enable caption generation when either the current video prompt or the optional caption direction contains text.
- After a video completes, show only a compact “Ingin sekalian dibuatkan caption?” prompt below the video result.
- Its action generates a caption through the same caption form and scrolls the user to the result.

## Caption Context

- Manual caption generation uses the current video prompt, selected preset, and optional caption direction.
- The completed-video action prefers the prompt and preset saved with that task, so the caption remains related to the generated video even if the form has since changed.
- Older tasks without saved prompt metadata fall back to the current video prompt or the optional caption direction.
- Reuse the existing `/api/generate-caption` endpoint. Do not analyze or upload the generated video for captioning.

## State and Errors

- One caption loading state prevents duplicate requests.
- API errors continue to use the existing toast pattern.
- A completed-video action without any usable text context moves focus to the caption form so the user can add a short direction instead of forcing a new video generation.

## Verification

- Unit-test caption-context selection for current drafts, completed tasks, and legacy tasks.
- Run the existing video tests, TypeScript check, and production build.
- Smoke-test that the caption form is below Direction and that the completed-video prompt no longer contains a duplicate form.
