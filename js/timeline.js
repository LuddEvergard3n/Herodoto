/**
 * TIMELINE.JS — HERODOTO v7.18
 * ✦ Clustering de eventos próximos
 * ✦ Rows colapsíveis por região
 * ✦ Hierarquia visual por tipo/peso
 */

const ALL_DATASETS = [
  "data/dados-evolucao-humana.json","data/dados-pre-historia.json","data/dados-pre-historia-europa.json",
  "data/dados-civilizacoes-mediterraneo.json","data/dados-hitititas-bronze.json","data/dados-fenicios-cartago.json",
  "data/dados-bronze-egeu.json","data/dados-mesopotamia-bronze.json","data/dados-grecia-antiga.json",
  "data/dados-grecia-esparta.json","data/dados-grecia-atenas.json","data/dados-grecia-guerras.json",
  "data/dados-grecia-filosofia.json","data/dados-grecia-cultura.json","data/dados-grecia-alexandre.json",
  "data/dados-helenismo-ciencia.json","data/dados-roma-republica.json","data/dados-roma-exercito.json",
  "data/dados-roma-sociedade.json","data/dados-roma-imperial.json","data/dados-roma-cultura.json",
  "data/dados-roma-antiga.json","data/dados-queda-roma.json","data/dados-medieval-feudalismo.json",
  "data/dados-castelos-cavalaria.json","data/dados-cruzadas-expandido.json","data/dados-cruzadas.json",
  "data/dados-medieval-cidades-universidades.json","data/dados-bizantino-medieval.json",
  "data/dados-idade-media-europeia.json","data/dados-europa-medieval-aprofundada.json",
  "data/dados-filosofia-medieval.json","data/dados-igreja-medieval-cultura.json",
  "data/dados-filosofia-antiga.json","data/dados-filosofia-racionalismo.json",
  "data/dados-existencialismo.json","data/dados-movimentos-arte.json","data/dados-renascimento-cultural.json",
  "data/dados-renascimento-italiano.json","data/dados-reformas-religiosas.json","data/dados-reforma-protestante.json",
  "data/dados-renascimento-norte.json","data/dados-lutero-reforma.json","data/dados-igreja-ciencia.json",
  "data/dados-igreja-fundacao.json","data/dados-concilios-ecumenicos.json","data/dados-inquisicao.json",
  "data/dados-igreja-escravidao.json","data/dados-absolutismo.json","data/dados-navegacoes.json",
  "data/dados-era-moderna.json","data/dados-revolucao-cientifica.json","data/dados-ciencia-tecnologia.json",
  "data/dados-iluminismo.json","data/dados-revolucoes-liberais.json","data/dados-revolucao-francesa.json",
  "data/dados-guerras-napoleonicas.json","data/dados-revolucao-industrial.json","data/dados-seculo-xix.json",
  "data/dados-nacionalismo-europeu.json","data/dados-imperialismo-colonial.json","data/dados-capitalismo.json",
  "data/dados-russia-pedro-catarina.json","data/dados-russia-czarismo.json","data/dados-revolucao-russa.json",
  "data/dados-socialismo-trabalho.json","data/dados-movimentos-sociais.json","data/dados-primeira-guerra.json",
  "data/dados-entreguerras.json","data/dados-segunda-guerra.json","data/dados-holocausto.json",
  "data/dados-guerra-fria.json","data/dados-eua-seculo-xx.json","data/dados-pos-guerra-fria.json",
  "data/dados-china-neolitico.json","data/dados-china-shang-zhou.json","data/dados-china-filosofia.json",
  "data/dados-china-qin-han.json","data/dados-china-tres-reinos.json","data/dados-china-tang.json",
  "data/dados-china-song-yuan.json","data/dados-china-song-ciencia.json","data/dados-china-ming.json",
  "data/dados-china-ming-exploracoes.json","data/dados-china-qing.json","data/dados-china-qing-sociedade.json",
  "data/dados-china-republica.json","data/dados-china-prc.json","data/dados-china-mao-revolucao.json",
  "data/dados-china-antiga.json","data/dados-china-imperial.json","data/dados-india-vedica-maurya.json",
  "data/dados-india-antiga.json","data/dados-india-medieval.json","data/dados-india-medieval-moderna.json",
  "data/dados-india-mogol.json","data/dados-india-britanica.json","data/dados-mongois-gengis.json",
  "data/dados-mongois-conquistas.json","data/dados-mongois-asia-central.json","data/dados-asia-central.json",
  "data/dados-japao-antigo.json","data/dados-japao-sengoku.json","data/dados-japao-meiji.json",
  "data/dados-japao-moderno.json","data/dados-coreia-antiga.json","data/dados-coreia-joseon.json",
  "data/dados-coreia-moderna.json","data/dados-sudeste-asiatico-continental.json",
  "data/dados-sudeste-asiatico-maritimo.json","data/dados-sudeste-asiatico-colonial.json",
  "data/dados-egito-reinos-antigo-medio.json","data/dados-egito-novo-reino.json","data/dados-egito-antigo.json",
  "data/dados-africa-norte.json","data/dados-africa-oriental.json","data/dados-africa-ocidental.json",
  "data/dados-africa-centro-sul.json","data/dados-africa-pre-colonial.json","data/dados-reinos-africanos.json",
  "data/dados-descolonizacao.json","data/dados-descolonizacao-guerras.json","data/dados-sumeria-cidades.json",
  "data/dados-sumeria.json","data/dados-sumeria-expandida.json","data/dados-sumeria-religiao-legado.json",
  "data/dados-mesopotamia.json","data/dados-mesopotamia-classica.json","data/dados-mesopotamia-hebreus-fenicios.json",
  "data/dados-persia.json","data/dados-persia-expandida.json","data/dados-persia-zoroastrismo-cultura.json",
  "data/dados-arabia-pre-islamica.json","data/dados-isla-origens.json","data/dados-isla-fragmentacao.json",
  "data/dados-expansao-isla.json","data/dados-califados-islamicos.json","data/dados-oriente-medio-moderno.json",
  "data/dados-religioes-mundo.json","data/dados-imperio-otomano.json","data/dados-turquia-moderna.json",
  "data/dados-iran-moderno.json","data/dados-arabia-saudita.json","data/dados-israel-palestina.json",
  "data/dados-povos-nativos-norte.json","data/dados-caribe-colonial.json","data/dados-revolucoes-sec18.json",
  "data/dados-eua-fundacao.json","data/dados-eua-guerra-civil.json","data/dados-eua-gilded-age.json",
  "data/dados-eua-new-deal-guerra-fria.json","data/dados-eua-contemporaneo.json","data/dados-eua-historia.json",
  "data/dados-olmecas.json","data/dados-mesoamerica.json","data/dados-zapotecas-mixtecas.json",
  "data/dados-teotihuacan.json","data/dados-toltecas.json","data/dados-maya-classico.json",
  "data/dados-maya-expandido.json","data/dados-maya-ciencia.json","data/dados-aztecas.json",
  "data/dados-astecas-expandido.json","data/dados-america-latina-sec20.json","data/dados-caral-culturas-antigas.json",
  "data/dados-andes.json","data/dados-incas.json","data/dados-chimu-conquista-peru.json",
  "data/dados-tupis-guaranis-amazonia.json","data/dados-mapuches-povos-sul.json",
  "data/dados-americas-coloniais.json","data/dados-independencias-america-latina.json",
  "data/dados-brasil-01-povos-originarios.json",
  "data/dados-brasil-02-pre-colonial.json",
  "data/dados-brasil-03-capitanias.json",
  "data/dados-brasil-04-governo-geral.json",
  "data/dados-brasil-05-uniao-iberica.json",
  "data/dados-brasil-06-bandeirismo.json",
  "data/dados-brasil-07-ciclo-ouro.json",
  "data/dados-brasil-08-joanino.json",
  "data/dados-brasil-09-independencia.json",
  "data/dados-brasil-10-regencial.json",
  "data/dados-brasil-11-segundo-reinado.json",
  "data/dados-brasil-12-republica-velha.json",
  "data/dados-brasil-13-era-vargas.json",
  "data/dados-brasil-14-populismo.json",
  "data/dados-brasil-15-ditadura.json",
  "data/dados-brasil-16-nova-republica.json",
,"data/dados-brasil-quilombos.json",
  "data/dados-brasil-indigenas.json","data/dados-antartica-descoberta.json","data/dados-antartica-moderna.json"
];

