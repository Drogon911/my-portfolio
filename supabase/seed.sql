-- seed.sql — сгенерировано scripts/generate-seed-sql.mjs. Не редактировать вручную.
-- Прогонять ПОСЛЕ 0001_core_schema.sql. Идемпотентно (on conflict do nothing).

-- Исполнители
insert into public.artists (name, slug) values
  ('Eskimo Callboy', 'eskimo-callboy'),
  ('Enter Shikari', 'enter-shikari'),
  ('Error 37', 'error-37')
on conflict (slug) do nothing;

-- Релизы (artist_id через подзапрос по slug; legacy_id = старый Album.id)
insert into public.releases (artist_id, title, type, cover_url, legacy_id) values
  ((select id from public.artists where slug = 'eskimo-callboy'), 'EP 2010', 'album', 'albums/album-1/eskimo-callboy-ep-2010.jpg', 1),
  ((select id from public.artists where slug = 'eskimo-callboy'), 'Bury Me In Vegas', 'album', 'albums/album-2/vegas-cover.jpg', 2),
  ((select id from public.artists where slug = 'enter-shikari'), 'Take to the Skies', 'album', 'albums/album-3/take-to-the-skies.jpg', 3),
  ((select id from public.artists where slug = 'error-37'), 'Error 37', 'album', 'albums/album-4/error-error.jpg', 4),
  ((select id from public.artists where slug = 'error-37'), 'FCGACMAAIGWTUC', 'album', 'albums/album-5/fcgacmaaigwtuc.jpg', 5),
  ((select id from public.artists where slug = 'error-37'), 'Monofluid', 'album', 'albums/album-6/monofluid.jpg', 6)
on conflict (legacy_id) do nothing;

