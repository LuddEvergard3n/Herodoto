import { getEntityLabel, getEntityField, formatarAno, TRANSLATIONS } from './i18n.js';
import { CORES, getCorPorId } from './utils.js';
import { getNodeColor } from './filtros.js';

let grafoAtual = null;
let lastShownEntityId = null;
const CANVAS_THRESHOLD = 800;

// FIX #4: Armazenar referências dos event listeners globais para cleanup
let globalPointerMoveHandler = null;
let globalPointerUpHandler = null;

// Referências para pan/zoom programático (modo guiado)
let _svgEl = null;
let _svgZoom = null;
let _svgG = null;
window._guidedCurrentId = null;

/**
 * Anima o grafo para centralizar na entidade dada.
 * Chamado pelo modo guiado ao avançar/retroceder.
 */
export function focusNode(entity) {
  if (!_svgEl || !_svgZoom || !entity || entity.x == null) return;
  const container = document.getElementById('grafo');
  const w = container ? container.clientWidth  : window.innerWidth  - 300;
  const h = container ? container.clientHeight : window.innerHeight - 140;
  const k = 2.0;
  const tx = w / 2 - k * entity.x;
  const ty = h / 2 - k * entity.y;
  _svgEl.transition().duration(700).ease(d3.easeCubicInOut).call(
    _svgZoom.transform,
    d3.zoomIdentity.translate(tx, ty).scale(k)
  );
}

/**
 * Coloca (ou remove) o anel pulsante no nó atual do modo guiado.
 * entityId = null remove o anel.
 */
export function setGuidedHighlight(entityId) {
  window._guidedCurrentId = entityId;
  // O anel é reposicionado pelo tick; aqui só criamos/removemos
  const g = _svgG;
  if (!g || g.empty()) return;
  g.selectAll('.guided-ring').remove();
  if (!entityId) return;
  const entity = grafoAtual && grafoAtual.entidades
    ? grafoAtual.entidades.find(e => e.id === entityId)
    : null;
  if (!entity || entity.x == null) return;
  g.insert('circle', ':first-child')
    .attr('class', 'guided-ring')
    .attr('cx', entity.x)
    .attr('cy', entity.y)
    .attr('r', 30);
}

export function updateLabels() {
  try {
    d3.selectAll('.label').each(function(d) {
      const datum = d || this.__data__;
      if (datum) d3.select(this).text(getEntityLabel(datum));
    });
  } catch (e) {}
  if (grafoAtual && grafoAtual.renderer === 'canvas' && grafoAtual.draw) grafoAtual.draw();
}

export function updateInfoPanel() {
  if (!lastShownEntityId) return;
  const painel = document.getElementById('info-painel');
  if (painel && painel.classList.contains('hidden')) return;
  const entities = (grafoAtual && grafoAtual.entidades) || [];
  const entidade = entities.find(e => e.id === lastShownEntityId);
  if (entidade) mostrarInfo(entidade);
}

