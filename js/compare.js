/**
 * COMPARE.JS — HERODOTO v7.18
 * Modo de Comparação — dois eventos lado a lado, estética manuscrito.
 * IMPORTANTE: O painel só abre quando AMBOS os slots estão preenchidos.
 * Enquanto apenas um está selecionado, mostra uma notificação sutil.
 */

const TC_MAP = {
  political:'#2b4b7e', war:'#8b2e1a', economic:'#a0622a',
  cultural:'#5c2d6e', religious:'#2e6b4f', social:'#b07a28',
  technological:'#556b2f', intellectual:'#4a2060', prehistoric:'#6b5840',
  natural:'#4a7a4a', scientific:'#2a6080',
};
const RLABELS = {
  pt:{Europe:'Europa',MiddleEast:'Oriente Médio',EastAsia:'Ásia Oriental',SouthAsia:'Sul da Ásia',
      SoutheastAsia:'Sudeste Asiático',Africa:'África',Americas:'Américas',Oceania:'Oceania',
      Global:'Global',Multiple:'Múltiplas',NorthAmerica:'América do Norte',SouthAmerica:'América do Sul',
      Mesoamerica:'Mesoamérica',Antarctica:'Antártica',CentralAsia:'Ásia Central',Mediterranean:'Mediterrâneo',Asia:'Ásia'},
  en:{Europe:'Europe',MiddleEast:'Middle East',EastAsia:'East Asia',SouthAsia:'South Asia',
      SoutheastAsia:'Southeast Asia',Africa:'Africa',Americas:'Americas',Oceania:'Oceania',
      Global:'Global',Multiple:'Multiple',NorthAmerica:'North America',SouthAmerica:'South America',
      Mesoamerica:'Mesoamerica',Antarctica:'Antarctica',CentralAsia:'Central Asia',Mediterranean:'Mediterranean',Asia:'Asia'},
  es:{Europe:'Europa',MiddleEast:'Oriente Medio',EastAsia:'Asia Oriental',SouthAsia:'Asia del Sur',
      SoutheastAsia:'Sudeste Asiático',Africa:'África',Americas:'Américas',Oceania:'Oceanía',
      Global:'Global',Multiple:'Múltiple',NorthAmerica:'América del Norte',SouthAmerica:'América del Sur',
      Mesoamerica:'Mesoamérica',Antarctica:'Antártida',CentralAsia:'Asia Central',Mediterranean:'Mediterráneo',Asia:'Asia'},
};
const I18N = {
  pt:{
    title:'Comparação de Eventos',
    instr:'Clique em dois eventos no grafo para comparar lado a lado.',
    waiting:'1 evento selecionado — clique em outro para comparar',
    emptyA:'Clique em um evento', emptyB:'Clique em outro evento',
    desc:'Descrição', imp:'Importância Histórica', tags:'Tags',
    period:'Período', dur:'Duração', region:'Região',
    overlap:'de sobreposição temporal',
    no_overlap:'Períodos sem sobreposição',
    shared:'tags em comum', clear:'Limpar',
    yr:'ano', yrs:'anos', close:'Fechar',
  },
  en:{
    title:'Event Comparison',
    instr:'Click two events on the graph to compare side by side.',
    waiting:'1 event selected — click another to compare',
    emptyA:'Click an event', emptyB:'Click another event',
    desc:'Description', imp:'Historical Importance', tags:'Tags',
    period:'Period', dur:'Duration', region:'Region',
    overlap:'temporal overlap',
    no_overlap:'No overlapping periods',
    shared:'shared tags', clear:'Clear',
    yr:'year', yrs:'years', close:'Close',
  },
  es:{
    title:'Comparación de Eventos',
    instr:'Haz clic en dos eventos del grafo para comparar.',
    waiting:'1 evento seleccionado — haz clic en otro para comparar',
    emptyA:'Haz clic en un evento', emptyB:'Haz clic en otro evento',
    desc:'Descripción', imp:'Importancia Histórica', tags:'Etiquetas',
    period:'Período', dur:'Duración', region:'Región',
    overlap:'de solapamiento temporal',
    no_overlap:'Sin solapamiento de períodos',
    shared:'etiquetas en común', clear:'Limpiar',
    yr:'año', yrs:'años', close:'Cerrar',
  },
};

// ── State ─────────────────────────────────────────────────────────────────

let overlayEl = null;
let toastEl   = null;
let isActive  = false;
let slots     = [null, null];

// ── Helpers ───────────────────────────────────────────────────────────────

const GL = () => window.getCurrentLang ? window.getCurrentLang() : 'pt';
const TR = k => (I18N[GL()]||I18N.pt)[k]||k;
const RL = r => r ? ((RLABELS[GL()]||RLABELS.en)[r]||r) : '';
const TC = t => TC_MAP[t]||TC_MAP.political;

