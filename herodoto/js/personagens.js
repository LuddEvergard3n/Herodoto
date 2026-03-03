/**
 * PERSONAGENS.JS — Heródoto v7.18
 * Galeria de personalidades históricas com filtros, busca e painel de detalhes.
 */

const DATASETS_PERSONAGENS = [
  'data/dados-personagens-grecia-roma.json',
  'data/dados-personagens-oriente-antigo.json',
  'data/dados-personagens-medieval.json',
  'data/dados-personagens-renascimento-reforma.json',
  'data/dados-personagens-iluminismo-revolucoes.json',
  'data/dados-personagens-seculo-xix.json',
  'data/dados-personagens-seculo-xx-guerras.json',
  'data/dados-personagens-asia.json',
  'data/dados-personagens-americas.json',
  'data/dados-personagens-africa-oriente.json',
  'data/dados-personagens-ciencia-pensamento.json',
  'data/dados-personagens-biblicas.json',
];

// Área → cor de acento
const AREA_COLORS = {
  política:      '#2b4b7e',
  militar:       '#8b2e1a',
  filosofia:     '#4a2060',
  ciência:       '#2a6080',
  arte:          '#6b2d6e',
  religião:      '#2e6b4f',
  literatura:    '#7a4a20',
  matemática:    '#2a6080',
  medicina:      '#246b4a',
  exploração:    '#8b6220',
  economia:      '#a0622a',
  tecnologia:    '#556b2f',
  história:      '#5c4030',
  sociologia:    '#4a6030',
  teologia:      '#2e6b4f',
  direito:       '#3a4880',
  astronomia:    '#2a4060',
  física:        '#2a6080',
  psicologia:    '#5c3060',
  ativismo:      '#8b3a2a',
  feminismo:     '#7a2060',
  resistência:   '#6b2a20',
  estratégia:    '#4a3820',
  ética:         '#4a2060',
  biologia:      '#2e5a30',
  engenharia:    '#4a5020',
  retórica:      '#6a3820',
  fundação:      '#3a5070',
};

const REGIAO_LABELS = {
  pt: { Europe:'Europa', MiddleEast:'Oriente Médio', EastAsia:'Ásia Oriental',
        SouthAsia:'Sul da Ásia', SoutheastAsia:'Sudeste Asiático',
        Africa:'África', Americas:'Américas', Oceania:'Oceania' },
  en: { Europe:'Europe', MiddleEast:'Middle East', EastAsia:'East Asia',
        SouthAsia:'South Asia', SoutheastAsia:'Southeast Asia',
        Africa:'Africa', Americas:'Americas', Oceania:'Oceania' },
  es: { Europe:'Europa', MiddleEast:'Oriente Medio', EastAsia:'Asia Oriental',
        SouthAsia:'Asia del Sur', SoutheastAsia:'Sudeste Asiático',
        Africa:'África', Americas:'Américas', Oceania:'Oceanía' },
};

const I18N = {
  pt: { title:'Personalidades Históricas', loading:'Carregando personalidades…',
        search:'Pesquisar personalidade…', count:'personalidade', counts:'personalidades',
        all:'Todos', area:'Área', regiao:'Região', epoca:'Época',
        desc:'Biografia', imp:'Relevância Histórica', eventos:'Eventos Relacionados',
        tags:'Temas', nascimento:'Nascimento', morte:'Morte', cargo:'Cargo',
        bc:'a.C.', hint:'Clique numa personalidade para ver detalhes completos',
        noResults:'Nenhuma personalidade encontrada para os filtros selecionados.' },
  en: { title:'Historical Figures', loading:'Loading personalities…',
        search:'Search personalities…', count:'figure', counts:'figures',
        all:'All', area:'Field', regiao:'Region', epoca:'Period',
        desc:'Biography', imp:'Historical Significance', eventos:'Related Events',
        tags:'Themes', nascimento:'Born', morte:'Died', cargo:'Role',
        bc:'BC', hint:'Click a figure to see full details',
        noResults:'No figures found for the selected filters.' },
  es: { title:'Personalidades Históricas', loading:'Cargando personalidades…',
        search:'Buscar personalidad…', count:'personalidad', counts:'personalidades',
        all:'Todos', area:'Área', regiao:'Región', epoca:'Época',
        desc:'Biografía', imp:'Relevancia Histórica', eventos:'Eventos Relacionados',
        tags:'Temas', nascimento:'Nacimiento', morte:'Muerte', cargo:'Cargo',
        bc:'a.C.', hint:'Haz clic en una personalidad para ver detalles completos',
        noResults:'No se encontraron personalidades con los filtros seleccionados.' },
};

