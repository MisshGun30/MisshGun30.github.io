import { musicTracks, favoriteArtist, favoriteArtistImage, favoriteTracks, favoritePlaylists } from './music-data.js';
import { setupMusic as setupPlayer } from './record-player.js';

const vkTracks = [
  'https://vk.ru/audio474499187_456480804_a444f3873a91cdb286',
  'https://vk.ru/audio549369477_456240443_9de78ff1f1d19b7250',
  'https://vk.ru/audio774411305_456239446_b15f7d0c0f81038cbe',
  'https://vk.ru/audio-2001015189_51015189',
  'https://vk.ru/audio-2001286033_135286033'
];

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
const webLink = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? escape(url.href) : ''; } catch { return ''; } };

function recordMarkup(track, index) {
  const kind = track.kind === 'song' ? 'Песня' : 'Бит';
  const beatArt = track.art === 'night-pulse'
    ? `<svg class="sleeve-art sleeve-art--night" viewBox="0 0 220 220" fill="none"><circle class="art-soft" cx="158" cy="76" r="31"/><path d="M17 162H43L53 142L63 180L75 125L88 177L100 151L111 162H137M24 190H193M42 81L46 77M88 60L92 56M131 113L136 108M181 127L186 123"/><path d="M30 190V173H48V190M54 190V165H69V190M158 190V170H176V190"/></svg>`
    : track.art === 'orbit'
      ? `<svg class="sleeve-art sleeve-art--orbit" viewBox="0 0 220 220" fill="none"><circle class="art-soft" cx="111" cy="113" r="51"/><circle cx="111" cy="113" r="68"/><ellipse cx="111" cy="113" rx="89" ry="33" transform="rotate(-31 111 113)"/><path d="M33 151C55 128 68 174 91 150S127 126 150 150S178 168 192 143M65 65C74 75 83 75 91 65M147 74C156 84 166 84 175 74"/><circle class="art-ink" cx="111" cy="113" r="8"/></svg>`
      : `<svg class="sleeve-art sleeve-art--flower" viewBox="0 0 220 220" fill="none"><path d="M53 207C68 156 97 104 163 29M81 143C62 124 40 129 32 111M112 99C142 113 160 95 178 100M132 71C111 63 109 47 111 34"/><g transform="translate(161 43)"><ellipse cy="-17" rx="13" ry="22"/><ellipse cy="-17" rx="13" ry="22" transform="rotate(72)"/><ellipse cy="-17" rx="13" ry="22" transform="rotate(144)"/><ellipse cy="-17" rx="13" ry="22" transform="rotate(216)"/><ellipse cy="-17" rx="13" ry="22" transform="rotate(288)"/><circle r="5"/></g><path d="M70 162Q41 160 46 139Q70 139 70 162ZM99 120Q102 145 126 135Q120 117 99 120Z"/></svg>`;
  return `<article class="vinyl-card" data-music-kind="${track.kind === 'song' ? 'song' : 'beat'}" data-tone="${escape(track.tone)}">
    <button class="record-select" type="button" data-record="${escape(track.id)}" aria-label="Слушать ${escape(track.title)}" aria-pressed="false"><span class="vinyl-object" aria-hidden="true">
      <div class="vinyl-disc"><span class="vinyl-label${track.cover ? ' vinyl-label--artwork' : ''}">${track.cover ? `<img src="${escape(track.cover)}" alt="">` : `V1zor<small>${String(index + 1).padStart(2, '0')}</small>`}</span></div>
      <span class="vinyl-sleeve"><span class="sleeve-top">V1zor <span>${kind}</span></span>${beatArt}<span class="sleeve-bottom">${kind === 'Песня' ? 'голос и музыка' : 'без лишних слов'}<span>♫</span></span></span>
    </span></button>
    <div class="vinyl-caption"><div><p class="vinyl-kind">${kind}</p><h3>${escape(track.title)}</h3></div><span class="vinyl-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span></div>
  </article>`;
}

