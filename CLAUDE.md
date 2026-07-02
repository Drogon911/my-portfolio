# CLAUDE.md

Этот файл содержит инструкции для Claude Code при работе с репозиторием.

## Критические правила

**НИКОГДА не делать `git checkout --`, `git reset --hard` или любой другой деструктивный git-откат без явного запроса пользователя.** Если пользователь говорит «откати», уточнить что именно — конкретный файл, коммит или всё. Молча откатывать всё — запрещено.

## Команды

```bash
npm run dev      # Запустить dev-сервер на localhost:3000
npm run build    # Продакшн-сборка
npm run lint     # Запустить ESLint
```

> Проект работает на Next.js 16 с React 19 — API и соглашения отличаются от более ранних версий. Перед написанием кода сверяйся с `node_modules/next/dist/docs/`.

## Архитектура

**Party** — музыкальный стриминг (в стиле Spotify), построенный на Next.js App Router (TypeScript + Tailwind CSS v4).

### Группы маршрутов

- `(main)/` — основная оболочка с фиксированным левым сайдбаром (`app/(main)/layout.tsx`) и постоянным `MiniPlayer` внизу. Маршруты: `/` (главная), `/albums`, `/album/[id]`, `/search`, `/favorites`, `/playlists`, `/playlist/[id]`.
- `(player)/` — полноэкранный плеер по адресу `/player/[id]`, рендерится вне лейаута с сайдбаром. Используется для иммерсивного воспроизведения в мобильном стиле.

### Глобальное аудио-состояние — `PlayerContext`

`app/contexts/PlayerContext.tsx` владеет единственным элементом `HTMLAudioElement` (создаётся через `new Audio()` в `useEffect`, а не как DOM-тег `<audio>`).

Контекст разделён на два хука ради производительности:
- `usePlayer()` — `currentTrack`, `isPlaying`, `duration`, громкость, управление (`playTrack`, `togglePlay`, `nextTrack`, `prevTrack`, `seekTo`, `setVolume`, `toggleMute`). Меняется редко, значение мемоизировано через `useMemo`.
- `usePlayerProgress()` — только `progress: number`. Обновляется 60 раз/сек через `requestAnimationFrame`. **Использовать только в полосках прогресса** — иначе весь компонент будет перерисовываться на каждом кадре.

Ключевые детали реализации:
- Прогресс анимируется на 60 fps через `requestAnimationFrame` (не через события `timeupdate`) для плавности.
- Громкость и mute сохраняются в `localStorage` (`player_volume`, `player_muted`).
- Очередь хранится одновременно в React-состоянии и в `ref` (`queueRef`), чтобы избежать устаревших замыканий в обработчиках аудио-событий.

### Данные

Каталог хранится в **Supabase** (PostgreSQL) и читается через слой `app/lib/db/catalog.ts` (`getAlbums` / `getAlbum` / `getTrack` / `getAllTracks`, обёрнуты в React `cache()`). Слой возвращает те же формы `Album` / `Track`, что и раньше — типы вынесены в `app/lib/db/types.ts`.

`app/data/musicLibrary.ts` больше **не** источник данных для UI — он остался только сид-источником для `scripts/generate-seed-sql.mjs`. `.mp3` и обложки пока лежат в `public/albums/album-N/` (перенос в Supabase Storage — на будущее).

**`legacy_id`** — старый числовой id трека/релиза из `musicLibrary` (треки: альбом 1 → 1–6, альбом 2 → 101–111 и т.д.; намеренно не последовательны). В БД это отдельная колонка, и слой отдаёт его как публичный `id`, поэтому маршруты `/album/[id]`, `/player/[id]` не менялись при переходе на БД. Внутренний `tracks.id` (bigint identity) используется только во внутренних связях (напр. `favorite_tracks`).

Страницы каталога устроены как **server-компонент** (грузит данные через слой) + клиентский `*View`/`*Content` (UI): `album/[id]` → `AlbumView`, `playlist/[id]` → `PlaylistView`, `albums` → `AlbumsCarousel`, `search` → `SearchContent`.

### Ключевые компоненты

