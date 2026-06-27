// Канонические типы каталога. Источник истины для UI и слоя доступа к данным.
// Формы намеренно совпадают со старым статическим musicLibrary, чтобы переход
// на Supabase не затрагивал разметку компонентов.

export type Track = {
  id: number;
  title: string;
  artist: string;
  src: string;
  cover: string;
  albumId: number;
};

export type Album = {
  id: number;
  title: string;
  artist: string;
  cover: string;
  tracks: Track[];
};
