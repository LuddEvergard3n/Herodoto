/**
 * CONTEXT PANEL — HERÓDOTO v7.17
 * Painel lateral dinâmico "Contexto do Evento"
 * Ativado ao clicar em um nó do grafo.
 *
 * Três blocos:
 *   1. Mesmo período      — mesma region + period (nós carregados)
 *   2. Mesma região       — mesma region, outros períodos
 *   3. No mundo, ao mesmo tempo — OUTRAS regiões, sobreposição temporal
 *      Usa window.todosOsDados para buscar em TODOS os dados carregados.
 */

const MAX_DESC_CHARS = 200;

// ── Mapa de regiões → labels + cores ──────────────
const REGION_META = {
  Europe:        { pt: 'Europa',           en: 'Europe',          es: 'Europa',              color: '#6b8cba' },
  Mediterranean: { pt: 'Mediterrâneo',     en: 'Mediterranean',   es: 'Mediterráneo',        color: '#5b9eaa' },
  MiddleEast:    { pt: 'Oriente Médio',    en: 'Middle East',     es: 'Oriente Medio',       color: '#c9974c' },
  EastAsia:      { pt: 'Ásia Oriental',    en: 'East Asia',       es: 'Asia Oriental',       color: '#c47f6a' },
  SouthAsia:     { pt: 'Sul da Ásia',      en: 'South Asia',      es: 'Sur de Asia',         color: '#b87e4b' },
  SoutheastAsia: { pt: 'Sudeste Asiático', en: 'SE Asia',         es: 'SE Asiático',         color: '#9e8257' },
  CentralAsia:   { pt: 'Ásia Central',     en: 'Central Asia',    es: 'Asia Central',        color: '#a08060' },
  Asia:          { pt: 'Ásia',             en: 'Asia',            es: 'Asia',                color: '#b87e4b' },
  Africa:        { pt: 'África',           en: 'Africa',          es: 'África',              color: '#8b9e57' },
  Americas:      { pt: 'Américas',         en: 'Americas',        es: 'Américas',            color: '#7a9a5e' },
  NorthAmerica:  { pt: 'América do Norte', en: 'North America',   es: 'América del Norte',   color: '#6a9060' },
  SouthAmerica:  { pt: 'América do Sul',   en: 'South America',   es: 'América del Sur',     color: '#739c5a' },
  Mesoamerica:   { pt: 'Mesoamérica',      en: 'Mesoamerica',     es: 'Mesoamérica',         color: '#6d9e52' },
  Multiple:      { pt: 'Múltiplas',        en: 'Multiple',        es: 'Múltiples',           color: '#9e8888' },
  Global:        { pt: 'Global',           en: 'Global',          es: 'Global',              color: '#8888aa' },
};

const BLOCK_LABELS = {
  samePeriod: { pt: 'No mesmo período',         en: 'Same period',          es: 'Mismo período' },
  sameRegion: { pt: 'Na mesma região',           en: 'Same region',          es: 'Misma región' },
  worldSync:  { pt: 'No mundo, ao mesmo tempo', en: 'Elsewhere, same time', es: 'En el mundo, al mismo tiempo' },
  noContext:  { pt: 'Nenhum contexto encontrado nos dados carregados.',
                en: 'No context found in the loaded data.',
                es: 'Ningún contexto encontrado en los datos cargados.' },
};

// ── Helpers ───────────────────────────────────────
function getLang() {
  return window.getCurrentLang ? window.getCurrentLang() : 'pt';
}

function getName(e) {
  const l = getLang();
  if (l === 'en' && e.nome_en) return e.nome_en;
  if (l === 'es' && e.nome_es) return e.nome_es;
  return e.nome || e.id;
}

function getDesc(e) {
  const l = getLang();
  const raw = (l === 'en' && e.descricao_en) ? e.descricao_en
            : (l === 'es' && e.descricao_es) ? e.descricao_es
            : (e.descricao || '');
  if (!raw) return null;
  return raw.length > MAX_DESC_CHARS ? raw.slice(0, MAX_DESC_CHARS).trimEnd() + '…' : raw;
}

