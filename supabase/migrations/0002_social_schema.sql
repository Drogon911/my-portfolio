-- 0002_social_schema.sql
-- Соц-функции и статистика: избранное, плейлисты, прослушивания.
-- Следующая фаза — можно применять отдельно после 0001.

-- ── Избранное (на уровне треков) ──────────────────────────────
create table public.favorite_tracks (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  track_id   bigint not null references public.tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

-- ── Плейлисты ─────────────────────────────────────────────────
create table public.playlists (
  id          bigint generated always as identity primary key,
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  description text,
  cover_url   text,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.playlist_tracks (
  playlist_id bigint not null references public.playlists(id) on delete cascade,
  track_id    bigint not null references public.tracks(id) on delete cascade,
  position    integer not null,
  added_at    timestamptz not null default now(),
  primary key (playlist_id, track_id),
  unique (playlist_id, position)
);

-- ── Прослушивания (сырые события) ─────────────────────────────
-- user_id NULL = анонимный слушатель. Под рост — позже добавить
-- агрегат play_counts (materialized view / периодический rollup).
create table public.plays (
  id         bigint generated always as identity primary key,
  track_id   bigint not null references public.tracks(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.plays (track_id);
create index on public.plays (created_at);

create trigger trg_playlists_updated before update on public.playlists
  for each row execute function public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
alter table public.favorite_tracks enable row level security;
alter table public.playlists       enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.plays           enable row level security;

create policy "favorites own" on public.favorite_tracks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "playlists read"   on public.playlists for select
  using (is_public or auth.uid() = owner_id);
create policy "playlists manage" on public.playlists for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "playlist_tracks read" on public.playlist_tracks for select using (
  exists (select 1 from public.playlists p
          where p.id = playlist_id and (p.is_public or p.owner_id = auth.uid()))
);
create policy "playlist_tracks manage" on public.playlist_tracks for all using (
  exists (select 1 from public.playlists p
          where p.id = playlist_id and p.owner_id = auth.uid())
) with check (
  exists (select 1 from public.playlists p
          where p.id = playlist_id and p.owner_id = auth.uid())
);

create policy "plays insert"   on public.plays for insert
  with check (user_id is null or auth.uid() = user_id);
create policy "plays read own" on public.plays for select using (auth.uid() = user_id);