export function mostrarInfo(entidade) {
  const painel = document.getElementById('info-painel');
  const conteudo = document.getElementById('info-conteudo');
  
  // FIX #3: Limpar usando DOM ao invés de innerHTML
  while (conteudo.firstChild) {
    conteudo.removeChild(conteudo.firstChild);
  }
  
  const map = TRANSLATIONS[window.getCurrentLang ? window.getCurrentLang() : 'pt'] || TRANSLATIONS.pt;
  const tipoLabel = {
    conceito: map.tipo_conceito || 'Conceito Político',
    estrutura: map.tipo_estrutura || 'Estrutura Social',
    periodo: map.tipo_periodo || 'Período Histórico',
    conflito: map.tipo_conflito || 'Conflito',
    evento: map.tipo_evento || 'Evento'
  };
  
  const h3 = document.createElement('h3'); 
  h3.textContent = getEntityLabel(entidade) || ''; 
  conteudo.appendChild(h3);
  
  const spanTipo = document.createElement('span'); 
  spanTipo.className = 'tipo'; 
  spanTipo.textContent = tipoLabel[entidade.tipo] || entidade.tipo || ''; 
  conteudo.appendChild(spanTipo);
  
  const p = document.createElement('p'); 
  p.textContent = getEntityField(entidade, 'descricao') || ''; 
  conteudo.appendChild(p);
  
  const detalhe = document.createElement('div'); 
  detalhe.className = 'detalhe';
  
  // FIX #5: Verificar se inicio/fim existem antes de formatar
  if (entidade.inicio !== undefined || entidade.fim !== undefined) {
    const periodoStrong = document.createElement('strong'); 
    periodoStrong.textContent = (map.periodo || 'Período') + ':'; 
    detalhe.appendChild(periodoStrong);
    
    const periodoText = document.createElement('div');
    const inicioStr = entidade.inicio !== undefined ? formatarAno(entidade.inicio) : '?';
    const fimStr = entidade.fim !== undefined ? formatarAno(entidade.fim) : '?';
    periodoText.textContent = `${inicioStr} ${(map.ate || 'até')} ${fimStr}`;
    detalhe.appendChild(periodoText);
  }
  
  // FIX #6: Renomear para "Tags" ao invés de duplicar "Contexto"
  const tagsStrong = document.createElement('strong'); 
  tagsStrong.textContent = 'Tags:';
  tagsStrong.style.marginTop = '8px'; 
  detalhe.appendChild(tagsStrong);
  
  const tagsText = document.createElement('div');
  if (Array.isArray(entidade.tags)) { 
    tagsText.textContent = entidade.tags.map(t => map[t] || t).join(', '); 
  } else { 
    tagsText.textContent = ''; 
  }
  detalhe.appendChild(tagsText);
  
  const importanciaVal = getEntityField(entidade, 'importancia');
  if (importanciaVal) { 
    const impStrong = document.createElement('strong'); 
    impStrong.textContent = (map.importancia || 'Importância') + ':'; 
    impStrong.style.marginTop = '8px'; 
    detalhe.appendChild(impStrong); 
    
    const impText = document.createElement('div'); 
    impText.textContent = importanciaVal; 
    detalhe.appendChild(impText); 
  }
  
  // Context summary (auto-generated if missing)
  if (entidade.contextSummary) {
    const ctxStrong = document.createElement('strong'); 
    ctxStrong.textContent = 'Resumo:'; // FIX #6: Mudado de "Contexto" para "Resumo"
    ctxStrong.style.marginTop = '8px'; 
    detalhe.appendChild(ctxStrong);
    
    const ctxText = document.createElement('div'); 
    ctxText.textContent = entidade.contextSummary; 
    detalhe.appendChild(ctxText);
  }
  
  // Related events
  if (Array.isArray(entidade.relatedEvents) && entidade.relatedEvents.length) {
    const relStrong = document.createElement('strong'); 
    relStrong.textContent = 'Eventos Relacionados:'; 
    relStrong.style.marginTop = '8px'; 
    detalhe.appendChild(relStrong);
    
    const list = document.createElement('ul'); 
    list.style.marginTop = '6px'; 
    list.style.paddingLeft = '18px';
    
    entidade.relatedEvents.slice(0,5).forEach(ev => {
      const li = document.createElement('li');
      li.textContent = `${ev.year || ''} — ${ev.title || ev.id}`;
      list.appendChild(li);
    });
    detalhe.appendChild(list);
  }
  
  conteudo.appendChild(detalhe);

  // Botão "Cadeia de consequências"
  const btnChain = document.createElement('button');
  btnChain.className = 'btn-chain';
  btnChain.textContent = map.btn_chain || 'Cadeia de consequencias';
  btnChain.addEventListener('click', () => {
    if (window.showChainPanel) window.showChainPanel(entidade);
  });
  conteudo.appendChild(btnChain);

  // Botão "Comparar" — envia entidade ao painel de comparação
  const btnCompare = document.createElement('button');
  btnCompare.className = 'btn-chain';
  btnCompare.style.marginTop = '4px';
  btnCompare.textContent = map.btn_compare || 'Comparar';
  btnCompare.addEventListener('click', () => {
    if (window.compareReceiveEntity) {
      // Activate compare mode if not already active
      if (window.isCompareActive && !window.isCompareActive()) {
        const btnC = document.getElementById('btn-compare');
        if (btnC) btnC.click();
      }
      window.compareReceiveEntity(entidade);
    }
  });
  conteudo.appendChild(btnCompare);

  painel.classList.remove('hidden');
  lastShownEntityId = entidade.id;
}

