# ProPresenter-Lite — Feedback Batch Plan (Phases 7–13)

## Context

This plan implements a batch of feedback items on top of the existing app (see `plan/plan.md`, Phases 0–6, already built). It extends rather than replaces that plan — phase numbering continues from 6, and the same per-phase branch/commit/PR workflow in `plan/prompt.md` applies, with one change: **the base branch for this batch is `feat/pptx-import`** (the current branch at the time this plan was written), not `development`.

Requested items covered:
- Font size picker
- Background theme presets (warm, cool, summer, forest, earth tone)
- Remove the "choose file" picker from the Display page
- Confirmation popup on Clear
- Auto-fill section shortcuts (1→9→0→a→z)
- Add photo/video via file picker
- Live preview on Control showing the full display output (background + content), not just text
- Arrow-key left/right navigation
- Shortcut to switch between Song / Slides / Media(photo-video) modes
- Shortcut to switch between songs
- Shortcuts support modifier combinations (Shift/Ctrl/Alt — see Fn note below)

## Scope note relative to `plan/plan.md`

The original plan's "Out of Scope (v1)" explicitly excluded `localStorage`/`IndexedDB`-based persistence across sessions. Phases 11–12 below introduce an IndexedDB-backed blob store, but only as a **same-origin, cross-tab transport** for files picked during the current session — replacing object URLs (which can't cross tabs, the reason the video file picker currently lives on `/display` instead of `/control`). Nothing is meant to survive a full browser restart; that remains out of scope.

## Resolved decisions (locked in, no need to re-ask in later phases)

- Video-background and Media-mode files move from Control to Display via the new blob store, never via `URL.createObjectURL()` shared across tabs.
- Photo/video is a new, separate top-level **Media** mode, alongside Song and Slides (not folded into the existing Slides deck).
- The Control-side live preview mirrors Display exactly, by subscribing to the same `BroadcastChannel` messages and rendering through the same presentational component, not a separately maintained approximation.
- Keyboard combos support Ctrl/Shift/Alt/Meta(Cmd). **The "Fn" key is excluded** — it's handled at the OS/keyboard-firmware level on most devices and isn't reliably exposed to `KeyboardEvent` in browsers, so it can't be captured as a modifier.

## Data shape changes

- Song section (`src/features/song/useSongs.js`): `{ id, label, key, text }` → `{ id, label, shortcut, text }`, where `shortcut` is a combo descriptor `{ key, ctrl, shift, alt, meta }` (see `src/lib/shortcuts.js`, Phase 7). The bare single-character `key` field is retired.
- Slide / media item shortcuts (Phases 7/12) use the same combo descriptor shape, via the same recorder UI component.
- New: `src/features/media/useMedia.js` item shape (Phase 12): `{ id, name, type: "photo" | "video", shortcut }`; the actual file bytes live in the blob store keyed by `id`, never in this state.

## Broadcast message contracts added

Extends the existing `showText` / `clear` / `setBackground` / `setBackgroundMode` / `setMode` / `showImage` set in `src/lib/channel.js`:

| Message | Payload | Phase | Consumed by |
|---|---|---|---|
| `setFontSize` | `{ fontSize: number }` (same unit as the current hardcoded `4rem`) | 9 | `DisplayView.jsx` |
| `setTheme` | `{ theme: "warm" \| "cool" \| "summer" \| "forest" \| "earth-tone" \| default }` | 10 | `BackgroundLayer.jsx` via `DisplayView.jsx` |
| `setBackgroundMode` (extended) | adds optional `videoId` (resolvable via the blob store) when `mode: "video"` | 11 | `VideoBackground.jsx` |
| `setMode` (extended) | `mode` gains the value `"media"` alongside existing `"song"` \| `"slides"` | 12 | `Display.jsx` / `ControlPreview.jsx` |
| `showMedia` | `{ mediaId }` (active Media-mode item id) | 12 | `DisplayView.jsx` |

No existing message's payload shape is broken; all additions are new message types or new optional fields.

## Reserved shortcut combos (Phase 7)

Enforced by `src/lib/shortcuts.js`'s `isReservedCombo` and the shortcut-recorder UI — a user cannot assign these to a section/slide/media item, since they're claimed by the global navigation hook:

| Combo | Action |
|---|---|
| `Ctrl+1` | Switch to Song mode |
| `Ctrl+2` | Switch to Slides mode |
| `Ctrl+3` | Switch to Media mode |
| `Ctrl+Left` / `Ctrl+Right` | Previous / next song |
| `Left` / `Right` (no modifier) | Previous / next item in the active mode (section / slide / media item) |

---

## Phase 7 — Keyboard Shortcut Overhaul (combos, auto-fill, navigation, mode/song switching)

**Goal:** Replace the single-character key-binding model with modifier-aware combos, auto-assign shortcuts for new song sections, and add global navigation shortcuts (arrow keys, mode switch, song switch).

