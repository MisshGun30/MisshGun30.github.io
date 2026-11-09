// Содержание музыкальной полки. Пустой src означает, что записи ещё нет.
// Пример пути: src: 'assets/audio/music/название.mp3'.
// cover — путь к своей обложке; без неё остаётся рисованный конверт.
export const musicTracks = [
  { id: 'beat-01', kind: 'beat', title: 'Fonk0ne', src: 'assets/audio/music/fonk0ne.mp3', cover: '', art: 'night-pulse', tone: 'rose' },
  { id: 'beat-02', kind: 'beat', title: 'Трек бит 2', src: 'assets/audio/music/trek-bit-2.mp3', cover: '', art: 'orbit', tone: 'sage' },
  { id: 'song-01', kind: 'song', title: 'Я тебя люблю', src: 'assets/audio/music/ya-tebya-lyublyu.mp3', cover: 'assets/images/ya-tebya-lyublyu-label.jpg', tone: 'lilac' }
];

export const favoriteArtist = 'Группа «Сплин»';
export const favoriteArtistImage = 'assets/images/splin-band.png';
export const favoriteTracks = [
  { title: 'Маяк', artist: 'Сплин', url: 'https://music.yandex.ru/album/168863/track/38847129', cover: 'https://avatars.yandex.net/get-music-content/16496077/2891f7a7.a.168863-3/400x400' },
  { title: 'Звери', artist: 'Сплин', url: 'https://music.yandex.ru/album/60059/track/38844217', cover: 'https://avatars.yandex.net/get-music-content/15401259/eb8e40c5.a.60059-3/400x400' },
  { title: '17', artist: 'CUPSIZE', url: 'https://music.yandex.ru/album/43968956/track/155807913', cover: 'https://avatars.yandex.net/get-music-content/20305588/efdad7fa.a.43968956-1/400x400' },
  { title: 'Звезда рок-н-ролла', artist: 'Сплин', url: 'https://music.yandex.ru/album/4181557/track/34084449', cover: 'https://avatars.yandex.net/get-music-content/114728/ce29e78f.a.4181557-1/400x400' },
  { title: 'супермаркет', artist: 'madk1d', url: 'https://music.yandex.ru/album/35861245/track/137300018', cover: 'https://avatars.yandex.net/get-music-content/13043189/a13e3397.a.35861245-1/400x400' }
];

// Ссылки, предоставленные Михаилом. ВК пока ведёт на переданный адрес каталога.
export const favoritePlaylists = [
  { service: 'Яндекс Музыка', title: 'Мне нравится', url: 'https://music.yandex.ru/playlists/lk.c72c4bed-b894-4cfa-a8cf-9349fcc0a16a?utm_source=desktop&utm_medium=copy_link', mark: 'Я', tone: 'yandex' },
  { service: 'ВК Музыка', title: 'Моя музыка в ВК', url: 'https://vk.ru/music/playlist/549369477_42_7e504ff5679244c0bf', mark: 'VK', tone: 'vk' }
];
