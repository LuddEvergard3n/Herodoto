/**
 * GUIDED MODE — Heródoto v7.14
 * Modo Exploração Guiada: sequência narrativa pelos nós do grafo.
 * - Destaque (anel pulsante) no nó atual
 * - Pan + zoom suave para o nó ao avançar/retroceder
 * - Links conectados ao nó atual ficam mais visíveis
 * - Textos traduzidos via i18n
 */

import { focusNode, setGuidedHighlight } from './graph.js';
import { showContextPanel } from './context-panel.js';
import { TRANSLATIONS } from './i18n.js';

let sequence    = [];
let currentIdx  = 0;
let isActive    = false;

function getLang() {
  return window.getCurrentLang ? window.getCurrentLang() : 'pt';
}

function t(key) {
  const map = TRANSLATIONS[getLang()] || TRANSLATIONS.pt;
  return map[key] || TRANSLATIONS.pt[key] || key;
}

function getName(e) {
  const lang = getLang();
  if (lang === 'en' && e.nome_en) return e.nome_en;
  if (lang === 'es' && e.nome_es) return e.nome_es;
  return e.nome || e.id;
}

function getDesc(e) {
  const lang = getLang();
  const field = lang === 'en' ? 'descricao_en' : lang === 'es' ? 'descricao_es' : 'descricao';
  const raw = e[field] || e.descricao || '';
  return raw.length > 300 ? raw.slice(0, 300).trimEnd() + '\u2026' : raw;
}

/**
 * Ordena entidades por importancia + data para a sequencia narrativa.
 */
function buildSequence(entidades) {
  const pool = entidades.filter(e => e.visible !== false);
  const scored = pool.map(e => ({
    e,
    score: (e.importancia ? 2 : 0) + (e.inicio ? 1 : 0)
  }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.e.inicio ?? 9999999) - (b.e.inicio ?? 9999999);
  });
  return scored.map(s => s.e);
}

/**
 * Aplica highlight visual: escurece nos/links nao relevantes,
 * destaca links conectados, adiciona anel pulsante no no atual.
 */
function applyHighlight(current) {
  if (!current) return;
  const currentId = current.id;

  d3.selectAll('.node')
    .transition().duration(350)
    .style('opacity', d => (d && d.id === currentId) ? 1 : 0.07);

  d3.selectAll('.label')
    .transition().duration(350)
    .style('opacity', d => (d && d.id === currentId) ? 1 : 0);

  d3.selectAll('.link')
    .transition().duration(350)
    .style('opacity', d => {
      const src = d.source && d.source.id ? d.source.id : d.source;
      const tgt = d.target && d.target.id ? d.target.id : d.target;
      return (src === currentId || tgt === currentId) ? 0.65 : 0.04;
    })
    .style('stroke-width', d => {
      const src = d.source && d.source.id ? d.source.id : d.source;
      const tgt = d.target && d.target.id ? d.target.id : d.target;
      const base = (d.intensidade || 0.5) * 3;
      return (src === currentId || tgt === currentId) ? base * 2 : base;
    });

  setGuidedHighlight(currentId);
  focusNodeAboveBox(current);
}

/**
 * Pan + zoom para centralizar o nó acima do guided-box.
 * Usa yBias = altura do box para deslocar o ponto de foco para cima.
 */
function focusNodeAboveBox(entity) {
  const box  = document.getElementById('guided-box');
  const bias = (box && !box.classList.contains('hidden'))
    ? box.offsetHeight + 50   // 50px breathing room between node and box top
    : 0;
  focusNode(entity, bias);
}

/**
 * Atualiza a caixa de texto do modo guiado e aplica highlight.
 */
