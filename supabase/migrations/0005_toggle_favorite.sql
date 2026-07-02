-- 0005_toggle_favorite.sql
-- Атомарный лайк/анлайк трека по публичному legacy_id.
--
-- В UI трек известен под legacy_id, а favorite_tracks.track_id ссылается на
-- внутренний tracks.id. Функция прячет этот маппинг: принимает legacy_id,
-- резолвит tracks.id, снимает лайк если он был, иначе ставит. Возвращает новое
-- состояние (true = теперь в избранном).
--
-- security invoker → выполняется под правами вызывающего, поэтому RLS-политика
-- «favorites own» (insert/delete только для auth.uid()) остаётся в силе.

create or replace function public.toggle_favorite(p_legacy_id bigint)
returns boolean language plpgsql security invoker set search_path = public as $$
declare
  v_track_id bigint;
begin
  select id into v_track_id from tracks where legacy_id = p_legacy_id;
  if v_track_id is null then
    raise exception 'track % not found', p_legacy_id;
  end if;

  delete from favorite_tracks
  where user_id = auth.uid() and track_id = v_track_id;
  if found then
    return false;
  end if;

  insert into favorite_tracks (user_id, track_id)
  values (auth.uid(), v_track_id);
  return true;
end $$;
