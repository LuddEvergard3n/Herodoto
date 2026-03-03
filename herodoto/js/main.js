/**
 * MAIN.JS — Heródoto v7.14
 * Ponto de entrada principal: inicialização, eventos, filtros e layout.
 */

import { applyTranslations, setCurrentLang, getCurrentLang } from './i18n.js';
import { carregarDadosSelecionados, filterData, getDataExtents } from './data.js';
import { renderizarGrafo, updateLabels, updateInfoPanel, mostrarInfo, fecharInfo } from './graph.js';
import { generateContextForEntities } from './context.js';
import { aplicarFiltrosSemanticos, resetarFiltros, getNodeColor, TYPE_COLORS } from './filtros.js';
import { initContextPanel } from './context-panel.js';
import { initGuidedMode, updateGuidedLang } from './guided-mode.js';
import { initGeoLayer } from './geo-layer.js';
import { initLegendFilter, refreshLegendLang } from './legend-filter.js';
import { initSearch } from './search.js';
import { initChainPanel, showChainPanel } from './causal-chain.js';
import { initQuestions } from './questions.js';
import { applyDatasetLabels } from './dataset-labels.js';
import { initTimeline } from './timeline.js';
import { initPersonagens } from './personagens.js';
import { initCompare } from './compare.js';

// expose useful functions for debugging / compatibility
window.getCurrentLang = getCurrentLang;
window.applyTranslations = applyTranslations;
window.mostrarInfo = mostrarInfo;
window.fecharInfo = fecharInfo;
window.aplicarFiltrosSemanticos = aplicarFiltrosSemanticos;
window.getNodeColor = getNodeColor;
window.TYPE_COLORS = TYPE_COLORS;

let todosOsDados = null;
window.todosOsDados = null; // Exposto para context-panel usar todos os dados carregados

// FIX #2: Flag para prevenir múltiplas inicializações
let appInitialized = false;

// FIX #2: Armazenar referências dos handlers para cleanup
let perfCheckboxHandler = null;
let langSelectHandler = null;
let btnVisualizarHandler = null;
let btnFecharHandler = null;

async function initApp() {
  // FIX #2: Prevenir múltiplas inicializações
  if (appInitialized) {
    console.warn('[!]️ App já inicializado, ignorando nova chamada a initApp()');
    return;
  }
  appInitialized = true;
  
  console.log('initApp start');
  
  // performance toggle global
  window.forcePerformance = false;
  const perfCheckbox = document.getElementById('forcePerformance');
  if (perfCheckbox) {
    perfCheckboxHandler = (e) => {
      window.forcePerformance = e.target.checked;
      aplicarFiltros();
    };
    perfCheckbox.addEventListener('change', perfCheckboxHandler);
  }

  // language select
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = getCurrentLang();
    langSelectHandler = (e) => {
      setCurrentLang(e.target.value);
      applyTranslations(e.target.value);
      updateLabels();
      updateInfoPanel();
      updateGuidedLang();
      refreshLegendLang();
      if (window.refreshQuestionsLang) window.refreshQuestionsLang();
      if (window.refreshTimelineLang) window.refreshTimelineLang();
    };
    langSelect.addEventListener('change', langSelectHandler);
  }

  // visualize button
  const btnVisualizar = document.getElementById('btnVisualizar');
  if (btnVisualizar) {
    btnVisualizarHandler = aplicarFiltros;
    btnVisualizar.addEventListener('click', btnVisualizarHandler);
  }

  // fechar info
  const btnFechar = document.getElementById('btnFechar');
  if (btnFechar) {
    btnFecharHandler = fecharInfo;
    btnFechar.addEventListener('click', btnFecharHandler);
  }

  console.log('App iniciado.');
  
  // Inicializar módulos v6.1
  initContextPanel();
  initGuidedMode();
  initGeoLayer();
  initLegendFilter();
  initSearch();
  initChainPanel();
  initQuestions();
  initTimeline();
  initPersonagens();
  initCompare();
  // Expose dataset label translator for i18n.js
  window._applyDatasetLabels = applyDatasetLabels;
  
  // Carregar automaticamente se houver checkboxes marcados por padrão
  const checkboxesMarcados = document.querySelectorAll('.dataset:checked');
  if (checkboxesMarcados.length > 0) {
    console.log(`${checkboxesMarcados.length} datasets marcados por padrão. Carregando...`);
    aplicarFiltros();
  }
}

// FIX #2: Função para cleanup (útil para hot reload ou testes)
export function cleanupApp() {
  if (!appInitialized) return;
  
  const perfCheckbox = document.getElementById('forcePerformance');
  if (perfCheckbox && perfCheckboxHandler) {
    perfCheckbox.removeEventListener('change', perfCheckboxHandler);
  }
  
  const langSelect = document.getElementById('langSelect');
  if (langSelect && langSelectHandler) {
    langSelect.removeEventListener('change', langSelectHandler);
  }
  
  const btnVisualizar = document.getElementById('btnVisualizar');
  if (btnVisualizar && btnVisualizarHandler) {
    btnVisualizar.removeEventListener('click', btnVisualizarHandler);
  }
  
  const btnFechar = document.getElementById('btnFechar');
  if (btnFechar && btnFecharHandler) {
    btnFechar.removeEventListener('click', btnFecharHandler);
  }
  
  appInitialized = false;
  console.log('App cleanup concluído');
}

// lightweight wrapper to call shared filter/render sequence
async function aplicarFiltros() {
  try {
    // Recarregar dados baseado nos checkboxes atualmente marcados
    todosOsDados = await carregarDadosSelecionados();
    window.todosOsDados = todosOsDados; // Sync global para context-panel
    console.log('carregarDadosSelecionados ->', 
      (todosOsDados && todosOsDados.entidades ? todosOsDados.entidades.length : 0), 'entidades,', 
      (todosOsDados && todosOsDados.relacoes ? todosOsDados.relacoes.length : 0), 'relacoes');
    
    // enrich entities with generated context where missing
    generateContextForEntities(todosOsDados.entidades || []);
    
    if (!todosOsDados) return;
    const { entidades, relacoes } = filterData(todosOsDados);
    renderizarGrafo(entidades, relacoes);
  } catch (err) {
    console.error('Erro ao aplicar filtros:', err);
  }
}

// expose apply filters
window.aplicarFiltros = aplicarFiltros;
window.cleanupApp = cleanupApp; // expor cleanup para debug

initApp();