-- Треки (release_id через подзапрос по legacy_id; position = порядок в альбоме)
insert into public.tracks (release_id, title, audio_url, cover_url, position, legacy_id) values
  ((select id from public.releases where legacy_id = 1), 'Intro', 'albums/album-1/track-1.mp3', 'albums/album-1/cover1.jpg', 1, 1),
  ((select id from public.releases where legacy_id = 1), 'Antichrist Sex Pornstyle', 'albums/album-1/track-2.mp3', 'albums/album-1/cover2.jpg', 2, 2),
  ((select id from public.releases where legacy_id = 1), 'Monsieur Moustache vs Clitcat', 'albums/album-1/track-3.mp3', 'albums/album-1/cover3.jpg', 3, 3),
  ((select id from public.releases where legacy_id = 1), 'Hey Mrs. Dramaqueen', 'albums/album-1/track-4.mp3', 'albums/album-1/cover4.jpg', 4, 4),
  ((select id from public.releases where legacy_id = 1), 'Prom Night', 'albums/album-1/track-5.mp3', 'albums/album-1/cover5.jpg', 5, 5),
  ((select id from public.releases where legacy_id = 1), 'Outro', 'albums/album-1/track-6.mp3', 'albums/album-1/cover6.jpg', 6, 6),
  ((select id from public.releases where legacy_id = 2), 'Bury Me In Vegas', 'albums/album-2/track-1.mp3', 'albums/album-2/cover1v.jpg', 1, 101),
  ((select id from public.releases where legacy_id = 2), 'The Kerosene Dance', 'albums/album-2/track-2.mp3', 'albums/album-2/cover2v.jpg', 2, 102),
  ((select id from public.releases where legacy_id = 2), 'Internude', 'albums/album-2/track-3.mp3', 'albums/album-2/cover3v.jpg', 3, 103),
  ((select id from public.releases where legacy_id = 2), 'Is Anyone Up', 'albums/album-2/track-4.mp3', 'albums/album-2/cover4v.jpg', 4, 104),
  ((select id from public.releases where legacy_id = 2), 'Wonderbra Boulevard', 'albums/album-2/track-5.mp3', 'albums/album-2/cover5v.jpg', 5, 105),
  ((select id from public.releases where legacy_id = 2), 'Legendary Sleeping Assault', 'albums/album-2/track-6.mp3', 'albums/album-2/cover6v.jpg', 6, 106),
  ((select id from public.releases where legacy_id = 2), 'Light The Skyline', 'albums/album-2/track-7.mp3', 'albums/album-2/cover7v.jpg', 7, 107),
  ((select id from public.releases where legacy_id = 2), '$5 Bitchcore', 'albums/album-2/track-8.mp3', 'albums/album-2/cover8v.jpg', 8, 108),
  ((select id from public.releases where legacy_id = 2), 'Transilvanian Cunthunger', 'albums/album-2/track-9.mp3', 'albums/album-2/cover9v.jpg', 9, 109),
  ((select id from public.releases where legacy_id = 2), 'Muffin Purper-Gurk', 'albums/album-2/track-10.mp3', 'albums/album-2/cover10v.jpg', 10, 110),
  ((select id from public.releases where legacy_id = 2), 'Snow Covered Polaroids', 'albums/album-2/track-11.mp3', 'albums/album-2/cover11v.jpg', 11, 111),
  ((select id from public.releases where legacy_id = 3), 'Enter Shikari', 'albums/album-3/track-1.mp3', 'albums/album-3/take-to-the-skies.jpg', 1, 201),
  ((select id from public.releases where legacy_id = 3), 'Mothership', 'albums/album-3/track-2.mp3', 'albums/album-3/take-to-the-skies.jpg', 2, 202),
  ((select id from public.releases where legacy_id = 3), 'Anything Can Happen In The Next Half Hour', 'albums/album-3/track-3.mp3', 'albums/album-3/take-to-the-skies.jpg', 3, 203),
  ((select id from public.releases where legacy_id = 3), 'Labyrinth', 'albums/album-3/track-4.mp3', 'albums/album-3/take-to-the-skies.jpg', 4, 204),
  ((select id from public.releases where legacy_id = 3), 'No Sssweat', 'albums/album-3/track-5.mp3', 'albums/album-3/take-to-the-skies.jpg', 5, 205),
  ((select id from public.releases where legacy_id = 3), 'Today Won t Go Down In History', 'albums/album-3/track-6.mp3', 'albums/album-3/take-to-the-skies.jpg', 6, 206),
  ((select id from public.releases where legacy_id = 3), 'Reprise 1', 'albums/album-3/track-7.mp3', 'albums/album-3/take-to-the-skies.jpg', 7, 207),
  ((select id from public.releases where legacy_id = 3), 'Return To Energiser', 'albums/album-3/track-8.mp3', 'albums/album-3/take-to-the-skies.jpg', 8, 208),
  ((select id from public.releases where legacy_id = 3), 'Sorry You re Not A Winner', 'albums/album-3/track-9.mp3', 'albums/album-3/take-to-the-skies.jpg', 9, 209),
  ((select id from public.releases where legacy_id = 3), 'Jonny Sniper', 'albums/album-3/track-10.mp3', 'albums/album-3/take-to-the-skies.jpg', 10, 210),
  ((select id from public.releases where legacy_id = 3), 'Adieu', 'albums/album-3/track-11.mp3', 'albums/album-3/take-to-the-skies.jpg', 11, 211),
  ((select id from public.releases where legacy_id = 3), 'Ok Time For Plan B', 'albums/album-3/track-12.mp3', 'albums/album-3/take-to-the-skies.jpg', 12, 212),
  ((select id from public.releases where legacy_id = 3), 'Reprise 2', 'albums/album-3/track-13.mp3', 'albums/album-3/take-to-the-skies.jpg', 13, 213),
  ((select id from public.releases where legacy_id = 4), 'Bunnings', 'albums/album-4/track-1.mp3', 'albums/album-4/error-error.jpg', 1, 301),
  ((select id from public.releases where legacy_id = 4), 'Is Having A Sale On Rope', 'albums/album-4/track-2.mp3', 'albums/album-4/error-error.jpg', 2, 302),
  ((select id from public.releases where legacy_id = 4), 'xXCactaurXCoreXx', 'albums/album-4/track-3.mp3', 'albums/album-4/error-error.jpg', 3, 303),
  ((select id from public.releases where legacy_id = 4), 'Let Us Duel', 'albums/album-4/track-4.mp3', 'albums/album-4/error-error.jpg', 4, 304),
  ((select id from public.releases where legacy_id = 4), 'Postman Pat Aint Got Shit On Me', 'albums/album-4/track-5.mp3', 'albums/album-4/error-error.jpg', 5, 305),
  ((select id from public.releases where legacy_id = 4), 'Chinese Warlord', 'albums/album-4/track-6.mp3', 'albums/album-4/error-error.jpg', 6, 306),
  ((select id from public.releases where legacy_id = 5), 'Xkinglerxkorex', 'albums/album-5/track-1.mp3', 'albums/album-5/fcgacmaaigwtuc.jpg', 1, 401),
  ((select id from public.releases where legacy_id = 5), 'She Saw Flesh as a Flaw', 'albums/album-5/track-2.mp3', 'albums/album-5/fcgacmaaigwtuc.jpg', 2, 402),
  ((select id from public.releases where legacy_id = 5), 'Allergic to Funk', 'albums/album-5/track-3.mp3', 'albums/album-5/fcgacmaaigwtuc.jpg', 3, 403),
  ((select id from public.releases where legacy_id = 5), 'I Don''t Usually Dance but I Forgot How to Not', 'albums/album-5/track-4.mp3', 'albums/album-5/fcgacmaaigwtuc.jpg', 4, 404),
  ((select id from public.releases where legacy_id = 5), 'I Break Bedrock', 'albums/album-5/track-5.mp3', 'albums/album-5/fcgacmaaigwtuc.jpg', 5, 405),
  ((select id from public.releases where legacy_id = 6), 'Monofluid', 'albums/album-6/track-1.mp3', 'albums/album-6/monofluid.jpg', 1, 501)
on conflict (legacy_id) do nothing;