export function fecharInfo() { 
  document.getElementById('info-painel').classList.add('hidden'); 
}

export function renderizarGrafo(entidades, relacoes) {
  try { 
    console.log('renderizarGrafo called', entidades && entidades.length, 'entities,', relacoes && relacoes.length, 'relations'); 
  } catch(e) {}
  
  if (grafoAtual && grafoAtual.simulation) grafoAtual.simulation.stop();
  
  // FIX #4: Remover event listeners globais antigos
  if (globalPointerMoveHandler) {
    window.removeEventListener('pointermove', globalPointerMoveHandler);
    globalPointerMoveHandler = null;
  }
  if (globalPointerUpHandler) {
    window.removeEventListener('pointerup', globalPointerUpHandler);
    globalPointerUpHandler = null;
  }
  
  d3.select('#grafo').selectAll('*').remove();
  
  const container = document.getElementById('grafo');
  let width = container.clientWidth;
  let height = container.clientHeight;
  
  // FIX #8: Warning se width/height inválidos
  if (!width || !height) { 
    const sidebar = document.querySelector('.sidebar'); 
    const header = document.querySelector('header'); 
    const sidebarW = sidebar ? sidebar.clientWidth : 300; 
    const headerH = header ? header.clientHeight : 140; 
    width = window.innerWidth - sidebarW; 
    height = Math.max(300, window.innerHeight - headerH - 40); 
    
    if (width <= 0 || height <= 0) {
      console.warn('[!]️ Dimensões inválidas para grafo:', { width, height });
      width = Math.max(300, width);
      height = Math.max(300, height);
    }
  }
  
  const svg = d3.select('#grafo')
    .append('svg')
    .attr('width','100%')
    .attr('height','100%')
    .attr('viewBox',`0 0 ${width} ${height}`)
    .attr('preserveAspectRatio','xMidYMid meet');
    
  const g = svg.append('g').attr('class','grafo-group');
  _svgG = d3.select('.grafo-group'); // set after append
  
  const zoomBehavior = d3.zoom()
    .scaleExtent([0.05,20])
    .on('zoom',(event) => { 
      g.attr('transform', event.transform); 
    });
  svg.call(zoomBehavior);
  _svgEl = svg;
  _svgZoom = zoomBehavior;
  // also update module-level g ref after it's been appended
  _svgG = g;
    
  const nodeMap = new Map(entidades.map(e=>[e.id,e]));
  const links = relacoes.map(r=>({ 
    source: nodeMap.get(r.origem), 
    target: nodeMap.get(r.destino), 
    intensidade: r.intensidade, 
    tipo: r.tipo 
  })).filter(l=>l.source && l.target);
  
  const LARGE_THRESHOLD = 400; 
  const largeMode = entidades.length >= LARGE_THRESHOLD;
  
  // ═══════════════════════════════════════════════════════════
  // Agrupa nós por dataset para separação visual suave
  const datasetGroups = new Map();
  entidades.forEach(e => {
    const ds = e.dataset || 'unknown';
    if (!datasetGroups.has(ds)) datasetGroups.set(ds, []);
    datasetGroups.get(ds).push(e);
  });
  const numDatasets = datasetGroups.size;
  const datasets    = [...datasetGroups.keys()];

  // Posição X temporal global
  const minYear = -2500000, maxYear = 2024;
  const getTemporalPosition = (d) => {
    if (!d.inicio) return width / 2;
    return ((d.inicio - minYear) / (maxYear - minYear)) * width * 1.5;
  };

  // Atribui faixa Y por dataset
  let groupIndex = 0;
  datasetGroups.forEach((nodes) => {
    const baseY = (groupIndex / Math.max(datasetGroups.size, 1)) * height;
    nodes.forEach(n => { n.targetY = baseY; });
    groupIndex++;
  });

  const simulation = d3.forceSimulation(entidades)
    .force('link',      d3.forceLink(links).id(d=>d.id).distance(largeMode ? 150 : 400))
    .force('charge',    d3.forceManyBody().strength(largeMode ? -400 : -1000))
    .force('collision', d3.forceCollide().radius(largeMode ? 45 : 110))
    .force('x',         d3.forceX(d => getTemporalPosition(d)).strength(0.05))
    .force('y',         d3.forceY(d => d.targetY || height / 2).strength(0.08))
    .alphaDecay(largeMode ? 0.015 : 0.01);

    const link = g.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('class', d => d.meta ? 'link meta-link' : 'link')
    .attr('stroke-width', d => {
      // Meta-relações (entre ecossistemas) são 3x mais grossas
      const baseWidth = (d.intensidade||0.5)*3;
      return d.meta ? baseWidth * 3 : baseWidth;
    })
    .attr('stroke', '#3b2b1f')
    .attr('stroke-dasharray', d => {
      if (d.tipo === 'tensao') return '4,6';   // traço pontilhado — tensão histórica
      return 'none';
    })
    .attr('opacity', d => {
      // Opacidade variável por intensidade — simula desbotamento de tinta de pena
      const base = d.meta ? 0.55 : Math.max(0.15, Math.min(0.48, (d.intensidade||0.5) * 0.58));
      return base;
    });
    
  const node = g.append('g')
    .selectAll('circle')
    .data(entidades)
    .join('circle')
    .attr('class','node')
    .attr('r', largeMode?6:20)
    .attr('fill', d => getNodeColor(d))
    .on('click', (event,d)=> { mostrarInfo(d); if (window.onHerodonoNodeClick) window.onHerodonoNodeClick(d); if (window.isCompareActive && window.isCompareActive()) window.compareReceiveEntity(d); })
    .call(d3.drag()
      .on('start', dragStart)
      .on('drag', dragging)
      .on('end', dragEnd));
      
  let label = null; 
  if (!largeMode) { 
    label = g.append('g')
      .selectAll('text')
      .data(entidades)
      .join('text')
      .attr('class','label')
      .text(d => getEntityLabel(d))
      .attr('text-anchor','middle')
      .attr('dy',-28); 
  }
  
  let tickCounter = 0; 
  simulation.on('tick', () => {
    tickCounter++;
    const skip = largeMode ? 3 : 1;
    if (tickCounter % skip !== 0) return;

    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y); 
      
    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y); 
      
    if (label) { 
      label
        .attr('x', d => d.x)
        .attr('y', d => d.y); 
    }

    // Mantém o anel do modo guiado rastreando o nó enquanto a simulação corre
    const currentId = window._guidedCurrentId;
    if (currentId) {
      const ring = g.select('.guided-ring');
      if (!ring.empty()) {
        const ent = grafoAtual && grafoAtual.entidades
          ? grafoAtual.entidades.find(e => e.id === currentId) : null;
        if (ent) { ring.attr('cx', ent.x).attr('cy', ent.y); }
      }
    }
  });
  
  function dragStart(event,d){ 
    if (!event.active) simulation.alphaTarget(0.3).restart(); 
    d.fx = d.x; 
    d.fy = d.y; 
  }
  
  function dragging(event,d){ 
    // Sem restrição de padding - deixa arrastar livremente
    d.fx = event.x; 
    d.fy = event.y; 
  }
  
  function dragEnd(event,d){ 
    if (!event.active) simulation.alphaTarget(0); 
    d.fx = null; 
    d.fy = null; 
  }
  
  grafoAtual = { entidades, relacoes: links, simulation };
  window.grafoAtual = grafoAtual; // Expor para filtros semânticos v6.0
  
  const useCanvas = (entidades.length >= CANVAS_THRESHOLD) || window.forcePerformance;
  if (useCanvas) { 
    d3.select('#grafo').selectAll('*').remove(); 
    try { 
      simulation.alpha(0.9).restart(); 
    } catch(e) {} 
    renderCanvasGrafo(entidades, links, width, height, simulation); 
    return; 
  }
  
  simulation.alpha(0.9).restart(); 
  updateLabels(); 
  updateInfoPanel();
}