function FY(y) {
  if(y==null) return '?';
  const a=Math.abs(Math.round(y));
  return y<0 ? a.toLocaleString()+(GL()==='en'?' BC':' a.C.') : a.toLocaleString();
}
function EN(e) {
  const l=GL();
  return (l==='en'&&e.nome_en)||(l==='es'&&e.nome_es)||e.nome||'';
}
function ED(e) {
  const l=GL();
  return (l==='en'&&e.descricao_en)||(l==='es'&&e.descricao_es)||e.descricao||'';
}
function EI(e) {
  const l=GL();
  return (l==='en'&&e.importancia_en)||(l==='es'&&e.importancia_es)||e.importancia||'';
}
function dur(e) {
  return(e&&e.inicio!=null&&e.fim!=null)?Math.abs(e.fim-e.inicio):null;
}
function overlap(a,b) {
  if(!a||!b||a.inicio==null||a.fim==null||b.inicio==null||b.fim==null) return null;
  const s=Math.max(Math.min(a.inicio,a.fim),Math.min(b.inicio,b.fim));
  const f=Math.min(Math.max(a.inicio,a.fim),Math.max(b.inicio,b.fim));
  return f>s?Math.round(f-s):0;
}
function sharedTags(a,b) {
  if(!a||!b) return [];
  const ta=new Set((a.tags||[]).map(t=>t.toLowerCase()));
  return (b.tags||[]).filter(t=>ta.has(t.toLowerCase()));
}

// ── Card builder ──────────────────────────────────────────────────────────

function buildCard(entity, idx) {
  if(!entity) {
    const el=document.createElement('div');
    el.className='cmp-empty';
    el.innerHTML=`<div class="cmp-empty-letter">${idx===0?'A':'B'}</div>
      <p class="cmp-empty-msg">${idx===0?TR('emptyA'):TR('emptyB')}</p>`;
    return el;
  }

  const other=slots[1-idx];
  const shared=sharedTags(entity,other);
  const sharedSet=new Set(shared.map(s=>s.toLowerCase()));
  const maxDur=Math.max(dur(entity)||0, other?dur(other)||0:0)||1;
  const color=TC(entity.type||'political');

  const card=document.createElement('div');
  card.className='cmp-card';

  // ── Accent line (color coded by type)
  const accent=document.createElement('div');
  accent.className='cmp-accent';
  accent.style.background=`linear-gradient(90deg,${color},${color}88)`;
  card.appendChild(accent);

  // ── Header
  const hdr=document.createElement('div');
  hdr.className='cmp-header';

  const name=document.createElement('h3');
  name.className='cmp-name';
  name.textContent=EN(entity);
  hdr.appendChild(name);

  const badge=document.createElement('span');
  badge.className='cmp-type-badge';
  badge.style.cssText=`background:${color}18;color:${color};border:1px solid ${color}44`;
  badge.textContent=(entity.type||entity.tipo||'').toUpperCase();
  hdr.appendChild(badge);

  if(entity.inicio!=null) {
    const dates=document.createElement('p');
    dates.className='cmp-dates';
    dates.textContent=FY(entity.inicio)+(entity.fim!=null?' → '+FY(entity.fim):'');
    hdr.appendChild(dates);
  }

  if(entity.region) {
    const reg=document.createElement('p');
    reg.className='cmp-region';
    reg.textContent=RL(entity.region);
    hdr.appendChild(reg);
  }

  // Duration bar
  const d=dur(entity);
  if(d!=null) {
    const pct=Math.min(1,d/maxDur)*100;
    const yrs=Math.round(d);
    const durWrap=document.createElement('div');
    durWrap.className='cmp-dur-wrap';
    durWrap.innerHTML=`
      <div class="cmp-dur-track">
        <div class="cmp-dur-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div>
      </div>
      <span class="cmp-dur-label">${yrs.toLocaleString()} ${yrs===1?TR('yr'):TR('yrs')}</span>`;
    hdr.appendChild(durWrap);
  }
  card.appendChild(hdr);

  // ── Body sections
  const body=document.createElement('div');
  body.className='cmp-body';

  const desc=ED(entity);
  if(desc) {
    const s=document.createElement('div'); s.className='cmp-section';
    s.innerHTML=`<p class="cmp-section-title">${TR('desc')}</p>`;
    const p=document.createElement('p'); p.className='cmp-text'; p.textContent=desc;
    s.appendChild(p); body.appendChild(s);
  }

  const imp=EI(entity);
  if(imp) {
    const s=document.createElement('div'); s.className='cmp-section';
    s.innerHTML=`<p class="cmp-section-title">${TR('imp')}</p>`;
    const p=document.createElement('p'); p.className='cmp-text cmp-imp'; p.textContent=imp;
    s.appendChild(p); body.appendChild(s);
  }

  if(entity.tags&&entity.tags.length) {
    const s=document.createElement('div'); s.className='cmp-section';
    s.innerHTML=`<p class="cmp-section-title">${TR('tags')}</p>`;
    const tw=document.createElement('div'); tw.className='cmp-tags';
    entity.tags.forEach(t=>{
      const span=document.createElement('span');
      span.className='cmp-tag'+(sharedSet.has(t.toLowerCase())?' shared':'');
      span.textContent=t;
      tw.appendChild(span);
    });
    s.appendChild(tw); body.appendChild(s);
  }
  card.appendChild(body);

  // Clear
  const clr=document.createElement('button');
  clr.className='cmp-clear'; clr.textContent=TR('clear');
  clr.addEventListener('click',()=>{ slots[idx]=null; renderOverlay(); });
  card.appendChild(clr);

  return card;
}

