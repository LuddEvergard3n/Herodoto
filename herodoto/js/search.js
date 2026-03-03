/**
 * SEARCH.JS — HERODOTO v7.17
 * Busca textual global em todas as entidades carregadas (window.todosOsDados).
 * Pesquisa em: nome, descricao, importancia (PT/EN/ES), tags.
 * Resultado: lista de até 20 hits com preview e botão de navegação ao nó.
 */

const SEARCH_MAX = 20;
const PREVIEW_CHARS = 120;

// ── Helpers ──────────────────────────────────────

function getLang() {
  return window.getCurrentLang ? window.getCurrentLang() : 'pt';
}

function getEntityName(e) {
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

// Highlight first occurrence of query in text, return HTML-safe snippet
function makeSnippet(text, query) {
  if (!text) return '';
  const lower = text.toLowerCase();
  const qi = lower.indexOf(query.toLowerCase());
  let snippet;
  if (qi === -1) {
    snippet = text.slice(0, PREVIEW_CHARS);
  } else {
    const start = Math.max(0, qi - 40);
    const end   = Math.min(text.length, qi + query.length + 80);
    snippet = (start > 0 ? '\u2026' : '') + text.slice(start, end) + (end < text.length ? '\u2026' : '');
  }
  // Escape HTML then bold the match
  const safe = snippet.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return safe.replace(re, '<mark>$1</mark>');
}

// Score an entity against a query (higher = better match)
function scoreEntity(e, query) {
  const q = query.toLowerCase();
  const l = getLang();

  const nameField    = l === 'en' ? (e.nome_en || e.nome) : l === 'es' ? (e.nome_es || e.nome) : e.nome;
  const descField    = l === 'en' ? (e.descricao_en || e.descricao) : l === 'es' ? (e.descricao_es || e.descricao) : e.descricao;
  const importField  = l === 'en' ? (e.importancia_en || e.importancia) : l === 'es' ? (e.importancia_es || e.importancia) : e.importancia;
  const tags         = (e.tags || []).join(' ');

  const nameLow    = (nameField   || '').toLowerCase();
  const descLow    = (descField   || '').toLowerCase();
  const importLow  = (importField || '').toLowerCase();
  const tagsLow    = tags.toLowerCase();

  // Scoring weights
  let score = 0;
  if (nameLow.includes(q))   score += nameLow === q ? 100 : nameLow.startsWith(q) ? 60 : 40;
  if (tagsLow.includes(q))   score += 20;
  if (descLow.includes(q))   score += 10;
  if (importLow.includes(q)) score += 8;

  // Snippet for display
  let snippet = '';
  let snippetRaw = '';
  if (nameLow.includes(q)) {
    snippetRaw = descField || '';
    snippet = (descField || '').slice(0, PREVIEW_CHARS);
  } else if (descLow.includes(q)) {
    snippetRaw = descField || '';
    snippet = makeSnippet(descField, query);
  } else if (importLow.includes(q)) {
    snippetRaw = importField || '';
    snippet = makeSnippet(importField, query);
  }

  return { score, snippet, snippetRaw };
}

// ── Render results ────────────────────────────────

function clearResults(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
}

function renderResults(results, query, container) {
  clearResults(container);

  if (!query) {
    container.classList.add('hidden');
    return;
  }

  if (results.length === 0) {
    container.classList.remove('hidden');
    const empty = document.createElement('p');
    empty.className = 'search-empty';
    const l = getLang();
    empty.textContent = l === 'en' ? 'No results found.'
                      : l === 'es' ? 'Sin resultados.'
                      : 'Nenhum resultado encontrado.';
    container.appendChild(empty);
    return;
  }

  container.classList.remove('hidden');

  const count = document.createElement('p');
  count.className = 'search-count';
  const total = results.length;
  const shown = Math.min(total, SEARCH_MAX);
  const l = getLang();
  count.textContent = l === 'en' ? `${shown} result${shown !== 1 ? 's' : ''}${total > SEARCH_MAX ? ` of ${total}` : ''}`
                    : l === 'es' ? `${shown} resultado${shown !== 1 ? 's' : ''}${total > SEARCH_MAX ? ` de ${total}` : ''}`
                    : `${shown} resultado${shown !== 1 ? 's' : ''}${total > SEARCH_MAX ? ` de ${total}` : ''}`;
  container.appendChild(count);

  results.slice(0, SEARCH_MAX).forEach(({ e, snippet }) => {
    const item = document.createElement('div');
    item.className = 'search-result-item';

    // Region badge
    if (e.region) {
      const badge = document.createElement('span');
      badge.className = 'search-region';
      badge.textContent = e.region;
      item.appendChild(badge);
    }

    const name = document.createElement('strong');
    name.className = 'search-result-name';
    name.textContent = getEntityName(e);
    item.appendChild(name);

    const dates = formatYears(e);
    if (dates) {
      const d = document.createElement('span');
      d.className = 'search-result-dates';
      d.textContent = dates;
      item.appendChild(d);
    }

    if (snippet) {
      const p = document.createElement('p');
      p.className = 'search-result-snippet';
      p.innerHTML = snippet; // safe: HTML-escaped in makeSnippet
      item.appendChild(p);
    }

    item.addEventListener('click', () => {
      navigateToEntity(e);
    });

    container.appendChild(item);
  });
}

function navigateToEntity(e) {
  // If entity is in current graph, highlight/show info panel
  const graphEnts = window.grafoAtual ? window.grafoAtual.entidades : [];
  const inGraph = graphEnts.find(g => g.id === e.id);

  if (inGraph) {
    if (window.mostrarInfo)      window.mostrarInfo(inGraph);
    if (window.onHerodonoNodeClick) window.onHerodonoNodeClick(inGraph);
    // Try to center the node in graph if we have a highlight function
    if (window.highlightNode)    window.highlightNode(inGraph.id);
  } else {
    // Not visible — show info panel with data and context from all loaded
    if (window.mostrarInfo)      window.mostrarInfo(e);
    if (window.onHerodonoNodeClick) window.onHerodonoNodeClick(e);
  }

  // Collapse the search results
  const panel = document.getElementById('search-results-panel');
  if (panel) panel.classList.add('hidden');
  const input = document.getElementById('search-input');
  if (input) { input.value = ''; input.blur(); }
}

// ── Debounce ──────────────────────────────────────

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── Init ──────────────────────────────────────────

export function initSearch() {
  const input   = document.getElementById('search-input');
  const panel   = document.getElementById('search-results-panel');
  const clearBtn = document.getElementById('search-clear');

  if (!input || !panel) return;

  const doSearch = debounce((query) => {
    const q = query.trim();

    if (!q) {
      clearResults(panel);
      panel.classList.add('hidden');
      if (clearBtn) clearBtn.classList.add('hidden');
      return;
    }

    if (clearBtn) clearBtn.classList.remove('hidden');

    const all = (window.todosOsDados && window.todosOsDados.entidades)
                ? window.todosOsDados.entidades
                : (window.grafoAtual ? window.grafoAtual.entidades : []);

    const results = all
      .map(e => {
        const { score, snippet } = scoreEntity(e, q);
        return score > 0 ? { e, score, snippet } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    renderResults(results, q, panel);
  }, 200);

  input.addEventListener('input', (ev) => doSearch(ev.target.value));

  input.addEventListener('focus', () => {
    if (input.value.trim()) panel.classList.remove('hidden');
  });

  // Click outside closes results
  document.addEventListener('click', (ev) => {
    const wrap = document.getElementById('search-wrapper');
    if (wrap && !wrap.contains(ev.target)) {
      panel.classList.add('hidden');
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearResults(panel);
      panel.classList.add('hidden');
      clearBtn.classList.add('hidden');
      input.focus();
    });
  }

  // Keyboard navigation
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      panel.classList.add('hidden');
      input.blur();
    }
    if (ev.key === 'Enter') {
      const first = panel.querySelector('.search-result-item');
      if (first) first.click();
    }
  });
}