export function renderCanvasGrafo(entidades, relacoes, width, height, simulation) {
  const container = document.getElementById('grafo'); 
  
  // FIX #3: Limpar usando DOM
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  const canvas = document.createElement('canvas'); 
  canvas.id = 'grafo-canvas'; 
  canvas.width = Math.max(1, Math.floor(width)); 
  canvas.height = Math.max(1, Math.floor(height)); 
  canvas.style.width = '100%'; 
  canvas.style.height = '100%'; 
  container.appendChild(canvas); 
  
  const ctx = canvas.getContext('2d');
  let transform = d3.zoomIdentity; 
  let quadtreeIndex = null; 
  
  const zoom = d3.zoom()
    .scaleExtent([0.05,20])
    .on('zoom',(event)=>{ 
      transform = event.transform; 
      draw(); 
    }); 
    
  d3.select(canvas).call(zoom);
  
  function roundedRect(ctx,x,y,w,h,r){ 
    if (ctx.roundRect) { 
      ctx.roundRect(x,y,w,h,r); 
      return; 
    } 
    const rad = Math.min(r,w/2,h/2); 
    ctx.beginPath(); 
    ctx.moveTo(x+rad,y); 
    ctx.arcTo(x+w,y,x+w,y+h,rad); 
    ctx.arcTo(x+w,y+h,x,y+h,rad); 
    ctx.arcTo(x,y+h,x,y,rad); 
    ctx.arcTo(x,y,x+w,y,rad); 
    ctx.closePath(); 
  }
  
  function clear(){ 
    ctx.save(); 
    ctx.setTransform(1,0,0,1,0,0); 
    ctx.clearRect(0,0,canvas.width,canvas.height); 
    ctx.restore(); 
  }
  
  let hoveredNode = null; 
  
  function draw(){ 
    clear(); 
    ctx.save(); 
    ctx.translate(transform.x, transform.y); 
    ctx.scale(transform.k, transform.k); 
    
    // FIX #7: Logar erro de quadtree
    try { 
      quadtreeIndex = d3.quadtree()
        .x(d=>d.x)
        .y(d=>d.y)
        .addAll(entidades); 
    } catch(e){ 
      console.warn('[!]️ Quadtree failed:', e);
      quadtreeIndex = null; 
    }
    
        // Renderizar linhas em duas passadas: primeiro normais, depois meta-relações
    for (let i=0;i<relacoes.length;i++){ 
      const l = relacoes[i];
      if (l.meta) continue; // Pular meta-relações nesta passada
      
      ctx.lineWidth = 1;
      // Traço de pena: marrom escuro com opacidade por intensidade
      const op = Math.max(0.12, Math.min(0.42, (l.intensidade||0.5)*0.52));
      ctx.strokeStyle = `rgba(59,43,31,${op})`;
      ctx.beginPath(); 
      ctx.moveTo(l.source.x, l.source.y); 
      ctx.lineTo(l.target.x, l.target.y); 
      ctx.stroke(); 
    }
    
    // Segunda passada: meta-relações (linhas grossas)
    for (let i=0;i<relacoes.length;i++){ 
      const l = relacoes[i];
      if (!l.meta) continue; // Só meta-relações
      
      ctx.lineWidth = 4; 
      ctx.strokeStyle = 'rgba(59,43,31,0.52)'; 
      ctx.beginPath(); 
      ctx.moveTo(l.source.x, l.source.y); 
      ctx.lineTo(l.target.x, l.target.y); 
      ctx.stroke(); 
    }
    
    const r = entidades.length>400?4:8; 
    for (let i=0;i<entidades.length;i++){ 
      const n = entidades[i]; 
      ctx.beginPath(); 
      ctx.fillStyle = getNodeColor(n); 
      ctx.arc(n.x, n.y, r, 0, Math.PI*2); 
      ctx.fill(); 
    }
    
    if (hoveredNode){ 
      const hn = hoveredNode; 
      ctx.save(); 
      ctx.font = '12px "Crimson Text", Georgia, serif'; 
      ctx.fillStyle = 'rgba(0,0,0,0.8)'; 
      const label = getEntityLabel(hn); 
      const padding = 6; 
      const metrics = ctx.measureText(label); 
      const w = metrics.width + padding*2; 
      const h = 18 + padding; 
      ctx.fillStyle = 'rgba(246,241,228,0.95)'; 
      ctx.beginPath(); 
      roundedRect(ctx, hn.x + r + 6, hn.y - h/2, w, h, 4); 
      ctx.fill(); 
      ctx.fillStyle = '#2a1e0f'; 
      ctx.strokeStyle = 'rgba(176,152,112,0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(label, hn.x + r + 6 + padding, hn.y + 5); 
      ctx.restore(); 
    }
    
    ctx.restore(); 
  }
  
  canvas.addEventListener('click',(ev)=>{ 
    const rect = canvas.getBoundingClientRect(); 
    const x = (ev.clientX - rect.left - transform.x) / transform.k; 
    const y = (ev.clientY - rect.top - transform.y) / transform.k; 
    let found = null; 
    if (quadtreeIndex) found = quadtreeIndex.find(x,y,20); 
    if (found) { mostrarInfo(found); if (window.onHerodonoNodeClick) window.onHerodonoNodeClick(found); if (window.isCompareActive && window.isCompareActive()) window.compareReceiveEntity(found); }
  });
  
  canvas.addEventListener('pointermove',(ev)=>{ 
    const rect = canvas.getBoundingClientRect(); 
    const x = (ev.clientX - rect.left - transform.x) / transform.k; 
    const y = (ev.clientY - rect.top - transform.y) / transform.k; 
    let candidate = null; 
    if (quadtreeIndex) candidate = quadtreeIndex.find(x,y,12); 
    hoveredNode = candidate; 
    draw(); 
  });
  
  let draggingNode = null; 
  
  canvas.addEventListener('pointerdown',(ev)=>{ 
    const rect = canvas.getBoundingClientRect(); 
    const x = (ev.clientX - rect.left - transform.x) / transform.k; 
    const y = (ev.clientY - rect.top - transform.y) / transform.k; 
    let candidate = null; 
    if (quadtreeIndex) candidate = quadtreeIndex.find(x,y,20); 
    if (candidate) { 
      draggingNode = candidate; 
      candidate.fx = candidate.x; 
      candidate.fy = candidate.y; 
    } 
  });
  
  // FIX #4: Armazenar handlers para poder remover depois
  globalPointerMoveHandler = (ev) => {
    if (!draggingNode) return; 
    const rect = canvas.getBoundingClientRect(); 
    const x = (ev.clientX - rect.left - transform.x) / transform.k; 
    const y = (ev.clientY - rect.top - transform.y) / transform.k; 
    draggingNode.fx = x; 
    draggingNode.fy = y; 
    simulation.alpha(0.3).restart(); 
  };
  
  globalPointerUpHandler = () => {
    if (draggingNode) { 
      draggingNode.fx=null; 
      draggingNode.fy=null; 
      draggingNode=null; 
    } 
  };
  
  window.addEventListener('pointermove', globalPointerMoveHandler);
  window.addEventListener('pointerup', globalPointerUpHandler);
  
  simulation.on('tick', draw);
  grafoAtual = Object.assign(grafoAtual || {}, { 
    entidades, 
    relacoes, 
    simulation, 
    renderer: 'canvas', 
    draw 
  });
  window.grafoAtual = grafoAtual; // Expor para filtros semânticos v6.0
  
  draw();
}
