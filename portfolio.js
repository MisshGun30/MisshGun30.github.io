import { featuredAchievements, portfolioLearning, portfolioMore, portfolioDocuments, portfolioArchiveUrl } from './portfolio-data.js';

const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
const icon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4H4v3m9-3h3v3M4 13v3h3m9-3v3h-3"/></svg>';
const chevron = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>';

function preview(item, index) {
  return `<button class="achievement-preview" data-achievement="${item.id}" type="button" aria-label="Рассмотреть документ: ${escape(item.title)}" style="--document-tilt:${[-1.2,.8,-.5,1,-.8,.6][index%6]}deg">
    <span class="achievement-mount"><img src="${item.thumbnail}" width="${item.thumbWidth}" height="${item.thumbHeight}" alt="${escape(item.result)} — ${escape(item.title)}" loading="${index<3?'eager':'lazy'}"${index===0?' fetchpriority="high"':''} decoding="async"></span>
    <span class="achievement-preview-caption">Рассмотреть документ ${icon}</span>
  </button>`;
}

export function portfolioMarkup() {
  return `<div class="achievements">
    <section class="achievement-selection" aria-label="Избранные достижения">
      <div class="achievement-section-heading"><p>От инженерных задач до предпринимательства — несколько результатов, за которыми стоит мой опыт.</p></div>
      <div class="achievement-gallery achievement-board">${featuredAchievements.map((item, index) => `
        <article class="achievement-card">${preview(item,index)}
          <div class="achievement-card-copy"><h2 class="achievement-title">${escape(item.title)}</h2><p class="achievement-result">${escape(item.result)}</p><p class="achievement-description">${escape(item.description)}</p><p class="achievement-year">${escape(item.year)}</p></div>
        </article>`).join('')}</div>
    </section>
    <section class="achievement-study" aria-labelledby="achievement-study-title">
      <div class="achievement-section-heading"><h2 id="achievement-study-title">Чему учился</h2><p>Курсы и квалификация, которые дополняют учёбу и практику.</p></div>
      <div class="achievement-courses">${portfolioLearning.map(item => `
        <article class="achievement-course"><div><h3>${escape(item.title)}</h3><p class="achievement-course-issuer">${escape(item.issuer)} · ${escape(item.year)}</p><p class="achievement-result">${escape(item.result)}</p><p class="achievement-description">${escape(item.description)}</p><button class="achievement-text-button" type="button" data-achievement="${item.id}" aria-label="Рассмотреть документ: ${escape(item.title)}">${item.id==='qualification'?'Посмотреть свидетельство':'Посмотреть сертификат'} ${icon}</button></div>
        <img src="${item.thumbnail}" width="${item.thumbWidth}" height="${item.thumbHeight}" alt="" loading="lazy" decoding="async"></article>`).join('')}</div>
    </section>
    <section class="achievement-archive" aria-labelledby="achievement-archive-title">
      <div class="achievement-section-heading"><h2 id="achievement-archive-title">Ещё из архива</h2><p>Небольшие победы, первые пробы и занятия, которые тоже стали частью моего пути.</p></div>
      <details class="achievement-archive-fold"><summary><span>Открыть ещё ${portfolioMore.length} историй и документов</span>${chevron}</summary>
        <div class="achievement-archive-list">${portfolioMore.map(item => `
          <article class="achievement-archive-item"><span class="achievement-year">${escape(item.year)}</span><div><h3><button class="achievement-archive-title" type="button" data-achievement="${item.id}">${escape(item.title)}</button></h3><p>${escape(item.result)}</p></div><button class="achievement-archive-open" type="button" data-achievement="${item.id}" aria-label="Рассмотреть документ: ${escape(item.title)}">Документ ${icon}</button></article>`).join('')}</div>
      </details>
      ${portfolioArchiveUrl ? `<a class="achievement-drive-link" href="${escape(portfolioArchiveUrl)}" target="_blank" rel="noopener noreferrer">Все документы на Google Диске <span aria-hidden="true">↗</span></a>` : ''}
    </section>
  </div>`;
}

let active = 0;
let opener;
let zoomed = false;
let dialog;

function updateDocumentUrl(id) {
  const url = new URL(location.href);
  if (id) url.searchParams.set('document',id);
  else url.searchParams.delete('document');
  history.replaceState(null,'',url);
}

