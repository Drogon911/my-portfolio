# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

> This project runs Next.js 16 with React 19 — APIs and conventions differ from earlier versions. Check `node_modules/next/dist/docs/` before writing code.

## Architecture

**Party** — a music streaming web app (Spotify-style) built with Next.js App Router (TypeScript + Tailwind CSS v4).

### Route groups

- `(main)/` — the main shell with a fixed left sidebar (`app/(main)/layout.tsx`) and a persistent `MiniPlayer` at the bottom. Routes: `/` (home), `/albums`, `/album/[id]`, `/search`, `/favorites`, `/playlists`, `/playlist/[id]`.
- `(player)/` — a fullscreen player view at `/player/[id]` that renders outside the sidebar layout. Used for immersive mobile-style playback.

### Global audio state — `PlayerContext`

`app/contexts/PlayerContext.tsx` owns the single `HTMLAudio` element (created via `new Audio()` in a `useEffect`, not a DOM `<audio>` tag). It exposes `playTrack(track, playlist?)`, `togglePlay`, `nextTrack`, `prevTrack`, `seekTo`, `setVolume`, `toggleMute` via `usePlayer()`.

Key implementation details:
- Progress is animated at 60 fps using `requestAnimationFrame` (not `timeupdate` events) to stay smooth.
- Volume and mute state are persisted to `localStorage` (`player_volume`, `player_muted`).
- Queue is stored in both React state and a `ref` (`queueRef`) to avoid stale closures in audio event handlers.

### Data

All music data lives in `app/data/musicLibrary.ts` as a static `musicLibrary: Album[]` array. There is no backend or API — adding a track means editing this file and placing the `.mp3` under `public/albums/album-N/`.

Track `id` values are not sequential across albums (album 1: 1–6, album 2: 101–111, album 3: 201–213, etc.) — this is intentional to keep IDs globally unique.

### Key components

- `MiniPlayer` — fixed bottom bar, only renders when `currentTrack !== null`. Has a custom drag-to-seek progress bar and a volume slider (desktop only).
- `TrackRow` — reusable row used in album and playlist pages. Accepts a `variant` prop.
- `PlayButton` — compact play/pause toggle, used inside search results and track lists.
- `GlassPage` — a wrapper that applies the frosted-glass card style used across main pages.

### Search

`/search` uses [Fuse.js](https://fusejs.io/) for client-side fuzzy search across title, artist, and album title fields. The `fuse` instance is created once at module level (not inside a component) against a flat `allTracks` array derived from `musicLibrary`.

### Styling

Tailwind CSS v4 with `@tailwindcss/postcss`. The app uses a pink (`#FDF2F8` background, `pink-600` accent) colour palette throughout. Animations use Framer Motion (`framer-motion`).

> `app/(main)/albums/page.tsx` has its own local `albums` array that only contains 2 entries — it is **not** sourced from `musicLibrary`. If you add albums to `musicLibrary`, also update this local array.