function regionLabel(key) {
  const l = getLang();
  const m = REGION_META[key];
  return m ? (m[l] || m.pt || key) : key;
}

function regionColor(key) {
  return (REGION_META[key] || {}).color || '#888888';
}

function formatYears(e) {
  const fmt = y => y < 0 ? `${Math.abs(y)} a.C.` : `${y} d.C.`;
  if (e.inicio == null) return '';
  if (e.fim != null && e.fim !== e.inicio) return `${fmt(e.inicio)} – ${fmt(e.fim)}`;
  return fmt(e.inicio);
}

// ── Temporal overlap scoring 0..1 ─────────────────
// Point events (inicio === fim) get a ±75-year context window so they
// match coeval centuries-long ranges without scoring artificially low.
const POINT_WINDOW = 75;

function temporalScore(a, b) {
  let aS = a.inicio ?? -9000;
  let aE = a.fim   ?? aS;
  let bS = b.inicio ?? -9000;
  let bE = b.fim   ?? bS;

  if (aS === aE) { aS -= POINT_WINDOW; aE += POINT_WINDOW; }
  if (bS === bE) { bS -= POINT_WINDOW; bE += POINT_WINDOW; }

  const overlap = Math.max(0, Math.min(aE, bE) - Math.max(aS, bS));
  if (overlap === 0) return 0;
  const minDur = Math.max(1, Math.min(aE - aS, bE - bS, 600));
  return Math.min(1, overlap / minDur);
}

