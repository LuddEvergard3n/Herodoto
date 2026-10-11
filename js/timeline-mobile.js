import { featureEnabled } from './features.js';

let panel = null;
let allEntities = null;
let visibleCount = 80;
let returnFocus = null;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character]));
}

function formatYear(year) {
  if (year < 0) return `${Math.abs(year)} a.C.`;
  return `${year}`;
}

function localized(entity, field) {
  const language = localStorage.getItem('herodoto-lang') || 'pt';
  if (language === 'en') return entity[`${field}_en`] || entity[field] || '';
  if (language === 'es') return entity[`${field}_es`] || entity[field] || '';
  return entity[field] || '';
}

async function loadIndex() {
  if (allEntities) return allEntities;
  const response = await fetch('data/timeline-index.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const entities = (await response.json()).entities || [];
  allEntities = featureEnabled('lusophoneDatasetsV8') ? entities : entities.filter(entity => entity.collection !== 'mundo-lusofono-v8');
  return allEntities;
}

function renderDetail(entity) {
  const detail = panel.querySelector('.tlm-detail');
  detail.innerHTML = `
    <button type="button" class="tlm-detail-close">Fechar</button>
    <p class="tlm-date">${formatYear(entity.inicio)}${entity.fim != null && entity.fim !== entity.inicio ? `–${formatYear(entity.fim)}` : ''}</p>
    <h3>${escapeHtml(localized(entity, 'nome'))}</h3>
    <p>${escapeHtml(localized(entity, 'descricao'))}</p>
    ${localized(entity, 'importancia') ? `<h4>Por que importa</h4><p>${escapeHtml(localized(entity, 'importancia'))}</p>` : ''}
    <small>Dataset: ${escapeHtml(entity.datasetId)}</small>`;
  detail.hidden = false;
  detail.querySelector('.tlm-detail-close').focus();
  detail.querySelector('.tlm-detail-close').addEventListener('click', () => { detail.hidden = true; });
}

function renderList(entities, query = '', type = 'all') {
  const normalized = query.trim().toLowerCase();
  const filtered = entities.filter(entity => {
    if (type !== 'all' && entity.type !== type) return false;
    if (!normalized) return true;
    return `${localized(entity, 'nome')} ${localized(entity, 'descricao')}`.toLowerCase().includes(normalized);
  });
  const list = panel.querySelector('.tlm-list');
  list.innerHTML = '';
  let lastCentury = null;
  filtered.slice(0, visibleCount).forEach(entity => {
    const century = Math.floor(entity.inicio / 100) * 100;
    if (century !== lastCentury) {
      const heading = document.createElement('h3');
      heading.className = 'tlm-century';
      heading.textContent = entity.inicio < 0 ? `A partir de ${formatYear(century)}` : `${century}–${century + 99}`;
      list.appendChild(heading);
      lastCentury = century;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tlm-card';
    button.innerHTML = `<span class="tlm-year">${formatYear(entity.inicio)}</span><strong>${escapeHtml(localized(entity, 'nome'))}</strong><span>${escapeHtml(entity.region)} · ${escapeHtml(entity.type)}</span>`;
    button.addEventListener('click', () => renderDetail(entity));
    list.appendChild(button);
  });
  const more = panel.querySelector('.tlm-more');
  more.hidden = visibleCount >= filtered.length;
  panel.querySelector('.tlm-count').textContent = `${filtered.length} acontecimentos`;
}

function close() {
  if (!panel) return;
  panel.hidden = true;
  document.body.style.overflow = '';
  returnFocus?.focus();
}

function build() {
  panel = document.createElement('section');
  panel.className = 'tlm-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="tlm-header"><div><p>Linha do tempo adaptativa</p><h2>História em sequência</h2></div><button type="button" class="tlm-close">Fechar</button></header>
    <div class="tlm-controls">
      <input class="tlm-search" type="search" placeholder="Buscar acontecimento" aria-label="Buscar acontecimento">
      <select class="tlm-type" aria-label="Filtrar por tipo"><option value="all">Todos os tipos</option><option value="political">Político</option><option value="war">Guerra</option><option value="social">Social</option><option value="economic">Econômico</option><option value="cultural">Cultural</option><option value="scientific">Científico</option></select>
      <span class="tlm-count" aria-live="polite"></span>
    </div>
    <div class="tlm-list"></div>
    <button type="button" class="tlm-more">Carregar mais</button>
    <aside class="tlm-detail" hidden></aside>`;
  document.body.appendChild(panel);
  panel.querySelector('.tlm-close').addEventListener('click', close);
  const update = () => { visibleCount = 80; renderList(allEntities, panel.querySelector('.tlm-search').value, panel.querySelector('.tlm-type').value); };
  panel.querySelector('.tlm-search').addEventListener('input', update);
  panel.querySelector('.tlm-type').addEventListener('change', update);
  panel.querySelector('.tlm-more').addEventListener('click', () => { visibleCount += 80; renderList(allEntities, panel.querySelector('.tlm-search').value, panel.querySelector('.tlm-type').value); });
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!panel.querySelector('.tlm-detail').hidden) panel.querySelector('.tlm-detail').hidden = true;
      else close();
    }
  });
}

export async function openMobileTimeline() {
  if (!panel) build();
  returnFocus = document.activeElement;
  panel.hidden = false;
  document.body.style.overflow = 'hidden';
  panel.querySelector('.tlm-list').innerHTML = '<p class="tlm-loading">Carregando índice cronológico...</p>';
  try {
    const entities = await loadIndex();
    visibleCount = 80;
    renderList(entities);
    panel.querySelector('.tlm-close').focus();
  } catch (error) {
    panel.querySelector('.tlm-list').innerHTML = `<p class="tlm-error">Não foi possível carregar a linha do tempo. ${error.message}</p>`;
  }
}

export function closeMobileTimeline() { close(); }