const TYPE_COLORS = {
  political:'#2b4b7e', war:'#8b2e1a', economic:'#a0622a',
  cultural:'#5c2d6e', religious:'#2e6b4f', social:'#b07a28',
  technological:'#556b2f', intellectual:'#4a2060', prehistoric:'#6b5840',
  natural:'#4a7a4a', scientific:'#2a6080',
};
const TYPE_WEIGHT = {
  war:1.0, political:0.9, economic:0.75, religious:0.75,
  cultural:0.65, social:0.65, scientific:0.65, technological:0.65,
  intellectual:0.60, natural:0.55, prehistoric:0.55,
};
const REGION_MAP = {
  Europe:'Europe', MiddleEast:'MiddleEast', Mediterranean:'MiddleEast',
  EastAsia:'EastAsia', Asia:'EastAsia', CentralAsia:'EastAsia',
  SouthAsia:'SouthAsia', SoutheastAsia:'SoutheastAsia',
  Africa:'Africa',
  Americas:'Americas', NorthAmerica:'Americas', SouthAmerica:'Americas', Mesoamerica:'Americas',
  Oceania:'Oceania', Antarctica:'Other', Global:'Global', Multiple:'Global',
};
const REGION_ORDER = ['Europe','MiddleEast','EastAsia','SouthAsia','SoutheastAsia','Africa','Americas','Oceania','Global','Other'];
const RLABELS = {
  pt:{ Europe:'Europa', MiddleEast:'Oriente Médio', EastAsia:'Ásia Oriental', SouthAsia:'Sul da Ásia',
       SoutheastAsia:'Sudeste Asiático', Africa:'África', Americas:'Américas', Oceania:'Oceania',
       Global:'Global', Other:'Outro' },
  en:{ Europe:'Europe', MiddleEast:'Middle East', EastAsia:'East Asia', SouthAsia:'South Asia',
       SoutheastAsia:'Southeast Asia', Africa:'Africa', Americas:'Americas', Oceania:'Oceania',
       Global:'Global', Other:'Other' },
  es:{ Europe:'Europa', MiddleEast:'Oriente Medio', EastAsia:'Asia Oriental', SouthAsia:'Asia del Sur',
       SoutheastAsia:'Sudeste Asiático', Africa:'África', Americas:'Américas', Oceania:'Oceanía',
       Global:'Global', Other:'Otro' },
};
const ERAS = {
  pt:[
    {l:'Pré-História',  a:-4200000, b:-3000},
    {l:'Antiguidade',   a:-3200,    b:600},
    {l:'Idade Média',   a:400,      b:1450},
    {l:'Era Moderna',   a:1400,     b:1800},
    {l:'Séc. XIX–XX',   a:1800,     b:1950},
    {l:'Contemporâneo', a:1945,     b:2025},
    {l:'Tudo',          a:-4200000, b:2025},
  ],
  en:[
    {l:'Prehistory',    a:-4200000, b:-3000},
    {l:'Antiquity',     a:-3200,    b:600},
    {l:'Middle Ages',   a:400,      b:1450},
    {l:'Early Modern',  a:1400,     b:1800},
    {l:'19th–20th C.',  a:1800,     b:1950},
    {l:'Contemporary',  a:1945,     b:2025},
    {l:'All',           a:-4200000, b:2025},
  ],
  es:[
    {l:'Prehistoria',   a:-4200000, b:-3000},
    {l:'Antigüedad',    a:-3200,    b:600},
    {l:'Edad Media',    a:400,      b:1450},
    {l:'Era Moderna',   a:1400,     b:1800},
    {l:'S. XIX–XX',     a:1800,     b:1950},
    {l:'Contemporáneo', a:1945,     b:2025},
    {l:'Todo',          a:-4200000, b:2025},
  ],
};
const TYPE_NAMES = {
  pt:{political:'Político',war:'Guerra',economic:'Econômico',cultural:'Cultural',
      religious:'Religioso',social:'Social',technological:'Tecnológico',
      intellectual:'Intelectual',prehistoric:'Pré-Histórico',natural:'Natural',scientific:'Científico'},
  en:{political:'Political',war:'War',economic:'Economic',cultural:'Cultural',
      religious:'Religious',social:'Social',technological:'Technological',
      intellectual:'Intellectual',prehistoric:'Prehistoric',natural:'Natural',scientific:'Scientific'},
  es:{political:'Político',war:'Guerra',economic:'Económico',cultural:'Cultural',
      religious:'Religioso',social:'Social',technological:'Tecnológico',
      intellectual:'Intelectual',prehistoric:'Prehistórico',natural:'Natural',scientific:'Científico'},
};
const I18N = {
  pt:{title:'Linha do Tempo', count:'evento', counts:'eventos', loading:'Carregando todos os eventos…',
      search:'Pesquisar evento…', hint:'Arrastar · Scroll para zoom · Clique num evento para ver detalhes',
      cluster:'eventos', desc:'Descrição', imp:'Importância', tags:'Tags', bc:'a.C.'},
  en:{title:'Timeline', count:'event', counts:'events', loading:'Loading all events…',
      search:'Search events…', hint:'Drag · Scroll to zoom · Click an event to see details',
      cluster:'events', desc:'Description', imp:'Importance', tags:'Tags', bc:'BC'},
  es:{title:'Línea de Tiempo', count:'evento', counts:'eventos', loading:'Cargando todos los eventos…',
      search:'Buscar evento…', hint:'Arrastrar · Scroll para zoom · Clic para ver detalles',
      cluster:'eventos', desc:'Descripción', imp:'Importancia', tags:'Etiquetas', bc:'a.C.'},
};

