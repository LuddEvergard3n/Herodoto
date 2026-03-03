/**
 * CAUSAL-CHAIN.JS — HERODOTO v7.17
 * "Cadeia de consequências": ao clicar num nó, mostra o grafo de causas
 * e efeitos percorrendo relacoes de tipo 'causalidade' e 'evolucao'
 * em TODOS os dados carregados (window.todosOsDados).
 *
 * Renderiza um painel flutuante com árvore de 2 níveis:
 *   <- causas do nó clicado  (relacoes onde destino = clicked)
 *   -> efeitos do nó clicado (relacoes onde origem = clicked)
 */

const CHAIN_TYPES  = new Set(['causalidade', 'evolucao', 'dependencia', 'influencia']);
const MAX_DEPTH    = 2;   // quantos níveis percorrer
const MAX_PER_SIDE = 8;   // máx. nós por nível por direção

function getLang() {
  return window.getCurrentLang ? window.getCurrentLang() : 'pt';
}

function getName(e) {
  const l = getLang();
  if (l === 'en' && e.nome_en) return e.nome_en;
  if (l === 'es' && e.nome_es) return e.nome_es;
  return e.nome || e.id;
}

function formatYears(e) {
  const fmt = y => y < 0 ? `${Math.abs(y)} a.C.` : `${y} d.C.`;
  if (e.inicio == null) return '';
  if (e.fim != null && e.fim !== e.inicio) return `${fmt(e.inicio)}\u2013${fmt(e.fim)}`;
  return fmt(e.inicio);
}

// Build a lookup: id -> entity, and relation lists
function buildIndex(entities, relacoes) {
  const byId = {};
  entities.forEach(e => { byId[e.id] = e; });

  const causedBy = {};   // id -> [{ entity, relation }]  (quem causou este)
  const causedTo = {};   // id -> [{ entity, relation }]  (o que este causou)

  relacoes.forEach(rel => {
    if (!CHAIN_TYPES.has(rel.tipo)) return;
    const src = rel.origem || rel.source;
    const dst = rel.destino || rel.target;
    if (!src || !dst) return;

    if (!causedTo[src]) causedTo[src] = [];
    if (!causedBy[dst]) causedBy[dst] = [];

    const srcEnt = byId[src];
    const dstEnt = byId[dst];
    if (srcEnt && dstEnt) {
      causedTo[src].push({ entity: dstEnt, rel });
      causedBy[dst].push({ entity: srcEnt, rel });
    }
  });

  return { byId, causedBy, causedTo };
}

// BFS up to MAX_DEPTH levels, avoiding revisits
function traverse(startId, direction, index) {
  const { causedBy, causedTo } = index;
  const getNext = direction === 'forward' ? causedTo : causedBy;

  const levels = [];
  const visited = new Set([startId]);
  let frontier = [startId];

  for (let d = 0; d < MAX_DEPTH; d++) {
    const nextLevel = [];
    for (const id of frontier) {
      const nexts = (getNext[id] || [])
        .filter(x => !visited.has(x.entity.id))
        .sort((a, b) => (b.rel.intensidade || 0) - (a.rel.intensidade || 0))
        .slice(0, MAX_PER_SIDE);
      nexts.forEach(x => {
        visited.add(x.entity.id);
        nextLevel.push(x);
      });
    }
    if (nextLevel.length === 0) break;
    levels.push(nextLevel);
    frontier = nextLevel.map(x => x.entity.id);
  }
  return levels;
}

// Build one chain item DOM element
function buildChainItem(entity, rel, direction) {
  const item = document.createElement('div');
  item.className = 'cc-item';

  const arrow = document.createElement('span');
  arrow.className = 'cc-arrow';
  arrow.textContent = direction === 'forward' ? '\u2192' : '\u2190'; // -> or <-
  item.appendChild(arrow);

  const info = document.createElement('div');
  info.className = 'cc-info';

  const name = document.createElement('strong');
  name.textContent = getName(entity);
  info.appendChild(name);

  const dates = formatYears(entity);
  if (dates) {
    const d = document.createElement('span');
    d.className = 'cc-dates';
    d.textContent = dates;
    info.appendChild(d);
  }

  if (rel && rel.descricao) {
    const desc = document.createElement('p');
    desc.className = 'cc-rel-desc';
    desc.textContent = rel.descricao;
    info.appendChild(desc);
  }

  item.appendChild(info);

  item.addEventListener('click', () => {
    if (window.mostrarInfo) window.mostrarInfo(entity);
    if (window.onHerodonoNodeClick) window.onHerodonoNodeClick(entity);
    const panel = document.getElementById('chain-panel');
    if (panel) panel.classList.add('hidden');
  });

  return item;
}