- `MiniPlayer` — фиксированная нижняя панель, рендерится только когда `currentTrack !== null`. Имеет кастомный прогресс-бар с перетаскиванием и слайдер громкости (только десктоп).
- `TrackRow` — переиспользуемая строка трека для страниц альбома и плейлиста. Принимает проп `variant`.
- `PlayButton` — компактный переключатель play/pause, используется в результатах поиска и списках треков.
- `GlassPage` — обёртка с frosted-glass стилем для основных страниц. Серверный компонент (без `"use client"`). Тень задана через `.glass-surface` в `globals.css`.
- `VolumeIcon` — общий SVG-компонент иконки громкости для состояний (`off` / `low` / `high`). Принимает проп `className`. Используется в `MiniPlayer` и `player/[id]`.

### Общие утилиты

- `app/utils/formatTime.ts` — форматирует секунды в строку `м:сс`. Используется в `MiniPlayer` и `player/[id]`.

### Поиск

`/search` использует [Fuse.js](https://fusejs.io/) для клиентского нечёткого поиска по полям title, artist и название альбома. Server-страница грузит плоский `allTracks` через `getAllTracks()` и передаёт в клиентский `SearchContent`, где `fuse` создаётся через `useMemo([allTracks])` (стабильная ссылка — `React.memo` у `PlayButton` не ломается). Очередь воспроизведения из поиска = текущие результаты.

### Производительность

Все решения продиктованы реальным профилированием на мобиле — не преждевременная оптимизация.

**Контекст плеера разделён на два хука** (`usePlayer` / `usePlayerProgress`), чтобы 60fps-прогресс не перерисовывал весь дерево компонентов. `usePlayerProgress()` использовать **только** в полосках прогресса.

**`backdrop-blur` намеренно убран** везде, кроме `MiniPlayer` и кнопок навигации на `/albums` — тяжёл для мобильного GPU, бессмысленен над сплошным фоном.

**CSS `filter: blur()` в рантайме — запрещён для фонов.** Вместо этого используем предрендеренные размытые обложки:
- Скрипт: `node scripts/generate-blurred-covers.mjs` (sharp, устанавливается один раз)
- Генерирует `cover-blur.jpg` (64×64px) рядом с каждой обложкой альбома в `public/albums/album-N/`
- При добавлении нового альбома — запустить скрипт повторно
- Почему: CSS `blur-3xl` на полном экране ≈ 64 млн операций/кадр, предрендер ≈ 330 тыс (в ~200 раз дешевле)

**`React.memo`** на `TrackRow` и `PlayButton` — при смене трека перерисовывается только затронутая строка. Стабильные ссылки на массивы плейлистов обязательны: `playlistByAlbumId` вычисляется на уровне модуля в `/search`, иначе `memo` ломается.

**Продакшн-сборка через Webpack** (`next build --webpack`) — Turbopack по умолчанию в Next.js 16 включает `next-devtools` (+135KB) и не минифицирует чанки.

### Стилизация

Tailwind CSS v4 с `@tailwindcss/postcss`. Анимации — Framer Motion (`framer-motion`).

**Тема: только тёмная.** Глубокий почти-чёрный фон (`#0a0a0f`) с розово-неоновым акцентом (`pink-500`/`pink-400`). Светлой темы и переключателя нет.

**Цветовые токены** объявлены в `:root` и доступны как Tailwind-утилиты через `@theme inline` в `globals.css`:

| Токен CSS                | Tailwind-класс    | Назначение                        |
|--------------------------|-------------------|-----------------------------------|
| `--color-bg-base`        | `bg-bg-base`      | Фон приложения (`#0a0a0f`)        |
| `--color-surface`        | `bg-surface`      | Базовая карточка (`#16131d`)      |
| `--color-surface-2`      | `bg-surface-2`    | Приподнятая поверхность (`#211c2c`) |
| `--color-foreground`     | `text-foreground` | Основной текст (`#f4f4f5`)        |
| `--color-muted`          | `text-muted`      | Вторичный текст (`#a1a1aa`)       |
| `--color-subtle`         | `text-subtle`     | Третичный текст (`#71717a`)       |
| `--color-accent`         | `text-accent` / `bg-accent` | Розовый неон (`#ec4899`) |
| `--color-accent-hover`   | `text-accent-hover` / `bg-accent-hover` | Светлее при ховере (`#f472b6`) |

**Правила использования цветов:**
- Текст: `text-foreground` (основной), `text-muted` (вторичный), `text-subtle` (третичный). Никогда не использовать `text-gray-700/800/900` — на тёмном фоне невидимо.
- Акцент: `text-accent` / `bg-accent`. При ховере на тёмном фоне цвет идёт **светлее** (`bg-accent` → `bg-accent-hover`), а не темнее.
- Стеклянные поверхности: `bg-white/5 + border border-white/10` (см. `GlassPage`). `.glass-surface` добавляет верхний блик и мягкую тень.
- Активный/играющий трек: `bg-pink-500/15 border-pink-500/30`.
- Исключение: полноэкранный `/player/[id]` — сидит на анимированном розово-фиолетовом градиенте с белыми элементами управления.

**Соглашения по типографике** (по референсу SoundCloud):
- `font-thin` (100) — крупные заголовки, названия альбомов в hero-масштабе
- `font-semibold` (600) — заголовки секций, подзаголовки
- `font-bold` (700) — кнопки, CTA-элементы
- Минимум `text-sm` (14px) для любого читаемого текста

## Бэкенд (Supabase)

Бэкенд — **Supabase** (PostgreSQL + Auth). Задеплоено на Vercel (авто-деплой с GitHub, ветка `main`).

**Клиенты** (`app/lib/supabase/`):
- `client.ts` — анонимный `createClient`, для публичного чтения каталога в server-компонентах (без cookies → статика `/albums`, `/search` сохраняется).
- `browser.ts` — `createBrowserClient` (@supabase/ssr) для client-компонентов: вход/выход, `onAuthStateChange`.
- `server.ts` — `createServerClient` с `cookies()` для server-компонентов/роутов.
- `middleware.ts` — `updateSession` (рефреш сессии); вызывается из корневого `proxy.ts` (в Next 16 конвенция `middleware` переименована в `proxy`).

**Схема БД** — миграции в `supabase/migrations/` (применяются вручную через Supabase SQL Editor):
- `0001` — каталог: `profiles` (1:1 с `auth.users`), `artists`, `releases`, `tracks`, `comments` + триггеры (`updated_at`, `handle_new_user`) и RLS.
- `0002` — соц: `favorite_tracks`, `playlists`, `playlist_tracks`, `plays` + RLS.
- `0003` — `WITH CHECK` в UPDATE-политиках (нельзя переписать владельца/автора).
- `0004` — профиль заполняется именем/аватаром из Google-метаданных.
- `0005` — RPC `toggle_favorite(legacy_id)` (маппинг publiс id → внутренний, под RLS).
- Сид каталога: `supabase/seed.sql` (генерируется `scripts/generate-seed-sql.mjs` из `musicLibrary.ts`).

**Ключи** — в `.env.local` только публичные `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` (тот же набор в Vercel env). `service_role` не используется. `.env.local` в `.gitignore`, `.env.example` — шаблон.

**Авторизация** — только Google OAuth. Поток: кнопка → `signInWithOAuth` → `app/auth/callback` (обмен кода на сессию) → `proxy` рефрешит. Состояние сессии — `AuthContext` (`useAuth`). UI: профиль в сайдбаре (`SidebarAccount`), `/account`, пункт в `BottomNav`. Для OAuth первый вход = регистрация.

**Избранное** — `FavoritesContext` (`useFavorites`) держит `Set` избранных legacy-id с оптимистичным `toggle` через RPC. Кнопка `FavoriteButton` (гость → ведёт на `/account`). Страница `/favorites` — server-компонент из БД.

## Роадмап

- **Сделано:** каталог из Supabase, авторизация Google, избранное.
- **Дальше:** плейлисты (таблицы готовы, но пусты), опционально — регистрация по email/паролю, перенос `.mp3`/обложек в Supabase Storage, статистика прослушиваний (`plays`).
