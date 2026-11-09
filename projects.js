import { projects } from './projects-data.js';
import { playProjectPageSound, stopProjectPageSound } from './project-sound.js';

// Текст вставляется как текст, даже если в нём встретятся HTML-символы.
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const arrow = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10"/></svg>';
let selectedProject = projects[0].id;
let pageAnimation;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

export function stopProjectPageMotion() {
  pageAnimation?.cancel(); pageAnimation = null;
  stopProjectPageSound();
}

export function projectsMarkup() {
  selectedProject = projects[0].id;
  return `<div class="portfolio-files" data-projects>
    <div class="portfolio-project-tabs" role="tablist" aria-label="Проекты">${projects.map(project => `
      <button class="portfolio-tab" type="button" role="tab"
        id="project-tab-${escapeHtml(project.id)}" data-project-tab="${escapeHtml(project.id)}"
        aria-controls="project-panel-${escapeHtml(project.id)}"
        aria-selected="${project.id === selectedProject}" tabindex="${project.id === selectedProject ? 0 : -1}">${escapeHtml(project.title)}</button>`).join('')}
    </div>
    <div class="portfolio-folder">${projects.map(project => `
      <article class="portfolio-sheet" role="tabpanel" id="project-panel-${escapeHtml(project.id)}"
        aria-labelledby="project-tab-${escapeHtml(project.id)}" tabindex="0"${project.id === selectedProject ? '' : ' hidden'}>
        <div class="portfolio-overview">
          <div class="portfolio-story">
            <h2 id="${escapeHtml(project.id)}-title">${escapeHtml(project.title)}</h2>
            <div class="portfolio-meta">
              <span>${escapeHtml(project.format)}</span>
              <span class="portfolio-stage">${escapeHtml(project.stage)}</span>
            </div>
            <p class="portfolio-summary">${escapeHtml(project.summary)}</p>
            <p class="portfolio-role">${escapeHtml(project.role)}</p>
            <div class="portfolio-links">${project.links.map(link => `
              <a class="${link.primary ? 'portfolio-primary' : 'portfolio-secondary'}" href="${escapeHtml(link.url)}"${/^https?:\/\//.test(link.url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(link.label)}${arrow}</a>
            `).join('')}</div>
          </div>
          <section class="portfolio-flow" aria-labelledby="${escapeHtml(project.id)}-flow">
            <h3 id="${escapeHtml(project.id)}-flow">${escapeHtml(project.flowTitle)}</h3>
            <ol>${project.flow.map(step => `<li><h4>${escapeHtml(step.title)}</h4><p>${escapeHtml(step.text)}</p></li>`).join('')}</ol>
          </section>
        </div>
        <div class="portfolio-delivery">${project.features.map(feature => `
          <section><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.text)}</p></section>
        `).join('')}</div>
        ${project.motivation ? `<p class="portfolio-motivation">${escapeHtml(project.motivation)}</p>` : ''}
        <div class="portfolio-details">${project.details.map(detail => `
          <details><summary>${escapeHtml(detail.title)}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></summary><p>${escapeHtml(detail.text)}</p></details>
        `).join('')}</div>
        <p class="portfolio-stage-note">${escapeHtml(project.stageNote)}</p>
      </article>`).join('')}
    </div>
  </div>`;
}

function selectProject(root, id, focus = false) {
  const changed = selectedProject !== id;
  if (changed) { stopProjectPageMotion(); playProjectPageSound(); }
  selectedProject = id;
  for (const tab of root.querySelectorAll('[data-project-tab]')) {
    const selected = tab.dataset.projectTab === id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    root.querySelector(`#${tab.getAttribute('aria-controls')}`).hidden = !selected;
    if (selected) {
      if (changed && !reduced.matches) pageAnimation = root.querySelector(`#${tab.getAttribute('aria-controls')}`).animate([
        { transform: 'perspective(1200px) rotateY(-7deg) translateX(8px)', opacity: .7 },
        { transform: 'perspective(1200px) rotateY(0deg) translateX(0px)', opacity: 1 }
      ], { duration: 480, easing: 'cubic-bezier(.2,.75,.25,1)' });
      if (focus) tab.focus({ preventScroll: true });
      // На телефоне прокручиваем только ряд ярлыков, сохраняя положение страницы.
      const strip = tab.parentElement;
      const bounds = strip.getBoundingClientRect();
      const item = tab.getBoundingClientRect();
      if (item.left < bounds.left) strip.scrollLeft -= bounds.left - item.left;
      else if (item.right > bounds.right) strip.scrollLeft += item.right - bounds.right;
    }
  }
}

// Один обработчик на общем контейнере: повторный вход в раздел не дублирует события.
export function setupProjects() {
  const content = document.querySelector('#section-content');
  content.addEventListener('click', event => {
    const tab = event.target.closest('[data-project-tab]');
    if (tab) selectProject(tab.closest('[data-projects]'), tab.dataset.projectTab);
  });
  content.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-project-tab]');
    if (!tab) return;
    const root = tab.closest('[data-projects]');
    const tabs = [...root.querySelectorAll('[data-project-tab]')];
    const index = tabs.indexOf(tab);
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectProject(root, tabs[next].dataset.projectTab, true);
  });
  let layoutWidth = innerWidth;
  window.addEventListener('resize', () => {
    if(innerWidth === layoutWidth)return;
    layoutWidth = innerWidth;
    const root = content.querySelector('[data-projects]');
    if (root) selectProject(root, selectedProject);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopProjectPageMotion(); });
  reduced.addEventListener('change', () => { if (reduced.matches) stopProjectPageMotion(); });
}