function highlightCurrent() {
  if (!sequence.length) return;
  const current = sequence[currentIdx];

  applyHighlight(current);

  const box     = document.getElementById('guided-box');
  const content = document.getElementById('guided-content');
  if (!box || !content) return;

  while (content.firstChild) content.removeChild(content.firstChild);

  const counter = document.createElement('span');
  counter.className = 'guided-counter';
  counter.textContent = (currentIdx + 1) + ' / ' + sequence.length;
  content.appendChild(counter);

  const h = document.createElement('strong');
  h.textContent = getName(current);
  content.appendChild(h);

  if (current.importancia) {
    const imp = document.createElement('p');
    imp.className = 'guided-importancia';
    imp.textContent = current.importancia;
    content.appendChild(imp);
  }

  const desc = getDesc(current);
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc;
    content.appendChild(p);
  }

  const btnPrev = document.getElementById('btn-guided-prev');
  const btnNext = document.getElementById('btn-guided-next');
  const btnExit = document.getElementById('btn-guided-exit');
  if (btnPrev) btnPrev.textContent = t('guided_prev');
  if (btnNext) btnNext.textContent = t('guided_next');
  if (btnExit) btnExit.textContent = t('guided_exit');

  box.classList.remove('hidden');

  // Open info panel (right side — description)
  if (window.mostrarInfo) window.mostrarInfo(current);

  // Open context panel (left side — "No mesmo período")
  const all = window.grafoAtual ? window.grafoAtual.entidades : [];
  showContextPanel(current, all);
}

function activate() {
  const grafo = window.grafoAtual;
  if (!grafo || !grafo.entidades || !grafo.entidades.length) {
    alert(t('guided_no_data'));
    return;
  }

  isActive   = true;
  currentIdx = 0;
  sequence   = buildSequence(grafo.entidades);

  if (!sequence.length) {
    alert(t('guided_no_data'));
    return;
  }

  const btn = document.getElementById('btn-guided-mode');
  if (btn) btn.classList.add('guided-active');
  highlightCurrent();
}

function deactivate() {
  isActive = false;
  sequence = [];

  const btn = document.getElementById('btn-guided-mode');
  if (btn) btn.classList.remove('guided-active');

  const box = document.getElementById('guided-box');
  if (box) box.classList.add('hidden');

  setGuidedHighlight(null);

  const grafo = window.grafoAtual;
  if (grafo && grafo.entidades) {
    d3.selectAll('.node')
      .transition().duration(350)
      .style('opacity', d => (d && d.visible === false) ? 0.08 : 1);
    d3.selectAll('.label')
      .transition().duration(350)
      .style('opacity', d => (d && d.visible === false) ? 0 : 1);
    d3.selectAll('.link')
      .transition().duration(350)
      .style('opacity', 0.4)
      .style('stroke-width', d => (d.intensidade || 0.5) * 3);
  }
}

function goNext() {
  if (!isActive || !sequence.length) return;
  currentIdx = (currentIdx + 1) % sequence.length;
  highlightCurrent();
}

function goPrev() {
  if (!isActive || !sequence.length) return;
  currentIdx = (currentIdx - 1 + sequence.length) % sequence.length;
  highlightCurrent();
}

export function initGuidedMode() {
  const btnToggle = document.getElementById('btn-guided-mode');
  const btnNext   = document.getElementById('btn-guided-next');
  const btnPrev   = document.getElementById('btn-guided-prev');
  const btnExit   = document.getElementById('btn-guided-exit');

  if (btnToggle) {
    btnToggle.textContent = t('guided_btn');
    btnToggle.addEventListener('click', () => {
      isActive ? deactivate() : activate();
    });
  }

  if (btnNext) btnNext.addEventListener('click', goNext);
  if (btnPrev) btnPrev.addEventListener('click', goPrev);
  if (btnExit) btnExit.addEventListener('click', deactivate);

  document.addEventListener('keydown', (e) => {
    if (!isActive) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goPrev();
    if (e.key === 'Escape') deactivate();
  });
}

/**
 * Atualiza os textos da UI do modo guiado apos mudanca de idioma.
 * Chamado em main.js apos applyTranslations().
 */
export function updateGuidedLang() {
  const btn = document.getElementById('btn-guided-mode');
  if (btn && !btn.classList.contains('guided-active')) {
    btn.textContent = t('guided_btn');
  }
  if (!isActive) return;
  highlightCurrent();
}