const DEEP_THRESHOLD = -20000;
const DEEP_SPLIT     = -15000;
const DEEP_FRAC      = 0.14;

// Layout
const COLLAPSED_H  = 26;
const LANE_H       = 28;
const LANE_PAD_TOP = 8;
const LANE_PAD_BOT = 6;
const BASE_DOT_R   = 4.5;
const MAX_DOT_R    = 7.5;
const CLUSTER_PX   = 26;
const FONT_SZ      = 10;
const CHAR_W       = FONT_SZ * 0.50;
const MIN_LBL      = 5;
const L_PAD        = 16;  // px de margem esquerda no espaço de conteúdo

let panelEl  = null;
let cleanup  = [];
let allEnts  = null;
let loadingP = null;

let S = {
  types: new Set(Object.keys(TYPE_COLORS)),
  q:'', eraIdx:1, eraA:-3200, eraB:600,
  tx:0, sc:1,
  ML:122, MT:40,
  W:0, H:0, cW:0,
  collapsed: new Set(),
};

const GL = () => window.getCurrentLang ? window.getCurrentLang() : 'pt';
const TR = k => (I18N[GL()]||I18N.pt)[k]||k;
const RL = r => (RLABELS[GL()]||RLABELS.pt)[r]||r;
const NR = r => REGION_MAP[r]||'Other';
const TC = t => TYPE_COLORS[t]||TYPE_COLORS.political;
const TW = t => TYPE_WEIGHT[t]||0.6;

function FY(y) {
  if(y==null) return '';
  const a=Math.abs(Math.round(y));
  if(a>=1000000) return (a/1000000).toFixed(1)+'M '+(y<0?(GL()==='en'?'BC':'a.C.'):'');
  if(a>=100000)  return (a/1000).toFixed(0)+'k '+(y<0?(GL()==='en'?'BC':'a.C.'):'');
  return y<0 ? a.toLocaleString()+(GL()==='en'?' BC':' a.C.') : a.toLocaleString();
}
function EN(e) { const l=GL(); return (l==='en'&&e.nome_en)||(l==='es'&&e.nome_es)||e.nome||''; }
function ED(e) { const l=GL(); return (l==='en'&&e.descricao_en)||(l==='es'&&e.descricao_es)||e.descricao||''; }
function EI(e) { const l=GL(); return (l==='en'&&e.importancia_en)||(l==='es'&&e.importancia_es)||e.importancia||''; }

function niceStep(raw) {
  const M=[1,2,5,10,25,50,100,200,500,1000,2500,5000,10000,50000,100000,500000,1000000];
  return M.find(s=>s>=raw)||Math.pow(10,Math.ceil(Math.log10(raw)));
}
function mk(tag,attrs,parent) {
  const el=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const[k,v]of Object.entries(attrs)) el.setAttribute(k,String(v));
  if(parent) parent.appendChild(el);
  return el;
}

