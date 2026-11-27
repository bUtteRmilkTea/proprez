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

## Phase 7 — Keyboard Shortcut Overhaul (combos, auto-fill, navigation, mode/song switching)

**Goal:** Replace the single-character key-binding model with modifier-aware combos, auto-assign shortcuts for new song sections, and add global navigation shortcuts (arrow keys, mode switch, song switch).

- Add `src/lib/shortcuts.js`: a combo descriptor `{ key, ctrl, shift, alt, meta }`, `matchesCombo(event, combo)`, `comboLabel(combo)` (e.g. "Ctrl+Shift+1"), `nextAutoKey(existingCombos)` implementing the `1→2…→9→0→a→b…z` auto-increment, and a reserved-combos list that the key-recorder UI refuses to assign.
- Update the song section model (`src/features/song/useSongs.js`) and slide model (`src/features/slides/useSlides.js`) to store combo objects instead of single chars; call `nextAutoKey()` whenever a new section/slide is added, so it gets the next free shortcut automatically.
- Replace the `maxLength={1}` key input in `src/features/song/SongEditor.jsx` with a "press a combo" recorder control (captures one keydown with modifiers); reuse it wherever a shortcut is assigned (slides, later media items).
- Update the song keydown handler in `useSongs.js` and the slide keydown handler in `useSlides.js` to match via `matchesCombo` instead of a plain string compare.
- Add `src/features/shortcuts/useGlobalShortcuts.js`, mounted in `Control.jsx`: Ctrl+1/2/3 switches mode (Song/Slides/Media — Media lands in Phase 12), Ctrl+Left/Right cycles the open song, plain Left/Right navigates the active item (section/slide/media item) of whichever mode is currently active. Remove the slide-only arrow-key handling currently inlined in `useSlides.js` in favor of this shared hook.
- **Acceptance criteria:** Assigning a new section auto-gets the next free key in the `1-9,0,a-z` sequence; a shortcut can be recorded with Ctrl/Shift/Alt/Meta held; pressing a recorded combo (with its exact modifiers) switches to that section/slide; plain arrow keys navigate within the active mode; Ctrl+Left/Right switches the open song; Ctrl+1/2/3 switches mode.

---

## Phase 8 — Clear Confirmation

**Goal:** Prevent accidental blanking of the audience display mid-service.

- Add a small reusable `src/components/ConfirmDialog.jsx`.
- Wire it to the existing Clear button in `Control.jsx`: clicking Clear opens the dialog; only confirming triggers the existing `send({ type: "clear" })`.
- **Acceptance criteria:** Clicking Clear no longer blanks `/display` immediately; confirming does; cancelling leaves the current display untouched.

---

## Phase 9 — Font Size Picker

**Goal:** Let the operator control the lyric text size shown on `/display` instead of the hardcoded `4rem`.

- Add a `fontSize` control on `/control` (preset sizes or a range input), defaulting to the current `4rem`.
- Broadcast a new `setFontSize` message; `/display` applies it to the text-overlay style instead of the hardcoded value.
- **Acceptance criteria:** Changing the font size on `/control` updates the live text size on `/display` immediately, for both newly shown and already-visible text.

---

## Phase 10 — Background Themes

**Goal:** Give the generated backgrounds selectable color palettes (warm, cool, summer, forest, earth tone) instead of one fixed look.

- Add `src/features/background/themes.js` with named palettes: warm, cool, summer, forest, earth-tone (plus the current look preserved as the default).
- Thread a `theme` prop through `BackgroundLayer.jsx` into `GradientDrift.jsx`, `MovingShapes.jsx`, and `ParticleField.jsx`, replacing their hardcoded colors with the active palette.
- Add a theme picker (swatches) on `/control`; broadcast `setTheme`; `/display` applies it to the background layer.
- **Acceptance criteria:** Each theme visibly changes the generated background's palette on `/display` without interrupting the animation; text remains legible over every theme.

---

## Phase 11 — Video Background via Shared Blob Store (removes Display's file picker)

**Goal:** Move video-background file selection to `/control`, using a same-origin IndexedDB blob store so the file survives the cross-tab boundary that currently forces the picker to live on `/display`.

- Add `src/lib/mediaStore.js`: a minimal IndexedDB wrapper — `putBlob(id, blob)`, `getBlob(id)`, `deleteBlob(id)`.
- Remove the `<input type="file" accept="video/*">` from `src/pages/Display.jsx`.
- Add the file picker to `Control.jsx` next to the existing background-mode toggle: on selection, store the file via `mediaStore.putBlob`, then broadcast `setBackgroundMode` with a `videoId`.
- Update `VideoBackground.jsx`/`Display.jsx` to resolve `videoId` → `mediaStore.getBlob` → a locally created object URL whenever the id is (re)received, including after a `/display` reload.
- **Acceptance criteria:** Picking a video file on `/control` plays it as the background on `/display` in a separate tab; reloading `/display` and re-selecting video mode on `/control` still resolves and plays the same file.

---

## Phase 12 — Media Mode (Photos & Videos as Content)

**Goal:** Add a third top-level mode, alongside Song and Slides, for showing a photo or video as the main display content (not as a background).

- Add `src/features/media/useMedia.js` (modeled on `useSlides.js`): a list of `{ id, name, type: "photo" | "video" }` items, blobs kept in `mediaStore` (Phase 11), shortcut combos via the Phase 7 model, active-item state driven by the shared arrow-key navigation from Phase 7.
- Add `src/features/media/MediaPanel.jsx` (modeled on `SlidesPanel.jsx`): multi-file picker (`accept="image/*,video/*"`), thumbnail/name grid with shortcut badges.
- Extend the `mode` state in `Control.jsx` with `"media"`; wire the panel, enablement, and the Ctrl+3 shortcut from Phase 7.
- Add a `mode === "media"` render branch to the display rendering path: `<img>` for photos, `<video>` for videos, resolving the active item's blob from `mediaStore` into a local object URL.
- Add a `showMedia` broadcast message carrying the active media id.
- **Acceptance criteria:** Loading a mix of photos and videos, switching to Media mode, and selecting an item (via click or its shortcut) shows it fullscreen on `/display`; switching away and back to Media mode resumes correctly; video items autoplay/loop as expected.

---

## Phase 13 — Live Preview in Control

**Goal:** Show a scaled-down, accurate mirror of `/display`'s current output inside `/control`, covering background/theme, font size, and all three modes — not just raw text.

- Extract `/display`'s render tree into a presentational `src/features/display/DisplayView.jsx`, taking `{ mode, cleared, text, fontSize, theme, background, backgroundMode, slide, mediaItem, scale }` as props.
- Refactor `src/pages/Display.jsx` to a thin wrapper: fullscreen container, owns the `BroadcastChannel` subscription and `mediaStore` lookups, renders `DisplayView`.
- Add `src/features/display/ControlPreview.jsx`: a small, `pointer-events: none` box that independently subscribes to the same broadcast messages and renders `DisplayView` at a reduced scale; mount it in `Control.jsx`.
- **Acceptance criteria:** The Control preview always matches what's actually live on `/display` (background, theme, font size, cleared state, and whichever of Song/Slides/Media is active) through every feature added in Phases 7–12.

---

## Dependency Order

Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10 → Phase 11 → Phase 12 → Phase 13

Each phase only depends on the one(s) before it; no phase requires work from a later phase. Phase 13 benefits from Phases 9/10/12 already existing (more states to mirror) but is listed last since it depends on all of them being present to verify against.