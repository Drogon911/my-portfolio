-- 0004_profile_from_oauth.sql
-- Обновляем handle_new_user: при входе через Google заполняем профиль
-- именем и аватаром из метаданных OAuth-провайдера.
--
-- Google кладёт в raw_user_meta_data поля full_name/name и avatar_url/picture
-- (а не display_name, который ждал прежний триггер). coalesce покрывает оба
-- варианта именования и не ломает обычную регистрацию (там будет NULL).

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'display_name'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  );
  return new;
end;
$$;