function isDeep() { return S.eraA < DEEP_THRESHOLD; }
function yx(year) {
  if(!isDeep()) return L_PAD + ((year-S.eraA)/(S.eraB-S.eraA))*S.cW;
  const deepW=S.cW*DEEP_FRAC, histW=S.cW*(1-DEEP_FRAC);
  if(year<=DEEP_SPLIT) {
    const logA=Math.log(Math.abs(S.eraA)+1), logS=Math.log(Math.abs(DEEP_SPLIT)+1);
    const logY=Math.log(Math.abs(Math.min(year,S.eraA))+1);
    return L_PAD + ((logA-logY)/Math.max(logA-logS,0.001))*deepW;
  }
  return L_PAD + deepW+((year-DEEP_SPLIT)/(S.eraB-DEEP_SPLIT))*histW;
}
function computeBaseCW(W) {
  const visW=(W||S.W||window.innerWidth)-S.ML;
  if(isDeep()) { const m=Math.max(visW*2.5,3200); return Math.max(m/(1-DEEP_FRAC),visW*3.5); }
  return Math.max(visW*3.5,(S.eraB-S.eraA)*0.85,2800);
}
function clampTx(val) {
  const max=-(S.cW+L_PAD-(S.W-S.ML));
  return Math.min(0,Math.max(isFinite(max)?max:-1e9,val));
}
function applyT(el) {
  const t=`translate(${S.ML+S.tx},0)`;
  (el||document.getElementById('tl-content'))?.setAttribute('transform',t);
  document.getElementById('tl-axis')?.setAttribute('transform',t);
}

let _zoomRaf=null, _zoomPivot=null;
function doZoom(f,pivotX,ents) {
  if(!_zoomPivot) _zoomPivot={x:pivotX,frac:(pivotX-S.tx)/Math.max(S.cW,1)};
  S.sc=Math.min(40,Math.max(0.08,S.sc*f));
  if(_zoomRaf) cancelAnimationFrame(_zoomRaf);
  _zoomRaf=requestAnimationFrame(()=>{
    const{x:px,frac}=_zoomPivot; _zoomPivot=null; _zoomRaf=null;
    render(ents); S.tx=clampTx(px-frac*S.cW); applyT();
  });
}
function zoomBy(f,ents){doZoom(f,(S.W-S.ML)/2,ents);}

async function loadAllData() {
  if(allEnts) return allEnts;
  if(loadingP) return loadingP;
  loadingP=(async()=>{
    const results=await Promise.all(ALL_DATASETS.map(p=>fetch(p).then(r=>r.ok?r.json():null).catch(()=>null)));
    const seen=new Set(),ents=[];
    for(const d of results){
      if(!d) continue;
      for(const e of(d.entidades||[])){
        if(!e.id||seen.has(e.id)||e.inicio==null||isNaN(+e.inicio)) continue;
        seen.add(e.id);
        ents.push({...e,_r:NR(e.region||'Other'),inicio:+e.inicio,fim:e.fim!=null?+e.fim:null});
      }
    }
    allEnts=ents; return ents;
  })();
  return loadingP;
}

function visible(ents) {
  const q=S.q.toLowerCase();
  return ents.filter(e=>{
    if(!S.types.has(e.type||'political')) return false;
    const end=e.fim??e.inicio;
    if(e.inicio>S.eraB||end<S.eraA) return false;
    if(q&&!EN(e).toLowerCase().includes(q)) return false;
    return true;
  });
}

// Assign sub-lanes greedily to avoid label overlap
function assignLanes(events) {
  const sorted=[...events].sort((a,b)=>a._x-b._x);
  const laneEnds=[];
  for(const ev of sorted){
    // Use the same clamped x that drawSingleEvent will use
    const cx=Math.max(L_PAD, ev._x);
    const r=BASE_DOT_R+TW(ev.type||'political')*(MAX_DOT_R-BASE_DOT_R);
    const nm=EN(ev);
    // Events clamped to L_PAD (started before eraA): no label, just bar edge
    const beforeEra = ev._x < L_PAD;
    const lblW = beforeEra ? 0 : Math.min(nm.length, 28)*CHAR_W;
    const evEnd = cx + r + 5 + lblW + 6;
    let lane=laneEnds.findIndex(end=>cx>end+5);
    if(lane===-1){lane=laneEnds.length;laneEnds.push(-Infinity);}
    laneEnds[lane]=evEnd;
    ev._lane=lane;
    ev._beforeEra=beforeEra; // flag for drawSingleEvent
  }
  return laneEnds.length||1;
}

// Group events within CLUSTER_PX into clusters
function clusterize(events) {
  if(!events.length) return [];
  const sorted=[...events].sort((a,b)=>a._x-b._x);
  const groups=[];
  for(const ev of sorted){
    const last=groups[groups.length-1];
    if(last&&ev._x-last.xMax<=CLUSTER_PX){
      last.events.push(ev); last.xMax=ev._x; last.xMid=(last.xMin+last.xMax)/2;
    } else {
      groups.push({xMin:ev._x,xMax:ev._x,xMid:ev._x,events:[ev]});
    }
  }
  return groups;
}

