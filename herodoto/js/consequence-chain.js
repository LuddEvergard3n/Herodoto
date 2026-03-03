/**
 * CONSEQUENCE CHAIN — HERODOTO v7.17
 * Percorre o grafo de relacoes a partir de um no clicado,
 * encontrando cadeias causais (tipo = 'causalidade' | 'evolucao')
 * em ambas as direcoes: antecedentes e consequentes.
 *
 * Exibicao: painel deslizante com timeline vertical.
 * Ativado pelo botao "Cadeia de Causas" no painel de info do no.
 */

const CHAIN_MAX_DEPTH = 6;       // max passos em cada direcao
const CHAIN_MIN_INTENSITY = 0.5; // ignora relacoes fracas

// ── Helpers ──────────────────────────────────────

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

function getShortDesc(e) {
  const l = getLang();
  const raw = (l === 'en' && e.descricao_en) ? e.descricao_en
            : (l === 'es' && e.descricao_es) ? e.descricao_es
            : (e.descricao || '');
  if (!raw) return '';
  return raw.length > 160 ? raw.slice(0, 160).trimEnd() + '\u2026' : raw;
}

// ── Graph traversal ───────────────────────────────

/**
 * Build adjacency maps from the loaded relations.
 * Uses all relations from todosOsDados to work across datasets.
 */
function buildAdjacency(allRelacoes) {
  const forward  = {};  // id -> [{targetId, relacao}]
  const backward = {};  // id -> [{sourceId, relacao}]

  allRelacoes.forEach(r => {
    if (!['causalidade','evolucao'].includes(r.tipo)) return;
    const intensity = r.intensidade ?? 1;
    if (intensity < CHAIN_MIN_INTENSITY) return;

    const src = (r.source && r.source.id) ? r.source.id : r.origem;
    const tgt = (r.target && r.target.id) ? r.target.id : r.destino;
    if (!src || !tgt) return;

    if (!forward[src])  forward[src]  = [];
    if (!backward[tgt]) backward[tgt] = [];

    forward[src].push({ id: tgt, rel: r });
    backward[tgt].push({ id: src, rel: r });
  });

  return { forward, backward };
}

/**
 * BFS from startId in given direction map.
 * Returns ordered array of chain steps: { entity, relDescricao, depth }
 */
function bfs(startId, adjMap, entityMap, maxDepth) {
  const visited = new Set([startId]);
  const queue   = [{ id: startId, depth: 0, relDescricao: null }];
  const result  = [];

  while (queue.length > 0) {
    const { id, depth, relDescricao } = queue.shift();
    if (depth > 0) {
      const ent = entityMap.get(id);
      if (ent) result.push({ entity: ent, relDescricao, depth });
    }
    if (depth >= maxDepth) continue;

    const neighbors = adjMap[id] || [];
    // Sort by intensity desc to prefer strongest chains
    const sorted = [...neighbors].sort((a, b) => (b.rel.intensidade || 1) - (a.rel.intensidade || 1));
    for (const { id: nextId, rel } of sorted) {
      if (!visited.has(nextId)) {
        visited.add(nextId);
        const desc = rel.descricao || rel.descricao_pt || '';
        queue.push({ id: nextId, depth: depth + 1, relDescricao: desc });
      }
    }
  }

  return result;
}

/**
 * Build the full chain for a given entity:
 *   antecedentes (what led here) — reversed so oldest first
 *   consequentes (what follows)
 */
function buildChain(entidade, allEntidades, allRelacoes) {
  const entityMap = new Map(allEntidades.map(e => [e.id, e]));
  const { forward, backward } = buildAdjacency(allRelacoes);

  const antecedentes = bfs(entidade.id, backward, entityMap, CHAIN_MAX_DEPTH).reverse();
  const consequentes = bfs(entidade.id, forward,  entityMap, CHAIN_MAX_DEPTH);

  return { antecedentes, consequentes };
}

// ── Render ────────────────────────────────────────

const LABELS = {
  title:    { pt: 'Cadeia de Causas e Consequencias', en: 'Causes and Consequences', es: 'Cadena de Causas y Consecuencias' },
  ante:     { pt: 'Antecedentes',   en: 'Preceding causes', es: 'Antecedentes' },
  cons:     { pt: 'Consequencias',  en: 'Consequences',     es: 'Consecuencias' },
  none:     { pt: 'Sem conexoes causais nos dados carregados.', en: 'No causal connections in loaded data.', es: 'Sin conexiones causales en los datos cargados.' },
  close:    { pt: 'Fechar', en: 'Close', es: 'Cerrar' },
  focus:    { pt: 'este evento', en: 'this event', es: 'este evento' },
};

function t(key) {
  const l = getLang();
  return LABELS[key][l] || LABELS[key].pt;
}