const AREA_NAMES_PT = {
  política:'Política', militar:'Militar', filosofia:'Filosofia',
  ciência:'Ciência', arte:'Arte', religião:'Religião',
  literatura:'Literatura', matemática:'Matemática', medicina:'Medicina',
  exploração:'Exploração', economia:'Economia', tecnologia:'Tecnologia',
  história:'História', sociologia:'Sociologia', teologia:'Teologia',
  direito:'Direito', astronomia:'Astronomia', física:'Física',
  psicologia:'Psicologia', ativismo:'Ativismo', feminismo:'Feminismo',
  resistência:'Resistência', estratégia:'Estratégia', ética:'Ética',
  biologia:'Biologia', engenharia:'Engenharia', retórica:'Retórica',
  fundação:'Fundação',
};

// State
let panelEl = null;
let allPersonagens = null;
let loadingP = null;
let filterState = { q:'', areas: new Set(), regiao: '', epoca: '' };
let detailOpen = null;

const GL = () => window.getCurrentLang ? window.getCurrentLang() : 'pt';
const TR = k => (I18N[GL()]||I18N.pt)[k] || k;
const RL = r => (REGIAO_LABELS[GL()]||REGIAO_LABELS.pt)[r] || r;
const AC = a => AREA_COLORS[a] || '#5a4030';
const AN = a => AREA_NAMES_PT[a] || a;

function FY(y) {
  if (y == null) return '?';
  const a = Math.abs(Math.round(y));
  if (a >= 1000000) return (a/1e6).toFixed(1)+'M '+(y<0?TR('bc'):'');
  if (a >= 100000)  return (a/1000).toFixed(0)+'k '+(y<0?TR('bc'):'');
  return y < 0 ? a.toLocaleString()+' '+TR('bc') : String(a);
}

function EN(p) {
  const l = GL();
  return (l==='en' && p.nome_en) || (l==='es' && p.nome_es) || p.nome || '';
}

function personagemColor(p) {
  const primary = (p.area||[])[0];
  return AC(primary);
}

// ── Load ────────────────────────────────────────────────────────────────
async function loadAll() {
  if (allPersonagens) return allPersonagens;
  if (loadingP) return loadingP;
  loadingP = (async () => {
    const results = await Promise.all(
      DATASETS_PERSONAGENS.map(url =>
        fetch(url).then(r => r.ok ? r.json() : null).catch(() => null)
      )
    );
    const seen = new Set(), list = [];
    for (const d of results) {
      if (!d) continue;
      for (const p of (d.personagens || [])) {
        if (!p.id || seen.has(p.id)) continue;
        seen.add(p.id);
        list.push(p);
      }
    }
    // Sort by birth year
    list.sort((a,b) => (a.nascimento||0) - (b.nascimento||0));
    allPersonagens = list;
    return list;
  })();
  return loadingP;
}

// ── Filter ──────────────────────────────────────────────────────────────
function applyFilters(all) {
  const q = filterState.q.toLowerCase();
  return all.filter(p => {
    if (q && !EN(p).toLowerCase().includes(q) &&
        !( p.tags||[]).join(' ').toLowerCase().includes(q) &&
        !(p.cargo||'').toLowerCase().includes(q)) return false;
    if (filterState.areas.size > 0) {
      const hasArea = (p.area||[]).some(a => filterState.areas.has(a));
      if (!hasArea) return false;
    }
    if (filterState.regiao && p.regiao !== filterState.regiao) return false;
    if (filterState.epoca && p.epoca !== filterState.epoca) return false;
    return true;
  });
}