function render(ents) {
  const cont=document.getElementById('tl-svg-container');
  if(!cont||!ents) return;
  const vis=visible(ents);
  const W=cont.clientWidth||window.innerWidth;
  S.W=W; S.cW=Math.round(computeBaseCW(W)*S.sc);

  const rSet=new Set(vis.map(e=>e._r));
  const regions=REGION_ORDER.filter(r=>rSet.has(r));
  if(rSet.has('Other')&&!regions.includes('Other')) regions.push('Other');

  vis.forEach(e=>{e._x=yx(e.inicio);});

  // Pre-compute per-region layout
  const RD={};
  regions.forEach(r=>{
    const evs=vis.filter(e=>e._r===r);
    const collapsed=S.collapsed.has(r);
    const nLanes=collapsed?1:assignLanes(evs);
    const rowH=collapsed?COLLAPSED_H:LANE_PAD_TOP+nLanes*LANE_H+LANE_PAD_BOT;
    RD[r]={evs,nLanes,rowH,collapsed};
  });

  const totalH=regions.reduce((s,r)=>s+RD[r].rowH,0);
  S.H=Math.max(200,S.MT+totalH+32);

  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('width',W); svg.setAttribute('height',S.H);
  svg.style.cssText='display:block;cursor:grab;user-select:none;';

  const defs=document.createElementNS(NS,'defs');
  const clip=document.createElementNS(NS,'clipPath'); clip.id='tl-clip';
  mk('rect',{x:S.ML,y:0,width:W-S.ML,height:S.H},clip);
  defs.appendChild(clip); svg.appendChild(defs);

  mk('rect',{width:W,height:S.H,fill:'#f6f1e4'},svg);

  const cg=document.createElementNS(NS,'g');
  cg.setAttribute('clip-path','url(#tl-clip)'); svg.appendChild(cg);
  const content=document.createElementNS(NS,'g');
  content.id='tl-content'; applyT(content); cg.appendChild(content);

  // Grid ticks
  const tickYrs=[];
  if(!isDeep()){
    const span=S.eraB-S.eraA||1;
    const step=niceStep(span/Math.max(4,Math.min(16,Math.floor(S.cW/140))));
    for(let yr=Math.ceil(S.eraA/step)*step;yr<=S.eraB;yr+=step) tickYrs.push(yr);
  } else {
    [-4000000,-2000000,-1000000,-500000,-200000,-100000,-50000,-20000,DEEP_SPLIT]
      .forEach(y=>{if(y>=S.eraA&&y<=S.eraB) tickYrs.push(y);});
    const step=niceStep((S.eraB-DEEP_SPLIT)/Math.max(6,Math.min(14,Math.floor(S.cW*(1-DEEP_FRAC)/140))));
    for(let yr=Math.ceil(DEEP_SPLIT/step)*step;yr<=S.eraB;yr+=step) tickYrs.push(yr);
    tickYrs.sort((a,b)=>a-b);
  }
  tickYrs.forEach(yr=>mk('line',{x1:yx(yr),y1:S.MT,x2:yx(yr),y2:S.H-4,stroke:'#d4c8a8','stroke-width':'1','stroke-dasharray':'3,7'},content));
  if(S.eraA<0&&S.eraB>0) mk('line',{x1:yx(0),y1:S.MT,x2:yx(0),y2:S.H,stroke:'#8b3a2a','stroke-width':'1.5',opacity:'0.28'},content);
  if(isDeep()) mk('line',{x1:yx(DEEP_SPLIT),y1:S.MT,x2:yx(DEEP_SPLIT),y2:S.H,stroke:'#9b7a40','stroke-width':'1.5','stroke-dasharray':'8,5',opacity:'0.6'},content);

  // Region rows
  const fixG=document.createElementNS(NS,'g'); svg.appendChild(fixG);
  let curY=S.MT;

  regions.forEach((region,ri)=>{
    const{evs,nLanes,rowH,collapsed}=RD[region];
    const rY=curY;

    if(ri%2===0) mk('rect',{x:0,y:rY,width:S.cW+S.ML,height:rowH,fill:'rgba(180,160,120,0.05)'},content);
    mk('line',{x1:0,y1:rY,x2:S.cW,y2:rY,stroke:'#c8bda0','stroke-width':'0.6'},content);

    // Fixed label panel
    mk('rect',{x:0,y:rY,width:S.ML-1,height:rowH,fill:'#ede7d2'},fixG);
    mk('text',{x:S.ML-26,y:rY+rowH/2+4,'text-anchor':'end','font-size':'11',
      fill:'#4a3820','font-family':"'IM Fell English',Palatino,serif",'font-style':'italic'},fixG)
      .textContent=RL(region);

    // Toggle button
    const tg=document.createElementNS(NS,'g'); tg.style.cursor='pointer';
    const bx=S.ML-14,by=rY+rowH/2;
    mk('circle',{cx:bx,cy:by,r:9,fill:'rgba(176,152,112,0.18)',stroke:'#b09870','stroke-width':'0.8'},tg);
    const chev=mk('text',{x:bx,y:by+4,'text-anchor':'middle','font-size':'11',
      fill:'#7a5c30','font-family':'sans-serif','pointer-events':'none'},tg);
    chev.textContent=collapsed?'▸':'▾';
    tg.addEventListener('click',ev=>{
      ev.stopPropagation();
      S.collapsed.has(region)?S.collapsed.delete(region):S.collapsed.add(region);
      render(ents);
    });
    tg.addEventListener('mouseenter',()=>chev.setAttribute('fill','#2b4b7e'));
    tg.addEventListener('mouseleave',()=>chev.setAttribute('fill','#7a5c30'));
    fixG.appendChild(tg);

    if(!collapsed){
      for(let lane=0;lane<nLanes;lane++){
        const laneEvs=evs.filter(e=>e._lane===lane);
        const laneY=rY+LANE_PAD_TOP+lane*LANE_H+LANE_H/2;
        clusterize(laneEvs).forEach(cl=>{
          if(cl.events.length===1) drawSingleEvent(content,cl.events[0],cl.xMid,laneY,ents);
          else drawCluster(content,cl,laneY,ents);
        });
      }
    } else {
      // Collapsed: tiny summary dots
      const midY=rY+COLLAPSED_H/2;
      clusterize(evs).slice(0,50).forEach(cl=>{
        const dom=cl.events.reduce((a,b)=>TW(a.type||'political')>=TW(b.type||'political')?a:b);
        const r2=cl.events.length>3?4:3;
        const dot=mk('circle',{cx:cl.xMid,cy:midY,r:r2,fill:TC(dom.type||'political'),opacity:'0.45'},content);
        dot.style.cursor='pointer';
        const tip=document.createElementNS(NS,'title');
        tip.textContent=cl.events.length+' '+TR('cluster');
        dot.appendChild(tip);
        dot.addEventListener('click',ev=>{ev.stopPropagation();S.collapsed.delete(region);render(ents);});
      });
    }
    curY+=rowH;
  });

  mk('line',{x1:S.ML,y1:0,x2:S.ML,y2:S.H,stroke:'#b09870','stroke-width':'1.5'},svg);
  mk('rect',{x:S.ML,y:0,width:W-S.ML,height:S.MT,fill:'rgba(246,241,228,0.97)'},svg);
  mk('line',{x1:S.ML,y1:S.MT,x2:W,y2:S.MT,stroke:'#b09870','stroke-width':'1'},svg);
  mk('rect',{x:0,y:0,width:S.ML-1,height:S.MT,fill:'#e8e2d0'},svg);

  const ag=document.createElementNS(NS,'g');
  ag.setAttribute('clip-path','url(#tl-clip)'); svg.appendChild(ag);
  const axisG=document.createElementNS(NS,'g');
  axisG.id='tl-axis'; applyT(axisG); ag.appendChild(axisG);
  let lastAx=-Infinity;
  tickYrs.forEach(yr=>{
    const x=yx(yr),lbl=FY(yr),lw=lbl.length*5.8+6;
    if(x-lw/2>lastAx+4){
      mk('text',{x,y:S.MT-7,'text-anchor':'middle','font-size':'10.5',fill:'#4a3010',
        'font-family':"'IM Fell English',Palatino,serif",'font-style':'italic','font-weight':'500'},axisG)
        .textContent=lbl;
      lastAx=x+lw/2;
    }
  });
  if(isDeep()) mk('text',{x:S.ML+8,y:S.MT-22,'font-size':'9',fill:'#8b7a50',
    'font-family':"'IM Fell English',Palatino,serif",'font-style':'italic',
    'pointer-events':'none'},svg)  // fixed position, not in scrollable axisG
    .textContent='← escala logarítmica  |  linear →';

  cont.innerHTML=''; cont.appendChild(svg);
  setupInteraction(svg,ents);
  const badge=document.getElementById('tl-count');
  if(badge){const n=vis.length;badge.textContent=n+' '+(n===1?TR('count'):TR('counts'));}
}