function makeChainItem(step, isFocus = false) {
  const item = document.createElement('div');
  item.className = isFocus ? 'cc-item cc-item-focus' : 'cc-item';

  if (step.relDescricao) {
    const arrow = document.createElement('div');
    arrow.className = 'cc-arrow';
    arrow.textContent = step.relDescricao;
    item.appendChild(arrow);
  }

  const card = document.createElement('div');
  card.className = 'cc-card';

  if (!isFocus) {
    const dot = document.createElement('span');
    dot.className = 'cc-dot';
    if (window.TYPE_COLORS && step.entity.type) {
      dot.style.backgroundColor = window.TYPE_COLORS[step.entity.type] || '#888';
    }
    card.appendChild(dot);
  }

  const body = document.createElement('div');
  body.className = 'cc-body';

  const name = document.createElement('strong');
  name.textContent = isFocus ? `[ ${getName(step.entity)} ]` : getName(step.entity);
  body.appendChild(name);

  const dates = formatYears(step.entity);
  if (dates) {
    const d = document.createElement('span');
    d.className = 'cc-dates';
    d.textContent = dates;
    body.appendChild(d);
  }

  if (!isFocus) {
    const desc = getShortDesc(step.entity);
    if (desc) {
      const p = document.createElement('p');
      p.className = 'cc-desc';
      p.textContent = desc;
      body.appendChild(p);
    }
  }

  card.appendChild(body);
  item.appendChild(card);

  if (!isFocus) {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const all = window.grafoAtual ? window.grafoAtual.entidades : [];
      if (window.mostrarInfo) window.mostrarInfo(step.entity);
      if (window.onHerodonoNodeClick) window.onHerodonoNodeClick(step.entity);
      closeChainPanel();
    });
  }

  return item;
}

function makeSectionTitle(text) {
  const h = document.createElement('h5');
  h.className = 'cc-section-title';
  h.textContent = text;
  return h;
}

function makeDivider() {
  const d = document.createElement('div');
  d.className = 'cc-divider';
  return d;
}

export function showChainPanel(entidade) {
  const allEntidades = (window.todosOsDados && window.todosOsDados.entidades)
                       ? window.todosOsDados.entidades
                       : (window.grafoAtual ? window.grafoAtual.entidades : []);

  const allRelacoes  = (window.todosOsDados && window.todosOsDados.relacoes)
                       ? window.todosOsDados.relacoes
                       : (window.grafoAtual ? window.grafoAtual.relacoes : []);

  const { antecedentes, consequentes } = buildChain(entidade, allEntidades, allRelacoes);

  const panel = document.getElementById('chain-panel');
  const body  = document.getElementById('chain-panel-body');
  if (!panel || !body) return;

  while (body.firstChild) body.removeChild(body.firstChild);

  const hasAny = antecedentes.length > 0 || consequentes.length > 0;

  if (!hasAny) {
    const empty = document.createElement('p');
    empty.className = 'cc-empty';
    empty.textContent = t('none');
    body.appendChild(empty);
  } else {
    const timeline = document.createElement('div');
    timeline.className = 'cc-timeline';

    if (antecedentes.length > 0) {
      timeline.appendChild(makeSectionTitle(t('ante')));
      antecedentes.forEach(step => timeline.appendChild(makeChainItem(step)));
    }

    timeline.appendChild(makeDivider());
    timeline.appendChild(makeChainItem({ entity: entidade, relDescricao: null }, true));
    timeline.appendChild(makeDivider());

    if (consequentes.length > 0) {
      timeline.appendChild(makeSectionTitle(t('cons')));
      consequentes.forEach(step => timeline.appendChild(makeChainItem(step)));
    }

    body.appendChild(timeline);
  }

  panel.classList.remove('hidden');
}

function closeChainPanel() {
  const panel = document.getElementById('chain-panel');
  if (panel) panel.classList.add('hidden');
}

// ── Button injection into info panel ─────────────

/**
 * Call this after mostrarInfo renders a node's detail panel.
 * Injects a "Cadeia de Causas" button into #info-panel.
 */
export function injectChainButton(entidade) {
  const infoPanel = document.getElementById('info-panel');
  if (!infoPanel) return;

  // Remove previous button if any
  const old = infoPanel.querySelector('.btn-chain');
  if (old) old.remove();

  const l = getLang();
  const labels = {
    pt: 'Cadeia de causas',
    en: 'Causal chain',
    es: 'Cadena causal',
  };

  const btn = document.createElement('button');
  btn.className = 'btn-chain';
  btn.textContent = labels[l] || labels.pt;
  btn.addEventListener('click', () => showChainPanel(entidade));

  infoPanel.appendChild(btn);
}

// ── Init ──────────────────────────────────────────

export function initChainPanel() {
  const btnClose = document.getElementById('chain-panel-close');
  if (btnClose) {
    btnClose.addEventListener('click', closeChainPanel);
  }

  // Hook into node click to inject chain button
  const originalHook = window.onHerodonoNodeClick;
  window.onHerodonoNodeClick = (entidade) => {
    if (originalHook) originalHook(entidade);
    // Small delay to let info panel render first
    setTimeout(() => injectChainButton(entidade), 50);
  };
}
