# ProPresenter-Lite — Implementation Plan

## Project Overview

- **Project name:** ProPresenter-Lite
- **Objective:** A frontend-only presentation app for live song lyrics (verse/chorus/bridge via keyboard shortcuts) and pre-converted slide-deck images (e.g. from PowerPoint), displayed on a separate audience screen controlled from an operator screen.
- **Architecture:** No backend, no database, no auth. Two routes in one static web app: `/control` (operator) and `/display` (audience/projector), synced in real time via `BroadcastChannel`.

## Requirements

### Functional
- Operator can type/paste song lyrics into labeled sections (Verse 1, Verse 2, Chorus, Bridge, etc.) during the session.
- Number keys and letter keys (e.g. `1`, `2`, `C`, `B`) switch the active section; the audience display updates instantly.
- Background behind the lyric text can be either a code-generated animation (Canvas/CSS) or a looping video file, selectable per song/slide.
- Operator can also load a set of pre-exported slide images (from a `.pptx`) and jump to any one via number-key shortcut or by clicking it in a thumbnail queue; clicking pushes it to the audience display.
- A "clear/black" control blanks the audience display.

### Non-Functional
- Runs entirely client-side; works from `localhost` or a double-clicked `index.html`.
- No persistence required — content is re-entered each session (acceptable by design).
- Dual-screen sync must work across two browser windows/tabs on the same machine.

### Out of Scope (v1)
- Saving/loading a song library across sessions (no `localStorage`/`IndexedDB`).
- Cross-device sync (no backend, no network sync).
- In-browser `.pptx` parsing/rendering — slides are supplied as pre-exported images (conversion is a one-off prep step done outside the running app).
- User accounts/auth, multi-operator collaboration.

### Assumptions
- Single operator, single machine, two display surfaces (laptop screen + projector/TV via a second browser window).
- Video backgrounds are provided as local files picked via file input (no upload/hosting pipeline).

---

## Phase 0 — Project Setup

**Goal:** Scaffold the app and prove the two-window sync mechanism works before building any real feature on top of it.

- Initialize a Vite + React project.
- Add client-side routing with two routes: `/control` and `/display`.
- Create a small shared `BroadcastChannel` utility (e.g. `channel.ts`) with `send(message)` / `onMessage(callback)`.
- `/control`: a button that sends `{ type: "ping" }`.
- `/display`: fullscreen black page that shows "PING RECEIVED" briefly when it gets the message.
- **Acceptance criteria:** Opening `/control` and `/display` in two separate windows, clicking the button on `/control` visibly updates `/display` in real time.

---

## Phase 1 — Song Data Entry & Keyboard-Driven Slide Switching

**Goal:** Operator can build a song's sections in memory and switch between them live, with the active section's text visible on `/control` (no background, no audience sync yet).

- Define an in-memory song model: a list of labeled sections (label, key binding, text body).
- Build a simple operator form/editor: add a section, set its label, set its key binding (default suggestions: `1`,`2`,`3` → verses, `C` → chorus, `B` → bridge), paste/type its text.
- Add a global keydown listener on `/control` that sets the "active section" based on the matching key binding.
- Render the active section's text on `/control` as a preview pane.
- **Acceptance criteria:** Typing 3 sections with distinct key bindings, pressing each key correctly switches the highlighted/previewed active section.

---

## Phase 2 — Audience Display Sync (Text Only)

**Goal:** The active section set in Phase 1 is pushed to `/display` and rendered fullscreen.

- On every active-section change in `/control`, broadcast `{ type: "showText", text }` via the Phase 0 channel.
- `/display` listens and renders the received text fullscreen, centered, large, legible font, on a plain dark background.
- Add a "Clear" button on `/control` that broadcasts `{ type: "clear" }`; `/display` goes blank/black on receipt.
- **Acceptance criteria:** Switching sections on `/control` updates `/display` within the same tick; Clear blanks the audience screen; reloading `/display` and re-pressing a key on `/control` still syncs correctly.

---

## Phase 3 — Code-Generated Animated Backgrounds

**Goal:** Add a selectable animated background layer (Canvas or CSS) behind the lyric text, with the text readable on top.

- Build 2–3 simple generative background components (e.g. gradient drift, particle field, moving shapes) using Canvas or CSS animations.
- Add a background-select control on `/control` (per song or per section — keep it per-song for simplicity).
- Broadcast the selected background identifier to `/display`; `/display` renders the matching background behind the text layer.
- Ensure text remains legible (e.g. subtle overlay/shadow) over all background options.
- **Acceptance criteria:** Selecting a background on `/control` updates `/display`'s background live; text stays readable on every option; switching sections does not interrupt/restart the background animation unnecessarily.

---

## Phase 4 — Video Backgrounds

**Goal:** Allow a local video file to be used as the background instead of a generated one, using the same swap mechanism as Phase 3.

- Add a file input on `/control` to pick a local video file; create an object URL for it.
- Note the object URL is only valid in the tab that created it — pass the actual File via a shared mechanism (e.g. re-pick on `/display` via the same file input, or use the File System Access API) **or** simplify to: operator picks the file once on `/display` itself, with `/control` only selecting "use video mode" and broadcasting that choice. (Pick the simpler path: file is selected directly on `/display`.)
- Render the video with `autoplay loop muted playsInline` behind the text layer when video mode is active.
- Add a background-mode toggle on `/control`: Generated vs Video, broadcast and respected by `/display`.
- **Acceptance criteria:** A locally chosen video loops silently behind the lyric text on `/display`; switching back to a generated background stops the video and resumes the Canvas/CSS animation.

---

## Phase 5 — Image Slide Deck Mode (Pre-Converted PPTX)

**Goal:** Operator can load a folder/set of slide images (pre-exported from `.pptx`), jump to any via number key, and click any upcoming slide in a thumbnail queue to push it to `/display`.

- Add a "Slides" mode alongside "Song" mode (simple tab/toggle on `/control`).
- Add a multi-file input to load a set of images; order them (by filename order is sufficient).
- Render a thumbnail strip/grid on `/control` showing all loaded slides, with the current one highlighted.
- Assign number-key shortcuts to the first 9–10 slides (or to whichever slide is focused/hovered, your call — default: sequential number keys for the first N slides, with next/previous arrow-key navigation for the rest).
- Clicking a thumbnail OR pressing its bound number key sets it active and broadcasts `{ type: "showImage", src }` to `/display`.
- `/display` renders the received image fullscreen (no background layer needed in this mode — the image is the whole slide).
- **Acceptance criteria:** Loading a set of exported slide images, clicking any thumbnail shows it fullscreen on `/display`; number-key shortcuts jump correctly; switching between Song mode and Slides mode cleanly swaps what `/display` is showing.

---

## Phase 6 — Polish & Manual QA Pass

**Goal:** Tie up loose ends and manually verify the whole flow works together; no new features.

- Confirm Clear/black works correctly in both Song mode and Slides mode.
- Confirm keyboard shortcuts don't fire while typing in a text input (e.g. ignore keydown when focus is inside an editable field).
- Confirm mode switching (Song ↔ Slides) and background switching (Generated ↔ Video) don't leave `/display` in a stale/inconsistent state after rapid toggling.
- Confirm reloading `/display` mid-session re-syncs correctly once any action is taken on `/control` again (acceptable: it stays blank until the next action, per the no-persistence design).
- **Acceptance criteria:** A full manual run-through — enter a song, switch sections, pick a background, switch to video, load a slide deck, click through slides, clear, switch back to song — produces no visual glitches or desync between windows.

---

## Dependency Order

Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6

Each phase only depends on the one(s) before it; no phase requires work from a later phase.