function drawSingleEvent(parent,e,cx,mY,ents){
  const beforeEra = e._beforeEra || cx <= L_PAD + 1;
  cx = Math.max(L_PAD, cx); // clamp: never render dot left of content area
  const color=TC(e.type||'political');
  const w=TW(e.type||'political');
  const dotR=BASE_DOT_R+w*(MAX_DOT_R-BASE_DOT_R);
  const ex=e.fim!=null?yx(e.fim):cx;
  if(e.fim!=null&&ex-cx>4)
    mk('rect',{x:cx,y:mY-3,width:Math.max(4,ex-cx),height:6,rx:3,fill:color,opacity:String(0.08+w*0.14)},parent);
  mk('circle',{cx,cy:mY,r:dotR+3.5,fill:'#f6f1e4',opacity:'0.4'},parent);
  const circ=mk('circle',{cx,cy:mY,r:dotR,fill:color,stroke:'#f0ead0','stroke-width':w>0.8?'2':'1.5'},parent);
  circ.style.cursor='pointer'; circ.style.transition='r 0.12s';
  const nm=EN(e);
  const tip=document.createElementNS('http://www.w3.org/2000/svg','title');
  tip.textContent=nm+'\n'+FY(e.inicio)+(e.fim!=null?' → '+FY(e.fim):'');
  circ.appendChild(tip);
  // Events that started before eraA get clamped to left edge — skip label to avoid pile-up
  if(!beforeEra){
    const lblX=cx+dotR+5;
    // Available width = total canvas (cW + L_PAD) minus current label start
    const avail=S.cW+L_PAD-lblX;
    const maxCh=Math.max(MIN_LBL,Math.floor(avail/CHAR_W));
    const text=nm.length>maxCh?nm.slice(0,maxCh-1)+'…':nm;
    const op=0.45+w*0.55;
    const lbl=mk('text',{x:lblX,y:mY+3.5,'font-size':String(FONT_SZ+w*1.5),
      fill:'#2a1e0f',opacity:String(op.toFixed(2)),'font-family':"'Crimson Text',Palatino,serif",
      'pointer-events':'none','font-weight':w>0.8?'600':'400'},parent);
    lbl.textContent=text;
    circ.addEventListener('mouseenter',()=>{circ.setAttribute('r',dotR+3.5);lbl.setAttribute('opacity','1');});
    circ.addEventListener('mouseleave',()=>{circ.setAttribute('r',String(dotR));lbl.setAttribute('opacity',String(op.toFixed(2)));});
  } else {
    circ.addEventListener('mouseenter',()=>circ.setAttribute('r',String(dotR+3.5)));
    circ.addEventListener('mouseleave',()=>circ.setAttribute('r',String(dotR)));
  }
  circ.addEventListener('click',ev=>{ev.stopPropagation();openSidePanel(e);});
}