// ── Render grid ─────────────────────────────────────────────────────────
function renderGrid(filtered) {
  const grid = document.getElementById('pg-grid');
  const empty = document.getElementById('pg-empty');
  const countEl = document.getElementById('pg-count');
  if (!grid) return;

  const n = filtered.length;
  if (countEl) countEl.textContent = n + ' ' + (n === 1 ? TR('count') : TR('counts'));

  if (n === 0) {
    grid.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  grid.innerHTML = '';
  filtered.forEach(p => {
    const color = personagemColor(p);
    const card = document.createElement('div');
    card.className = 'pg-card';
    card.style.setProperty('--accent', color);

    const years = p.morte != null
      ? `${FY(p.nascimento)} – ${FY(p.morte)}`
      : `${FY(p.nascimento)}`;

    const areaBadges = (p.area || []).slice(0, 3)
      .map(a => `<span class="pg-area-badge" style="background:${AC(a)}22;color:${AC(a)};border:1px solid ${AC(a)}44">${AN(a)}</span>`)
      .join('');

    card.innerHTML = `
      <div class="pg-card-accent"></div>
      <div class="pg-card-body">
        <div class="pg-card-header">
          <h3 class="pg-card-name">${EN(p)}</h3>
          <span class="pg-card-years">${years}</span>
        </div>
        <p class="pg-card-cargo">${p.cargo || ''}</p>
        <div class="pg-card-areas">${areaBadges}</div>
        <p class="pg-card-excerpt">${(p.descricao||'').slice(0,120)}…</p>
      </div>`;

    card.addEventListener('click', () => openDetail(p));
    grid.appendChild(card);
  });
}

// ── Detail panel ─────────────────────────────────────────────────────────
function openDetail(p) {
  detailOpen = p;
  const dp = document.getElementById('pg-detail');
  if (!dp) return;
  dp.classList.remove('hidden');

  const color = personagemColor(p);
  const years = p.morte != null
    ? `${FY(p.nascimento)} – ${FY(p.morte)}`
    : `${FY(p.nascimento)} –`;

  const areaBadges = (p.area || [])
    .map(a => `<span class="pg-dp-area" style="background:${AC(a)}18;color:${AC(a)};border:1px solid ${AC(a)}44">${AN(a)}</span>`)
    .join('');

  const tagBadges = (p.tags || [])
    .map(t => `<span class="tl-sp-tag">${t}</span>`)
    .join('');

  dp.innerHTML = `
    <div class="pg-dp-accent" style="background:${color}"></div>
    <div class="pg-dp-inner">
      <button class="pg-dp-close" id="pg-dp-close">×</button>
      <h2 class="pg-dp-name">${EN(p)}</h2>
      <div class="pg-dp-meta">
        <span class="pg-dp-years">⏳ ${years}</span>
        <span class="pg-dp-regiao">🌍 ${RL(p.regiao||'')}</span>
        ${p.cargo ? `<span class="pg-dp-cargo">◈ ${p.cargo}</span>` : ''}
      </div>
      <div class="pg-dp-areas">${areaBadges}</div>

      ${p.descricao ? `
        <div class="tl-sp-section">
          <p class="tl-sp-sec-title">${TR('desc')}</p>
          <p class="tl-sp-text">${p.descricao}</p>
        </div>` : ''}

      ${p.importancia ? `
        <div class="tl-sp-section">
          <p class="tl-sp-sec-title">${TR('imp')}</p>
          <p class="tl-sp-text tl-sp-imp">${p.importancia}</p>
        </div>` : ''}

      ${tagBadges ? `
        <div class="tl-sp-section">
          <p class="tl-sp-sec-title">${TR('tags')}</p>
          <div class="tl-sp-tags">${tagBadges}</div>
        </div>` : ''}
    </div>`;

  document.getElementById('pg-dp-close')?.addEventListener('click', closeDetail);
}

function closeDetail() {
  detailOpen = null;
  document.getElementById('pg-detail')?.classList.add('hidden');
}

// ── Build filters bar ────────────────────────────────────────────────────
function buildFilters(all) {
  // Collect unique values
  const areaSet = new Set(), regiaoSet = new Set(), epocaSet = new Set();
  all.forEach(p => {
    (p.area||[]).forEach(a => areaSet.add(a));
    if (p.regiao) regiaoSet.add(p.regiao);
    if (p.epoca) epocaSet.add(p.epoca);
  });

  // Area filter
  const areaBar = document.getElementById('pg-area-filter');
  if (areaBar) {
    areaBar.innerHTML = '';
    [...areaSet].sort().forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'pg-filter-btn' + (filterState.areas.has(a) ? ' on' : '');
      btn.style.setProperty('--fc', AC(a));
      btn.innerHTML = `<span class="pg-fbdot" style="background:${AC(a)}"></span>${AN(a)}`;
      btn.addEventListener('click', () => {
        if (filterState.areas.has(a)) filterState.areas.delete(a);
        else filterState.areas.add(a);
        btn.className = 'pg-filter-btn' + (filterState.areas.has(a) ? ' on' : '');
        renderGrid(applyFilters(allPersonagens));
      });
      areaBar.appendChild(btn);
    });
  }

  // Region select
  const regSel = document.getElementById('pg-regiao-sel');
  if (regSel) {
    regSel.innerHTML = `<option value="">${TR('all')}</option>`;
    [...regiaoSet].sort().forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = RL(r);
      if (filterState.regiao === r) opt.selected = true;
      regSel.appendChild(opt);
    });
    regSel.addEventListener('change', () => {
      filterState.regiao = regSel.value;
      renderGrid(applyFilters(allPersonagens));
    });
  }

  // Epoca select
  const epSel = document.getElementById('pg-epoca-sel');
  if (epSel) {
    epSel.innerHTML = `<option value="">${TR('all')}</option>`;
    // Sort epocas chronologically by first person's birth year
    const epocaOrder = {};
    all.forEach(p => {
      if (p.epoca && !epocaOrder[p.epoca]) epocaOrder[p.epoca] = p.nascimento || 9999;
    });
    [...epocaSet].sort((a,b) => (epocaOrder[a]||0) - (epocaOrder[b]||0)).forEach(e => {
      const opt = document.createElement('option');
      opt.value = e;
      opt.textContent = e;
      if (filterState.epoca === e) opt.selected = true;
      epSel.appendChild(opt);
    });
    epSel.addEventListener('change', () => {
      filterState.epoca = epSel.value;
      renderGrid(applyFilters(allPersonagens));
    });
  }
}

