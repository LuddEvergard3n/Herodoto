/**
 * LEGEND FILTER — ÓRION v6.1
 * Legenda interativa "Tipos Históricos".
 * Clique em um tipo: filtra nós por categoria via opacity.
 * NÃO remove nós do DOM.
 */

// Pigmentos históricos — sem saturação moderna
const TYPE_DEFS = [
  { id: 'political',     color: '#2b4b7e',
    label: { pt: 'Político',     en: 'Political',     es: 'Político' },
    def:   { pt: 'Repúblicas, impérios, tratados e estruturas de governo.',
             en: 'Republics, empires, treaties and structures of government.',
             es: 'Repúblicas, imperios, tratados y estructuras de gobierno.' } },
  { id: 'war',           color: '#8b2e1a',
    label: { pt: 'Guerra',       en: 'War',           es: 'Guerra' },
    def:   { pt: 'Conflitos armados, batalhas e invasões.',
             en: 'Armed conflicts, battles and invasions.',
             es: 'Conflictos armados, batallas e invasiones.' } },
  { id: 'economic',      color: '#a0622a',
    label: { pt: 'Econômico',    en: 'Economic',      es: 'Económico' },
    def:   { pt: 'Ciclos econômicos, comércio e crises.',
             en: 'Economic cycles, trade and crises.',
             es: 'Ciclos económicos, comercio y crisis.' } },
  { id: 'cultural',      color: '#5c2d6e',
    label: { pt: 'Cultural',     en: 'Cultural',      es: 'Cultural' },
    def:   { pt: 'Arte, renascimento e movimentos culturais.',
             en: 'Art, renaissance and cultural movements.',
             es: 'Arte, renacimiento y movimientos culturales.' } },
  { id: 'religious',     color: '#2e6b4f',
    label: { pt: 'Religioso',    en: 'Religious',     es: 'Religioso' },
    def:   { pt: 'Reformas, cismas e movimentos religiosos.',
             en: 'Reforms, schisms and religious movements.',
             es: 'Reformas, cismas y movimientos religiosos.' } },
  { id: 'social',        color: '#b07a28',
    label: { pt: 'Social',       en: 'Social',        es: 'Social' },
    def:   { pt: 'Ideologias, movimentos sociais e abolição.',
             en: 'Ideologies, social movements and abolition.',
             es: 'Ideologías, movimientos sociales y abolición.' } },
  { id: 'technological', color: '#3d3d3d',
    label: { pt: 'Tecnológico',  en: 'Technological', es: 'Tecnológico' },
    def:   { pt: 'Tecnologias, táticas militares e inovações.',
             en: 'Technologies, military tactics and innovations.',
             es: 'Tecnologías, tácticas militares e innovaciones.' } },
  { id: 'intellectual',  color: '#4a2060',
    label: { pt: 'Intelectual',  en: 'Intellectual',  es: 'Intelectual' },
    def:   { pt: 'Iluminismo, filosofia e pensamento crítico.',
             en: 'Enlightenment, philosophy and critical thought.',
             es: 'Ilustración, filosofía y pensamiento crítico.' } },
  { id: 'person',        color: '#8a6a20',
    label: { pt: 'Pessoa',       en: 'Person',        es: 'Persona' },
    def:   { pt: 'Figuras históricas individuais.',
             en: 'Individual historical figures.',
             es: 'Figuras históricas individuales.' } },
  { id: 'prehistoric',   color: '#6b5840',
    label: { pt: 'Pré-Histórico', en: 'Prehistoric',  es: 'Prehistórico' },
    def:   { pt: 'Períodos e culturas anteriores à escrita.',
             en: 'Periods and cultures before writing.',
             es: 'Períodos y culturas anteriores a la escritura.' } },
  { id: 'natural',       color: '#4a7a4a',
    label: { pt: 'Natural',      en: 'Natural',       es: 'Natural' },
    def:   { pt: 'Fenômenos naturais, clima e ambiente.',
             en: 'Natural phenomena, climate and environment.',
             es: 'Fenómenos naturales, clima y medio ambiente.' } },
  { id: 'scientific',    color: '#2a6080',
    label: { pt: 'Científico',   en: 'Scientific',    es: 'Científico' },
    def:   { pt: 'Descobertas científicas e avanços do conhecimento.',
             en: 'Scientific discoveries and advances in knowledge.',
             es: 'Descubrimientos científicos y avances del conocimiento.' } },
];

function getLegendLang() {
  return window.getCurrentLang ? window.getCurrentLang() : 'pt';
}