function drawCluster(parent,cluster,mY,ents){
  const{events:cEvs,xMid}=cluster;
  const n=cEvs.length;
  const typeCounts={};
  cEvs.forEach(e=>{const t=e.type||'political';typeCounts[t]=(typeCounts[t]||0)+1;});
  const domType=Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0][0];
  const color=TC(domType);
  const cr=Math.min(14,8+Math.sqrt(n)*1.5);
  mk('circle',{cx:xMid,cy:mY,r:cr+4,fill:color,opacity:'0.07'},parent);
  const badge=mk('circle',{cx:xMid,cy:mY,r:cr,fill:color,opacity:'0.82',stroke:'#f0ead0','stroke-width':'1.5'},parent);
  badge.style.cursor='pointer';
  const cnt=mk('text',{x:xMid,y:mY+4,'text-anchor':'middle',
    'font-size':String(n<10?10:9),fill:'#fff','font-family':'sans-serif',
    'font-weight':'700','pointer-events':'none'},parent);
  cnt.textContent=String(n);
  const tip=document.createElementNS('http://www.w3.org/2000/svg','title');
  const names=cEvs.slice(0,5).map(e=>EN(e)).join('\n');
  tip.textContent=n+' '+TR('cluster')+(n>5?'\n'+names+'\n…':'\n'+names);
  badge.appendChild(tip);
  badge.addEventListener('mouseenter',()=>{badge.setAttribute('r',String(cr+3));badge.setAttribute('opacity','0.95');});
  badge.addEventListener('mouseleave',()=>{badge.setAttribute('r',String(cr));badge.setAttribute('opacity','0.82');});
  badge.addEventListener('click',ev=>{
    ev.stopPropagation();
    if(n<=3) openClusterPicker(cEvs,badge);
    else doZoom(2.8,xMid,ents);
  });
}

function openClusterPicker(evs,anchorEl){
  document.getElementById('tl-cluster-picker')?.remove();
  const pick=document.createElement('div');
  pick.id='tl-cluster-picker'; pick.className='tl-cluster-picker';
  evs.forEach(e=>{
    const btn=document.createElement('button'); btn.className='tl-cpick-btn';
    const dot=document.createElement('span'); dot.className='tl-cpick-dot';
    dot.style.background=TC(e.type||'political'); btn.appendChild(dot);
    btn.appendChild(document.createTextNode(EN(e)+' — '+FY(e.inicio)));
    btn.addEventListener('click',()=>{pick.remove();openSidePanel(e);});
    pick.appendChild(btn);
  });
  const cont=document.getElementById('tl-svg-container');
  const rect=cont.getBoundingClientRect();
  const cx=parseFloat(anchorEl.getAttribute('cx')||'0')+S.ML+S.tx;
  const cy=parseFloat(anchorEl.getAttribute('cy')||'0');
  pick.style.cssText=`position:fixed;left:${Math.min(cx+rect.left,rect.right-240)}px;top:${cy+rect.top+20}px;`;
  document.body.appendChild(pick);
  setTimeout(()=>document.addEventListener('click',()=>pick.remove(),{once:true}),0);
}

function setupInteraction(svg,ents){
  let drag=false,sx=0,stx=0;
  const dn=e=>{if(e.button!==0)return;drag=true;sx=e.clientX;stx=S.tx;svg.style.cursor='grabbing';};
  const mm=e=>{if(!drag)return;S.tx=clampTx(stx+e.clientX-sx);applyT();};
  const mu=()=>{drag=false;svg.style.cursor='grab';};
  const wh=e=>{
    e.preventDefault();
    const f=e.deltaY<0?1.22:1/1.22;
    const rect=svg.getBoundingClientRect();
    doZoom(f,e.clientX-rect.left-S.ML,ents);
  };
  svg.addEventListener('mousedown',dn);
  window.addEventListener('mousemove',mm);
  window.addEventListener('mouseup',mu);
  svg.addEventListener('wheel',wh,{passive:false});
  cleanup.push(()=>{
    svg.removeEventListener('mousedown',dn);
    window.removeEventListener('mousemove',mm);
    window.removeEventListener('mouseup',mu);
    svg.removeEventListener('wheel',wh);
  });
}

function buildTypeFilter(ents){
  const bar=document.getElementById('tl-type-filter');if(!bar)return;
  bar.innerHTML='';
  const present=new Set(ents.map(e=>e.type||'political'));
  const names=TYPE_NAMES[GL()]||TYPE_NAMES.pt;
  for(const[id,color]of Object.entries(TYPE_COLORS)){
    if(!present.has(id))continue;
    const btn=document.createElement('button');
    btn.className='tl-type-btn'+(S.types.has(id)?' on':'');
    btn.innerHTML=`<span class="tl-dot" style="background:${color}"></span>${names[id]||id}`;
    btn.addEventListener('click',()=>{
      if(S.types.has(id)){if(S.types.size===1)return;S.types.delete(id);}else S.types.add(id);
      btn.className='tl-type-btn'+(S.types.has(id)?' on':'');
      render(ents);
    });
    bar.appendChild(btn);
  }
}

function buildEraFilter(ents){
  const bar=document.getElementById('tl-era-filter');if(!bar)return;
  bar.innerHTML='';
  const eras=ERAS[GL()]||ERAS.pt;
  eras.forEach((era,idx)=>{
    const btn=document.createElement('button');
    btn.className='tl-era-btn'+(idx===S.eraIdx?' on':'');
    btn.textContent=era.l;
    btn.addEventListener('click',()=>{
      S.eraIdx=idx;S.eraA=era.a;S.eraB=era.b;S.sc=1;S.tx=0;
      bar.querySelectorAll('.tl-era-btn').forEach((b,i)=>b.className='tl-era-btn'+(i===idx?' on':''));
      render(ents);
      // For deep eras tx=0 already shows the start; no repositioning needed
    });
    bar.appendChild(btn);
  });
}