// ── Build context blocks ──────────────────────────
function buildContextBlocks(clicked, graphEntidades) {
  const others = graphEntidades.filter(e => e.id !== clicked.id);

  const samePeriod = others.filter(e =>
    e.period && clicked.period && e.period === clicked.period &&
    e.region && clicked.region && e.region === clicked.region
  ).slice(0, 6);

  const spIds = new Set(samePeriod.map(e => e.id));

  const sameRegion = others.filter(e =>
    e.region && clicked.region &&
    e.region === clicked.region &&
    !spIds.has(e.id)
  ).slice(0, 6);

  // World sync: ALL loaded data
  const allLoaded = (window.todosOsDados && window.todosOsDados.entidades)
                    ? window.todosOsDados.entidades
                    : graphEntidades;

  const usedIds = new Set([clicked.id, ...samePeriod.map(e=>e.id), ...sameRegion.map(e=>e.id)]);

  const candidates = allLoaded
    .filter(e =>
      !usedIds.has(e.id) &&
      e.region && clicked.region &&
      e.region !== clicked.region &&
      e.region !== 'Multiple' &&
      e.region !== 'Global'
    )
    .map(e => ({ e, score: temporalScore(clicked, e) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // Max 2 per region, total 10
  const regionCount = {};
  const worldSync = [];
  for (const { e } of candidates) {
    const r = e.region;
    regionCount[r] = (regionCount[r] || 0);
    if (regionCount[r] < 2) {
      regionCount[r]++;
      worldSync.push(e);
      if (worldSync.length >= 10) break;
    }
  }

  return { samePeriod, sameRegion, worldSync };
}

// ── Item builder ─────────────────────────────────
function buildItem(e, showDates) {
  const item = document.createElement('div');
  item.className = 'cp-item';

  const dot = document.createElement('span');
  dot.className = 'cp-dot';
  if (window.TYPE_COLORS && e.type) {
    dot.style.backgroundColor = window.TYPE_COLORS[e.type] || '#888';
  }
  item.appendChild(dot);

  const textWrap = document.createElement('div');
  textWrap.className = 'cp-text';

  const name = document.createElement('strong');
  name.textContent = getName(e);
  textWrap.appendChild(name);

  if (showDates && (e.inicio != null || e.fim != null)) {
    const dates = document.createElement('span');
    dates.className = 'cp-dates';
    dates.textContent = formatYears(e);
    textWrap.appendChild(dates);
  }

  const desc = getDesc(e);
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc;
    textWrap.appendChild(p);
  }

  item.appendChild(textWrap);

  item.addEventListener('click', () => {
    if (window.mostrarInfo) window.mostrarInfo(e);
    const graphAll = window.grafoAtual ? window.grafoAtual.entidades : [];
    const inGraph = graphAll.find(g => g.id === e.id);
    if (inGraph) {
      showContextPanel(inGraph, graphAll);
    } else {
      showContextPanel(e, graphAll.concat([e]));
    }
  });

  return item;
}

// ── Render blocks ─────────────────────────────────
function renderBasicBlock(title, entities, container) {
  if (!entities.length) return;
  const section = document.createElement('div');
  section.className = 'cp-block';

  const h = document.createElement('h5');
  h.className = 'cp-block-title';
  h.textContent = title;
  section.appendChild(h);

  entities.forEach(e => section.appendChild(buildItem(e, false)));
  container.appendChild(section);
}

function renderWorldBlock(title, entities, container) {
  if (!entities.length) return;

  const section = document.createElement('div');
  section.className = 'cp-block cp-block-world';

  const h = document.createElement('h5');
  h.className = 'cp-block-title cp-block-title-world';
  h.textContent = title;
  section.appendChild(h);

  // Group by region preserving order of first appearance
  const grouped = {};
  const order = [];
  entities.forEach(e => {
    const r = e.region || 'Unknown';
    if (!grouped[r]) { grouped[r] = []; order.push(r); }
    grouped[r].push(e);
  });

  order.forEach(region => {
    const regionRow = document.createElement('div');
    regionRow.className = 'cp-region-row';

    const badge = document.createElement('span');
    badge.className = 'cp-region-badge';
    badge.textContent = regionLabel(region);
    badge.style.backgroundColor = regionColor(region);
    regionRow.appendChild(badge);
    section.appendChild(regionRow);

    grouped[region].forEach(e => section.appendChild(buildItem(e, true)));
  });

  container.appendChild(section);
}

// ── Public API ────────────────────────────────────
export function showContextPanel(entidade, allEntidades) {
  const panel = document.getElementById('context-panel');
  const body  = document.getElementById('context-panel-body');
  if (!panel || !body) return;

  while (body.firstChild) body.removeChild(body.firstChild);

  // Header: name
  const nameEl = document.createElement('p');
  nameEl.className = 'cp-event-name';
  nameEl.textContent = getName(entidade);
  body.appendChild(nameEl);

  // Header: dates
  const yrs = formatYears(entidade);
  if (yrs) {
    const datesEl = document.createElement('p');
    datesEl.className = 'cp-event-dates';
    datesEl.textContent = yrs;
    body.appendChild(datesEl);
  }

  const { samePeriod, sameRegion, worldSync } = buildContextBlocks(entidade, allEntidades);
  const l = getLang();

  const hasAny = samePeriod.length || sameRegion.length || worldSync.length;
  if (!hasAny) {
    const empty = document.createElement('p');
    empty.className = 'cp-empty';
    empty.textContent = BLOCK_LABELS.noContext[l] || BLOCK_LABELS.noContext.pt;
    body.appendChild(empty);
  } else {
    renderBasicBlock(BLOCK_LABELS.samePeriod[l] || BLOCK_LABELS.samePeriod.pt, samePeriod, body);
    renderBasicBlock(BLOCK_LABELS.sameRegion[l]  || BLOCK_LABELS.sameRegion.pt,  sameRegion,  body);
    renderWorldBlock(BLOCK_LABELS.worldSync[l]   || BLOCK_LABELS.worldSync.pt,   worldSync,   body);
  }

  panel.classList.remove('hidden');
}

export function initContextPanel() {
  window.onHerodonoNodeClick = (entidade) => {
    const all = window.grafoAtual ? window.grafoAtual.entidades : [];
    showContextPanel(entidade, all);
  };

  const btnClose = document.getElementById('btnCloseContext');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      document.getElementById('context-panel').classList.add('hidden');
    });
  }
}