let documentRevision = 0;
const decodedDocuments = new Map();
function prepareDocument(item) {
  if (!decodedDocuments.has(item.id)) {
    const image = new Image(); image.src = item.image;
    decodedDocuments.set(item.id, image.decode().then(() => image).catch(() => { decodedDocuments.delete(item.id); return null; }));
    if(decodedDocuments.size > 5)decodedDocuments.delete(decodedDocuments.keys().next().value);
  }
  return decodedDocuments.get(item.id);
}
function renderDocument() {
  const revision = ++documentRevision;
  const item = portfolioDocuments[active];
  updateDocumentUrl(item.id);
  zoomed = false;
  dialog.classList.remove('is-zoomed');
  dialog.querySelector('[data-document-zoom]').setAttribute('aria-pressed','false');
  dialog.querySelector('[data-document-zoom]').textContent = 'Увеличить';
  dialog.querySelector('#achievement-dialog-title').textContent = item.title;
  dialog.querySelector('#achievement-dialog-note').textContent = `${item.result} · ${item.year}`;
  dialog.querySelector('#achievement-dialog-position').textContent = `${active+1} из ${portfolioDocuments.length}`;
  const image = dialog.querySelector('#achievement-full-image');
  image.hidden = false;
  image.width = item.width;
  image.height = item.height;
  image.alt = `${item.title}. ${item.result}. ${item.issuer}, ${item.year}.`;
  image.src = item.thumbnail;
  void prepareDocument(item).then(decoded => {
    if(revision !== documentRevision || !dialog.open)return;
    if(decoded)image.src = decoded.src;
  });
  for (const delta of [-1,1])void prepareDocument(portfolioDocuments[(active+delta+portfolioDocuments.length)%portfolioDocuments.length]);
  dialog.querySelector('#achievement-image-error').hidden = true;
  dialog.querySelector('#achievement-image-link').href = item.image;
  dialog.querySelector('.achievement-image-stage').scrollTo(0,0);
}

function stepDocument(delta) {
  active = (active + delta + portfolioDocuments.length) % portfolioDocuments.length;
  renderDocument();
}

export function closePortfolio() {
  if (dialog?.open) {
    updateDocumentUrl(null);
    dialog.close();
  }
}

export function portfolioUrlMatchesView() {
  const requested = new URLSearchParams(location.search).get('document');
  return dialog?.open ? requested === portfolioDocuments[active].id : !requested;
}

export function restorePortfolioDocument() {
  const id = new URLSearchParams(location.search).get('document');
  const index = portfolioDocuments.findIndex(item => item.id === id);
  if (index < 0 || dialog.open) return;
  active = index;
  opener = document.querySelector(`[data-achievement="${id}"]`);
  const archive = opener?.closest('details');
  if (archive) archive.open = true;
  renderDocument();
  dialog.showModal();
  dialog.querySelector('[data-document-close]').focus({preventScroll:true});
}

export function setupPortfolio() {
  dialog = document.querySelector('#achievement-dialog');
  document.querySelector('#section-content').addEventListener('click', event => {
    const button = event.target.closest('[data-achievement]');
    if (!button) return;
    const index = portfolioDocuments.findIndex(item => item.id === button.dataset.achievement);
    if (index < 0) return;
    active = index;
    opener = button;
    renderDocument();
    dialog.showModal();
    dialog.querySelector('[data-document-close]').focus({preventScroll:true});
  });
  dialog.querySelector('[data-document-close]').addEventListener('click', closePortfolio);
  dialog.querySelector('[data-document-prev]').addEventListener('click', () => stepDocument(-1));
  dialog.querySelector('[data-document-next]').addEventListener('click', () => stepDocument(1));
  dialog.querySelector('[data-document-zoom]').addEventListener('click', event => {
    zoomed = !zoomed;
    dialog.classList.toggle('is-zoomed',zoomed);
    event.currentTarget.setAttribute('aria-pressed',String(zoomed));
    event.currentTarget.textContent = zoomed ? 'Уместить целиком' : 'Увеличить';
  });
  dialog.addEventListener('keydown', event => {
    if (zoomed) return; // В увеличенном документе стрелки нужны для прокрутки.
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      stepDocument(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePortfolio();
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    documentRevision++;
    updateDocumentUrl(null);
    dialog.querySelector('#achievement-full-image').removeAttribute('src');
    dialog.classList.remove('is-zoomed');
    if (opener?.isConnected) opener.focus({preventScroll:true});
    opener = null;
  });
  dialog.querySelector('#achievement-full-image').addEventListener('error', event => {
    if (!event.currentTarget.getAttribute('src')) return;
    event.currentTarget.hidden = true;
    dialog.querySelector('#achievement-image-error').hidden = false;
  });
}