function tType(obj) {
  const l = getLegendLang();
  return obj[l] || obj.pt || '';
}

// Estado: quais tipos estão ativos na legenda
const activeTypes = new Set(TYPE_DEFS.map(t => t.id));

function applyLegendFilter() {
  d3.selectAll('.node')
    .transition().duration(250)
    .style('opacity', d => {
      if (!d) return 1;
      const type = d.type || 'political';
      return activeTypes.has(type) ? 1 : 0.06;
    })
    .style('pointer-events', d => {
      if (!d) return 'all';
      const type = d.type || 'political';
      return activeTypes.has(type) ? 'all' : 'none';
    });

  d3.selectAll('.label')
    .transition().duration(250)
    .style('opacity', d => {
      if (!d) return 1;
      const type = d.type || 'political';
      return activeTypes.has(type) ? 1 : 0;
    });

  d3.selectAll('.link')
    .transition().duration(250)
    .style('opacity', d => {
      if (!d || !d.source || !d.target) return 0.4;
      const sType = (d.source.type || 'political');
      const tType = (d.target.type || 'political');
      const sVis = activeTypes.has(sType);
      const tVis = activeTypes.has(tType);
      if (sVis && tVis) return 0.4;
      if (sVis || tVis) return 0.1;
      return 0;
    });
}

function toggleType(typeId, btn) {
  if (activeTypes.has(typeId)) {
    // Desativar — não permitir desativar todos
    if (activeTypes.size === 1) return;
    activeTypes.delete(typeId);
    btn.classList.remove('legend-active');
    btn.classList.add('legend-inactive');
  } else {
    activeTypes.add(typeId);
    btn.classList.add('legend-active');
    btn.classList.remove('legend-inactive');
  }
  applyLegendFilter();
}

function buildLegend() {
  const container = document.getElementById('legend-filter-items');
  if (!container) return;

  while (container.firstChild) container.removeChild(container.firstChild);

  TYPE_DEFS.forEach(type => {
    const item = document.createElement('div');
    item.className = 'legend-item legend-active';
    item.setAttribute('data-type', type.id);
    item.title = tType(type.def);
    item.style.cursor = 'pointer';

    const dot = document.createElement('span');
    dot.className = 'legend-dot';
    dot.style.background = type.color;
    item.appendChild(dot);

    const info = document.createElement('div');
    info.className = 'legend-info';

    const label = document.createElement('span');
    label.className = 'legend-label';
    label.setAttribute('data-legend-type', type.id);
    label.textContent = tType(type.label);
    info.appendChild(label);

    const def = document.createElement('span');
    def.className = 'legend-def';
    def.setAttribute('data-legend-def', type.id);
    def.textContent = tType(type.def);
    info.appendChild(def);

    item.appendChild(info);

    item.addEventListener('click', () => toggleType(type.id, item));

    container.appendChild(item);
  });
}

export function resetLegendFilter() {
  TYPE_DEFS.forEach(t => activeTypes.add(t.id));
  document.querySelectorAll('.legend-item').forEach(el => {
    el.classList.add('legend-active');
    el.classList.remove('legend-inactive');
  });
  applyLegendFilter();
}

export function refreshLegendLang() {
  const lang = getLegendLang();
  TYPE_DEFS.forEach(type => {
    const labelEl = document.querySelector(`[data-legend-type="${type.id}"]`);
    const defEl   = document.querySelector(`[data-legend-def="${type.id}"]`);
    const item    = document.querySelector(`.legend-item[data-type="${type.id}"]`);
    if (labelEl) labelEl.textContent = tType(type.label);
    if (defEl)   defEl.textContent   = tType(type.def);
    if (item)    item.title          = tType(type.def);
  });
  // Header title
  const header = document.querySelector('.legend-filter-header span');
  const TITLES = { pt:'Tipos Históricos', en:'Historical Types', es:'Tipos Históricos' };
  if (header) header.textContent = TITLES[lang] || TITLES.pt;
}

export function initLegendFilter() {
  buildLegend();

  const btnReset = document.getElementById('legend-reset');
  if (btnReset) btnReset.addEventListener('click', resetLegendFilter);

  // Colapsar/expandir
  const toggle = document.getElementById('legend-toggle');
  const body   = document.getElementById('legend-filter-body');
  if (toggle && body) {
    toggle.addEventListener('click', () => {
      const collapsed = body.classList.toggle('legend-collapsed');
      toggle.textContent = collapsed ? '+' : '−';
    });
  }
}
