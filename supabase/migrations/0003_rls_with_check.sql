-- 0003_rls_with_check.sql
-- Ужесточение RLS: добавляем WITH CHECK к UPDATE-политикам.
--
-- USING проверяет СТАРУЮ строку (можно ли её трогать), WITH CHECK — НОВУЮ
-- (что в неё записали). Без WITH CHECK пользователь при апдейте своей строки
-- мог бы переписать ключ владельца/автора на чужой. Закрываем по принципу
-- наименьших привилегий: владелец остаётся владельцем и после апдейта.

-- ── profiles: нельзя сменить id профиля на чужой ──────────────
drop policy if exists "profiles update" on public.profiles;
create policy "profiles update" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── artists: владелец не может переназначить owner_id ─────────
drop policy if exists "artists update" on public.artists;
create policy "artists update" on public.artists
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ── comments: автор не может переписать author_id ─────────────
drop policy if exists "comments update self" on public.comments;
create policy "comments update self" on public.comments
  for update using (auth.uid() = author_id)
  with check (auth.uid() = author_id);