export function musicMarkup() {
  const favorites = favoriteTracks.map((track, index) => `<li class="favorite-track"><button class="favorite-track-link" type="button" data-favorite="${index}" aria-haspopup="dialog"><span class="favorite-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><img class="favorite-cover" src="${webLink(track.cover)}" alt="Обложка: ${escape(track.title)} — ${escape(track.artist)}" loading="lazy"><span class="favorite-track-copy"><span class="favorite-title">${escape(track.title)}</span><span class="favorite-artist">${escape(track.artist)}</span></span></button></li>`).join('');
  const playlists = favoritePlaylists.map(playlist => `<a class="playlist-link" data-service="${escape(playlist.tone)}" href="${webLink(playlist.url)}" target="_blank" rel="noopener noreferrer"><span class="playlist-mark" aria-hidden="true">${escape(playlist.mark)}</span><span><span class="playlist-service">${escape(playlist.service)}</span><span class="playlist-title">${escape(playlist.title)}</span></span></a>`).join('');
  return `<div class="music-room">
    <div class="music-signature"><span class="music-artist">V1zor</span><p>Так я подписываю свою музыку.<br>Делаю биты, пишу песни и играю на гитаре.</p><span class="music-margin-note" aria-hidden="true">у каждого сада<br>есть своё звучание</span></div>
    <section class="music-listening" aria-labelledby="music-listening-title"><p class="eyebrow">По другую сторону наушников</p><h2 id="music-listening-title">Что я слушаю</h2><p class="listening-intro">Мне кажется, музыкальный вкус раскрывает внутренний мир человека.</p>
      <div class="listening-layout"><div class="favorite-selection"><div class="favorite-performer"><div class="artist-cassette"><div class="cassette-photo"><img src="${escape(favoriteArtistImage)}" alt="Участники группы «Сплин»" loading="lazy"><span class="cassette-title">СПЛИН</span></div><div class="cassette-reels" aria-hidden="true"><i></i><i></i></div><span class="cassette-label">SIDE A · ЛЮБИМОЕ</span></div><div class="favorite-performer-name"><p class="eyebrow">Мой любимый исполнитель</p><h3>${escape(favoriteArtist)}</h3></div></div><h3 class="favorite-list-title">Мои любимые треки</h3><ol class="music-favorites" aria-label="Пять любимых треков">${favorites}</ol></div>
      <aside class="music-playlists" aria-labelledby="music-playlists-title"><h3 id="music-playlists-title">Мои плейлисты</h3><div class="playlist-links">${playlists}</div><p class="playlist-note">Откроются в музыкальном сервисе</p></aside></div>
    </section>
    <section class="record-room" aria-labelledby="music-shelf-title"><h2 id="music-shelf-title">Моя музыкальная полка</h2><p class="record-hint">Выбери конверт — поставим пластинку.</p>
    <div class="record-station"><div class="record-collection"><div class="vinyl-shelf">${musicTracks.map(recordMarkup).join('')}</div><span class="shelf-edge" aria-hidden="true"></span><p class="shelf-note">Три записи. Три разных настроения.</p></div>
      <div class="turntable-panel"><div class="turntable" aria-label="Виниловый проигрыватель"><span class="turntable-brand" aria-hidden="true">V1zor · stereo</span><div class="turntable-platter"><div class="deck-record" aria-hidden="true"></div><span class="turntable-spindle" aria-hidden="true"></span></div><div class="tonearm" aria-hidden="true"><span></span></div><span class="turntable-light" aria-hidden="true"></span><span class="turntable-speed" aria-hidden="true">33⅓ RPM</span></div>
      <p class="deck-title" aria-live="polite">Пока здесь тихо</p><p class="deck-subtitle">Пластинка ждёт на полке</p><div class="deck-controls"><button type="button" class="deck-toggle" data-action="play" disabled aria-label="Включить запись"></button><label class="deck-seek-label"><span class="sr-only">Позиция в записи</span><input class="deck-seek" type="range" min="0" max="100" value="0" step="0.1" disabled></label><span class="deck-time">0:00</span><button type="button" class="deck-eject" disabled aria-label="Вернуть пластинку на полку" title="Вернуть на полку">↥</button></div><p class="deck-message" role="status"></p></div>
    </div></section>
    <dialog class="track-platform-dialog" aria-labelledby="track-platform-title">
      <h2 id="track-platform-title" tabindex="-1" autofocus>Где открыть трек?</h2>
      <p class="track-platform-name"></p>
      <div class="track-platform-options">
        <a data-track-vk target="_blank" rel="noopener noreferrer">ВК Музыка</a>
        <a data-track-yandex target="_blank" rel="noopener noreferrer">Яндекс Музыка</a>
      </div>
      <form method="dialog"><button type="submit">Закрыть</button></form>
    </dialog>
  </div>`;
}

export { stopMusic, restoreMusic } from './record-player.js';

export function setupMusic(backgroundAudio) {
  setupPlayer(backgroundAudio);
  const content = document.querySelector('#section-content');
  content.addEventListener('click', event => {
    const button = event.target.closest('[data-favorite]');
    if (!button) return;
    const index = Number(button.dataset.favorite);
    const track = favoriteTracks[index];
    const dialog = content.querySelector('.track-platform-dialog');
    dialog.querySelector('.track-platform-name').textContent = `${track.title} · ${track.artist}`;
    dialog.querySelector('[data-track-vk]').href = vkTracks[index];
    dialog.querySelector('[data-track-yandex]').href = track.url;
    dialog.showModal();
  });
}