// ── Render overlay ────────────────────────────────────────────────────────

function renderOverlay() {
  if(!overlayEl) return;

  // Header text
  const instr=overlayEl.querySelector('.cmp-instr');
  if(instr) instr.textContent=TR('instr');

  // Overlap strip (only when both filled)
  const [a,b]=slots;
  const ovBar=overlayEl.querySelector('.cmp-overlap');
  if(ovBar) {
    if(a&&b) {
      const ov=overlap(a,b);
      const sh=sharedTags(a,b);
      ovBar.classList.add('visible');
      ovBar.innerHTML='';
      if(ov>0) {
        const yrs=Math.round(ov);
        const badge=document.createElement('span');
        badge.className='cmp-overlap-badge';
        badge.innerHTML=`<strong>${yrs.toLocaleString()}</strong> ${yrs===1?TR('yr'):TR('yrs')} ${TR('overlap')}`;
        ovBar.appendChild(badge);
      } else {
        const msg=document.createElement('span');
        msg.className='cmp-overlap-msg'; msg.textContent=TR('no_overlap');
        ovBar.appendChild(msg);
      }
      if(sh.length) {
        const badge=document.createElement('span');
        badge.className='cmp-overlap-badge green';
        badge.innerHTML=`<strong>${sh.length}</strong> ${TR('shared')}`;
        ovBar.appendChild(badge);
      }
    } else {
      ovBar.classList.remove('visible');
    }
  }

  // Render columns
  overlayEl.querySelectorAll('.cmp-col').forEach((col,i)=>{
    col.innerHTML='';
    col.appendChild(buildCard(slots[i],i));
  });
}

// ── Toast notification ────────────────────────────────────────────────────

function showToast() {
  if(!toastEl) {
    toastEl=document.createElement('div');
    toastEl.id='cmp-toast';
    toastEl.className='cmp-toast hidden';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent=TR('waiting');
  toastEl.classList.remove('hidden');
  clearTimeout(toastEl._t);
  toastEl._t=setTimeout(()=>toastEl.classList.add('hidden'),3500);
}

// ── Open / close ──────────────────────────────────────────────────────────

function openOverlay() {
  if(!overlayEl) return;
  overlayEl.classList.remove('hidden');
  document.body.style.overflow='hidden';
  renderOverlay();
}

function closeOverlay() {
  if(!overlayEl) return;
  overlayEl.classList.add('hidden');
  document.body.style.overflow='';
  isActive=false;
  const btn=document.getElementById('btn-compare');
  if(btn) btn.classList.remove('compare-active');
}

// ── Receive entity (called from graph.js on node click) ────────────────────

export function compareReceiveEntity(entity) {
  if(!entity||!isActive) return;

  // Deduplicate
  if(slots[0]&&slots[0].id===entity.id) return;
  if(slots[1]&&slots[1].id===entity.id) return;

  if(!slots[0]) {
    slots[0]=entity;
    // Only 1 slot filled → show toast, do NOT open overlay yet
    showToast();
    return;
  }

  // Both slots filled → open overlay
  slots[1]=entity;
  if(toastEl) toastEl.classList.add('hidden');
  openOverlay();
}

// ── Build DOM ─────────────────────────────────────────────────────────────

function buildDOM() {
  overlayEl=document.createElement('div');
  overlayEl.id='cmp-overlay';
  overlayEl.className='cmp-overlay hidden';

  overlayEl.innerHTML=`
    <div class="cmp-panel">
      <div class="cmp-panel-header">
        <div class="cmp-header-text">
          <h2 class="cmp-title">${TR('title')}</h2>
          <p class="cmp-instr">${TR('instr')}</p>
        </div>
        <button class="cmp-close-btn" id="cmp-close">✕</button>
      </div>
      <div class="cmp-overlap"></div>
      <div class="cmp-cols">
        <div class="cmp-col"></div>
        <div class="cmp-col"></div>
      </div>
    </div>`;

  document.body.appendChild(overlayEl);

  document.getElementById('cmp-close').addEventListener('click',closeOverlay);
  overlayEl.addEventListener('click',e=>{ if(e.target===overlayEl) closeOverlay(); });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!overlayEl.classList.contains('hidden')) closeOverlay();
  });

  renderOverlay();
}

// ── Init ───────────────────────────────────────────────────────────────────

export function initCompare() {
  buildDOM();

  const btn=document.getElementById('btn-compare');
  if(btn) {
    btn.addEventListener('click',()=>{
      isActive=!isActive;
      btn.classList.toggle('compare-active',isActive);
      if(!isActive) {
        // Deactivate: hide toast, reset slots
        if(toastEl) toastEl.classList.add('hidden');
        slots=[null,null];
      }
    });
  }

  window.compareReceiveEntity=compareReceiveEntity;
  window.isCompareActive=()=>isActive;
}