function renderChainLevel(level, direction, container) {
  level.forEach(({ entity, rel }) => {
    container.appendChild(buildChainItem(entity, rel, direction));
  });
}

const LABELS = {
  causes:  { pt: 'Causas e antecedentes',  en: 'Causes and antecedents',     es: 'Causas y antecedentes' },
  effects: { pt: 'Consequencias e efeitos', en: 'Consequences and effects',   es: 'Consecuencias y efectos' },
  nochain: { pt: 'Sem relacoes causais nos dados carregados.',
             en: 'No causal relations in the loaded data.',
             es: 'Sin relaciones causales en los datos cargados.' },
  title:   { pt: 'Cadeia de consequencias', en: 'Consequence chain', es: 'Cadena de consecuencias' },
};

export function showChainPanel(entidade) {
  const panel = document.getElementById('chain-panel');
  const body  = document.getElementById('chain-panel-body');
  if (!panel || !body) return;

  while (body.firstChild) body.removeChild(body.firstChild);

  // Build index from ALL loaded data
  const allEnts = (window.todosOsDados && window.todosOsDados.entidades) || [];
  const allRels = (window.todosOsDados && window.todosOsDados.relacoes)   || [];

  // Also pull relations from grafoAtual (might have generated links)
  const graphRels = window.grafoAtual ? (window.grafoAtual.relacoes || []) : [];
  const combinedRels = [...allRels, ...graphRels];

  const index = buildIndex(allEnts.length ? allEnts
    : (window.grafoAtual ? window.grafoAtual.entidades : []), combinedRels);

  const causes  = traverse(entidade.id, 'backward', index);
  const effects = traverse(entidade.id, 'forward',  index);

  const l = getLang();

  // Title
  const titleEl = document.createElement('p');
  titleEl.className = 'cc-event-name';
  titleEl.textContent = getName(entidade);
  body.appendChild(titleEl);

  const yrs = formatYears(entidade);
  if (yrs) {
    const dEl = document.createElement('p');
    dEl.className = 'cc-event-dates';
    dEl.textContent = yrs;
    body.appendChild(dEl);
  }

  const hasAny = causes.some(l => l.length) || effects.some(l => l.length);

  if (!hasAny) {
    const empty = document.createElement('p');
    empty.className = 'cc-empty';
    empty.textContent = LABELS.nochain[l] || LABELS.nochain.pt;
    body.appendChild(empty);
    panel.classList.remove('hidden');
    return;
  }

  // Causes section
  if (causes.some(lvl => lvl.length)) {
    const section = document.createElement('div');
    section.className = 'cc-section';
    const h = document.createElement('h5');
    h.className = 'cc-section-title cc-causes';
    h.textContent = LABELS.causes[l] || LABELS.causes.pt;
    section.appendChild(h);
    causes.forEach(lvl => renderChainLevel(lvl, 'backward', section));
    body.appendChild(section);
  }

  // Effects section
  if (effects.some(lvl => lvl.length)) {
    const section = document.createElement('div');
    section.className = 'cc-section';
    const h = document.createElement('h5');
    h.className = 'cc-section-title cc-effects';
    h.textContent = LABELS.effects[l] || LABELS.effects.pt;
    section.appendChild(h);
    effects.forEach(lvl => renderChainLevel(lvl, 'forward', section));
    body.appendChild(section);
  }

  panel.classList.remove('hidden');
}

export function initChainPanel() {
  const btnClose = document.getElementById('btnCloseChain');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      document.getElementById('chain-panel').classList.add('hidden');
    });
  }

  // Expose a global hook so other modules can trigger it
  window.showChainPanel = showChainPanel;
}