function openSidePanel(entity){
  const mainArea=document.getElementById('tl-main-area');if(!mainArea)return;
  let sp=document.getElementById('tl-side-panel');
  if(!sp){sp=document.createElement('div');sp.id='tl-side-panel';sp.className='tl-side-panel';mainArea.appendChild(sp);}
  sp.classList.remove('hidden');
  const color=TC(entity.type||'political');
  const nm=EN(entity),desc=ED(entity),imp=EI(entity),tags=entity.tags||[];
  const TNAMES=TYPE_NAMES[GL()]||TYPE_NAMES.pt;
  sp.innerHTML='';
  const acc=document.createElement('div');acc.className='tl-sp-accent';acc.style.background=color;sp.appendChild(acc);
  const inner=document.createElement('div');inner.className='tl-sp-inner';
  const closeBtn=document.createElement('button');closeBtn.className='tl-sp-close';closeBtn.textContent='×';
  closeBtn.addEventListener('click',()=>sp.classList.add('hidden'));inner.appendChild(closeBtn);
  const h3=document.createElement('h3');h3.className='tl-sp-name';h3.textContent=nm;inner.appendChild(h3);
  const badge=document.createElement('span');badge.className='tl-sp-type';
  badge.style.cssText=`background:${color}18;color:${color};border:1px solid ${color}44`;
  badge.textContent=(TNAMES[entity.type||'political']||entity.type||'').toUpperCase();inner.appendChild(badge);
  if(entity.inicio!=null){const d=document.createElement('p');d.className='tl-sp-dates';d.textContent=FY(entity.inicio)+(entity.fim!=null?' → '+FY(entity.fim):'');inner.appendChild(d);}
  if(entity.region){const r=document.createElement('p');r.className='tl-sp-region';r.textContent=RL(NR(entity.region));inner.appendChild(r);}
  function section(label,text,italic){
    const s=document.createElement('div');s.className='tl-sp-section';
    const t=document.createElement('p');t.className='tl-sp-sec-title';t.textContent=label;
    const p=document.createElement('p');p.className='tl-sp-text'+(italic?' tl-sp-imp':'');p.textContent=text;
    s.appendChild(t);s.appendChild(p);inner.appendChild(s);
  }
  if(desc)section(TR('desc'),desc,false);
  if(imp)section(TR('imp'),imp,true);
  if(tags.length){
    const s=document.createElement('div');s.className='tl-sp-section';
    const t=document.createElement('p');t.className='tl-sp-sec-title';t.textContent=TR('tags');
    const tw=document.createElement('div');tw.className='tl-sp-tags';
    tags.forEach(tg=>{const span=document.createElement('span');span.className='tl-sp-tag';span.textContent=tg;tw.appendChild(span);});
    s.appendChild(t);s.appendChild(tw);inner.appendChild(s);
  }
  sp.appendChild(inner);
}

async function openTimeline(){
  if(!panelEl)return;
  cleanup.forEach(f=>f());cleanup=[];
  S.tx=0;S.sc=1;S.types=new Set(Object.keys(TYPE_COLORS));S.q='';
  S.eraIdx=1;S.eraA=-3200;S.eraB=600;S.collapsed=new Set();
  _zoomRaf=null;_zoomPivot=null;
  document.getElementById('tl-title')?.setAttribute&&(document.getElementById('tl-title').textContent=TR('title'));
  document.getElementById('tl-hint')&&(document.getElementById('tl-hint').textContent=TR('hint'));
  const srch=document.getElementById('tl-search');if(srch){srch.value='';srch.placeholder=TR('search');}
  const loadEl=document.getElementById('tl-loading');if(loadEl)loadEl.classList.remove('hidden');
  panelEl.classList.remove('hidden');
  document.body.style.overflow='hidden';
  const ents=await loadAllData();
  if(loadEl)loadEl.classList.add('hidden');
  buildTypeFilter(ents);
  buildEraFilter(ents);
  requestAnimationFrame(()=>render(ents));
  let st;
  const srchEl=document.getElementById('tl-search');
  if(srchEl){
    const ns=srchEl.cloneNode(true);srchEl.parentNode.replaceChild(ns,srchEl);
    ns.addEventListener('input',e=>{clearTimeout(st);st=setTimeout(()=>{S.q=e.target.value.trim();render(ents);},220);});
  }
  document.getElementById('tl-zi').onclick=()=>zoomBy(1.65,ents);
  document.getElementById('tl-zo').onclick=()=>zoomBy(1/1.65,ents);
  document.getElementById('tl-zr').onclick=()=>{S.sc=1;S.tx=0;S.collapsed=new Set();render(ents);};
}

function closeTimeline(){
  cleanup.forEach(f=>f());cleanup=[];
  panelEl?.classList.add('hidden');
  document.getElementById('tl-cluster-picker')?.remove();
  document.body.style.overflow='';
}

function buildPanel(){
  panelEl=document.createElement('div');
  panelEl.id='tl-panel';panelEl.className='tl-panel hidden';
  panelEl.innerHTML=`
    <div class="tl-header">
      <h2 id="tl-title" class="tl-title">Linha do Tempo</h2>
      <div class="tl-header-right">
        <div class="tl-zoom-group">
          <button class="tl-zoom-btn" id="tl-zi">+</button>
          <button class="tl-zoom-btn" id="tl-zo">–</button>
          <button class="tl-zoom-btn" id="tl-zr">↺</button>
        </div>
        <button class="tl-close-btn" id="tl-close">✕</button>
      </div>
    </div>
    <div class="tl-era-row" id="tl-era-filter"></div>
    <div class="tl-filter-row" id="tl-type-filter"></div>
    <div class="tl-search-row">
      <input id="tl-search" class="tl-search-input" placeholder="Pesquisar…">
      <span id="tl-count" class="tl-count"></span>
    </div>
    <div class="tl-main-area" id="tl-main-area">
      <div class="tl-body">
        <p class="tl-loading hidden" id="tl-loading">Carregando…</p>
        <div id="tl-svg-container" class="tl-svg-cont"></div>
        <p id="tl-hint" class="tl-hint">Arrastar · Scroll para zoom · Clique num evento para ver detalhes</p>
      </div>
    </div>`;
  document.body.appendChild(panelEl);
  document.getElementById('tl-close').addEventListener('click',closeTimeline);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTimeline();});
}

export function initTimeline(){
  buildPanel();
  const btn=document.getElementById('btn-timeline');
  if(btn)btn.addEventListener('click',openTimeline);
  window.openTimeline=openTimeline;
  window.closeTimeline=closeTimeline;
}
