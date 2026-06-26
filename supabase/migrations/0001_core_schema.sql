-- 0001_core_schema.sql
-- Ядро каталога Party: профили, исполнители, релизы, треки, комментарии.
-- Включает триггеры (updated_at, авто-профиль) и RLS-политики.

-- ── Тип релиза ────────────────────────────────────────────────
create type public.release_type as enum ('single', 'ep', 'album');

-- ── Профили (1:1 с auth.users — канонический паттерн Supabase) ──
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Исполнители ───────────────────────────────────────────────
-- owner_id NULL = «засеянный» исполнитель без аккаунта (Eskimo Callboy и т.п.).
-- Реальный пользователь может позже «забрать» страницу: проставляем owner_id.
create table public.artists (
  id         bigint generated always as identity primary key,
  owner_id   uuid references public.profiles(id) on delete set null,
  name       text not null,
  slug       text unique not null,
  bio        text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Релизы (альбом / EP / сингл) ──────────────────────────────
create table public.releases (
  id           bigint generated always as identity primary key,
  artist_id    bigint not null references public.artists(id) on delete cascade,
  title        text not null,
  type         public.release_type not null default 'album',
  cover_url    text,
  release_date date,
  legacy_id    integer unique,        -- = старый Album.id (сидинг + стабильные ссылки)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on public.releases (artist_id);

-- ── Треки ─────────────────────────────────────────────────────
-- cover_url опционален: если NULL — UI берёт обложку релиза. Сохраняет
-- текущее поведение (у треков свои обложки для blur-фона плеера).
create table public.tracks (
  id               bigint generated always as identity primary key,
  release_id       bigint not null references public.releases(id) on delete cascade,
  title            text not null,
  audio_url        text not null,
  cover_url        text,
  duration_seconds integer,
  position         integer not null,
  legacy_id        integer unique,    -- = старый Track.id
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (release_id, position)
);
create index on public.tracks (release_id);

-- ── Комментарии к релизам ─────────────────────────────────────
create table public.comments (
  id         bigint generated always as identity primary key,
  release_id bigint not null references public.releases(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.comments (release_id, created_at desc);

-- ── Триггер: автообновление updated_at ────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_artists_updated  before update on public.artists
  for each row execute function public.set_updated_at();
create trigger trg_releases_updated before update on public.releases
  for each row execute function public.set_updated_at();
create trigger trg_tracks_updated   before update on public.tracks
  for each row execute function public.set_updated_at();
create trigger trg_comments_updated before update on public.comments
  for each row execute function public.set_updated_at();

-- ── Триггер: профиль на каждого нового пользователя ───────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.artists  enable row level security;
alter table public.releases enable row level security;
alter table public.tracks   enable row level security;
alter table public.comments enable row level security;

-- Каталог — публичное чтение (сидинг идёт под service-role, RLS обходит).
create policy "profiles read"   on public.profiles for select using (true);
create policy "profiles update" on public.profiles for update using (auth.uid() = id);

create policy "artists read"    on public.artists  for select using (true);
create policy "artists update"  on public.artists  for update using (auth.uid() = owner_id);

create policy "releases read"   on public.releases for select using (true);
create policy "tracks read"     on public.tracks   for select using (true);

-- Комментарии — читают все, пишет/правит только автор.
create policy "comments read"        on public.comments for select using (true);
create policy "comments insert self" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments update self" on public.comments for update using (auth.uid() = author_id);
create policy "comments delete self" on public.comments for delete using (auth.uid() = author_id);