// ── Open / Close panel ───────────────────────────────────────────────────
async function openPersonagens() {
  if (!panelEl) return;
  filterState = { q:'', areas: new Set(), regiao: '', epoca: '' };
  panelEl.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Set title
  const titleEl = document.getElementById('pg-title');
  if (titleEl) titleEl.textContent = TR('title');

  const loadEl = document.getElementById('pg-loading');
  if (loadEl) loadEl.classList.remove('hidden');
  const grid = document.getElementById('pg-grid');
  if (grid) grid.innerHTML = '';

  const all = await loadAll();

  if (loadEl) loadEl.classList.add('hidden');

  buildFilters(all);
  renderGrid(applyFilters(all));

  // Search
  const srch = document.getElementById('pg-search');
  if (srch) {
    srch.value = '';
    srch.placeholder = TR('search');
    const ns = srch.cloneNode(true);
    srch.parentNode.replaceChild(ns, srch);
    let st;
    ns.addEventListener('input', e => {
      clearTimeout(st);
      st = setTimeout(() => {
        filterState.q = e.target.value.trim();
        renderGrid(applyFilters(allPersonagens));
      }, 200);
    });
  }

  document.getElementById('pg-close')?.addEventListener('click', closePersonagens);
}

function closePersonagens() {
  panelEl?.classList.add('hidden');
  document.body.style.overflow = '';
  closeDetail();
}

// ── Build DOM ────────────────────────────────────────────────────────────
function buildPanel() {
  panelEl = document.createElement('div');
  panelEl.id = 'pg-panel';
  panelEl.className = 'pg-panel hidden';
  panelEl.innerHTML = `
    <div class="tl-header">
      <h2 id="pg-title" class="tl-title">Personalidades Históricas</h2>
      <div class="tl-header-right">
        <button class="tl-close-btn" id="pg-close">✕</button>
      </div>
    </div>

    <div class="pg-controls">
      <div class="pg-search-row">
        <input id="pg-search" class="tl-search-input" placeholder="Pesquisar…">
        <span id="pg-count" class="tl-count"></span>
      </div>
      <div class="pg-selects-row">
        <select id="pg-regiao-sel" class="pg-select"></select>
        <select id="pg-epoca-sel" class="pg-select"></select>
      </div>
      <div class="pg-area-row" id="pg-area-filter"></div>
    </div>

    <div class="pg-body">
      <p class="tl-loading hidden" id="pg-loading">Carregando…</p>
      <p class="pg-empty hidden" id="pg-empty"></p>
      <div class="pg-grid" id="pg-grid"></div>
    </div>

    <div class="pg-detail hidden" id="pg-detail"></div>`;

  document.body.appendChild(panelEl);

  // Esc key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (detailOpen) closeDetail();
      else closePersonagens();
    }
  });

  // Click outside detail closes it
  panelEl.addEventListener('click', e => {
    if (detailOpen && !e.target.closest('#pg-detail') && !e.target.closest('.pg-card')) {
      closeDetail();
    }
  });
}

// ── Init ─────────────────────────────────────────────────────────────────
export function initPersonagens() {
  buildPanel();
  const btn = document.getElementById('btn-personagens');
  if (btn) btn.addEventListener('click', openPersonagens);
  window.openPersonagens = openPersonagens;
  window.closePersonagens = closePersonagens;
}