- Add `src/lib/shortcuts.js`: combo descriptor `{ key, ctrl, shift, alt, meta }`, `matchesCombo(event, combo)`, `comboLabel(combo)` (e.g. "Ctrl+Shift+1"), `nextAutoKey(existingCombos)` implementing the `1→2…→9→0→a→b…z` auto-increment, `isReservedCombo(combo)` checked against the table above.
- Update the song section model (`src/features/song/useSongs.js`) to store `shortcut` combo objects; `addSection` calls `nextAutoKey()` so a new section gets the next free plain key automatically.
- Replace the `maxLength={1}` key input in `src/features/song/SongEditor.jsx` with a "press a combo" recorder control (new `src/components/ShortcutRecorder.jsx`, captures one keydown with modifiers, rejects reserved combos); reused wherever a shortcut is assigned (later: media items in Phase 12).
- Update the song keydown handler in `useSongs.js` to match via `matchesCombo` instead of a plain string compare.
- Add `src/features/shortcuts/useGlobalShortcuts.js`, mounted in `Control.jsx`: Ctrl+1/2/3 switches mode (Song/Slides/Media — Media's panel lands in Phase 12, but the shortcut is wired now), Ctrl+Left/Right cycles the open song, plain Left/Right navigates the active item of whichever mode is currently active (delegates to a mode-specific `onNavigate(direction)` callback supplied by `Control.jsx`).
- Move the slide deck's existing arrow-key handling out of `useSlides.js` (keep its digit-key handling, `1-9,0 → slide index`, in place) and into the new `onNavigate` path, so there's one source of truth for arrow navigation.
- **Acceptance criteria:** Assigning a new section auto-gets the next free key in the `1-9,0,a-z` sequence; a shortcut can be recorded with Ctrl/Shift/Alt/Meta held; pressing a recorded combo (with its exact modifiers) switches to that section; plain arrow keys navigate within the active mode (song sections or slides); Ctrl+Left/Right switches the open song; Ctrl+1/2 switches mode (Ctrl+3 is a no-op until Phase 12).

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
- Broadcast the new `setFontSize` message; `/display` applies it to the text-overlay style instead of the hardcoded value.
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

- Add `src/lib/mediaStore.js`: minimal IndexedDB wrapper — `putBlob(id, blob)`, `getBlob(id)`, `deleteBlob(id)`.
- Remove the `<input type="file" accept="video/*">` from `src/pages/Display.jsx`.
- Add the file picker to `Control.jsx` next to the existing background-mode toggle: on selection, store the file via `mediaStore.putBlob`, then broadcast `setBackgroundMode` with a `videoId`.
- Update `VideoBackground.jsx`/`Display.jsx` to resolve `videoId` → `mediaStore.getBlob` → a locally created object URL whenever the id is (re)received, including after a `/display` reload.
- **Acceptance criteria:** Picking a video file on `/control` plays it as the background on `/display` in a separate tab; reloading `/display` and re-selecting video mode on `/control` still resolves and plays the same file.

---

## Phase 12 — Media Mode (Photos & Videos as Content)

**Goal:** Add a third top-level mode, alongside Song and Slides, for showing a photo or video as the main display content (not as a background).

- Add `src/features/media/useMedia.js` (modeled on `useSlides.js`): list of `{ id, name, type: "photo" | "video", shortcut }` items, blobs kept in `mediaStore` (Phase 11), shortcuts via the Phase 7 combo model and recorder, active-item navigation driven by the shared arrow-key handler from Phase 7.
- Add `src/features/media/MediaPanel.jsx` (modeled on `SlidesPanel.jsx`): multi-file picker (`accept="image/*,video/*"`), thumbnail/name grid with shortcut badges.
- Extend the `mode` state in `Control.jsx` with `"media"`; wire the panel, enablement, and the Ctrl+3 shortcut already reserved in Phase 7.
- Add a `mode === "media"` render branch to the display rendering path: `<img>` for photos, `<video>` for videos, resolving the active item's blob from `mediaStore` into a local object URL.
- Add the `showMedia` broadcast message carrying the active media id.
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

Phase 7 → Phase 8 → Phase 9 → Phase 10 → Phase 11 → Phase 12 → Phase 13

Each phase only depends on the one(s) before it (and transitively, on Phases 0–6 in `plan/plan.md`, already built). Phase 13 benefits from Phases 9/10/12 already existing (more states to mirror) but is listed last mainly to have everything in place to verify against.

## Phase 14 (post-review fixes) — Animated default background, video sound, shortcuts help

**Context:** after Phases 7-13 shipped, the user reported three issues: the background looked static by default (themes only recolor an animation you had to separately opt into, and the default was "None"); background/media videos were hardcoded `muted`; and there was no on-screen reference for the fixed global shortcuts.

- `src/features/background/backgrounds.js`: `DEFAULT_BACKGROUND` changed from `"none"` to `"gradient"`, so a theme is animated out of the box. `Control.jsx`'s `handleThemeChange` also auto-switches `background` from `"none"` to `"gradient"` if the operator had explicitly picked "None" before choosing a theme.
- `MediaContent.jsx` (Media mode only - background videos stay silent by design): removed the hardcoded `muted` attribute. Autoplay-with-sound is blocked by browsers without a prior user gesture on that page, so it now attempts an unmuted `play()`, falls back to muted (keeping the loop working) if blocked, and shows a small "Click to enable sound" button that unmutes on click (the click itself satisfies the browser's gesture requirement). `VideoBackground.jsx` keeps `muted` as before.
- New `src/lib/shortcuts.js` export `GLOBAL_SHORTCUTS` (the fixed combos from the reserved-combos table, with human descriptions) and `src/components/ShortcutsHelp.jsx`, a collapsible `<details>` list mounted in `Control.jsx`. Deliberately excludes per-section/slide/media-item shortcuts (those are user-assigned and already shown inline next to each item); includes the Slides mode's fixed `1-9,0` digit-key convention as a plain row since it isn't a combo descriptor.
- **Acceptance criteria:** opening `/control` fresh shows an animated gradient background immediately; picking any theme keeps it animated; a Media-mode video plays with sound when the browser allows it, otherwise plays muted with a working "Click to enable sound" button; a background video stays silent as before; Control has a visible, collapsible shortcuts reference listing only the global/fixed shortcuts.

---

## Verification

No test suite exists in this repo (`oxlint` is the only configured check). Per phase:
- `pnpm lint`.
- `pnpm dev`, open `/control` and `/display` in two separate browser tabs in the same browser (the `BroadcastChannel`/IndexedDB constraint requires same-origin, same-browser).
- Manually exercise that phase's acceptance criteria above.
