/**
 * FILTRAGEM SEMÂNTICA - ÓRION v6.0
 * 
 * Sistema de context selector (não timeline filter)
 * Permite visualização de simultaneidades históricas
 * 
 * USO:
 * import { aplicarFiltrosSemanticos, resetarFiltros } from './filtros.js';
 */

console.log('[filtros.js] Módulo carregado');

// Mapa de cores por tipo
export const TYPE_COLORS = {
  war:          '#8b2e1a',   // Vermelho cinábrio
  political:    '#2b4b7e',   // Azul lápis-lazúli
  economic:     '#a0622a',   // Ocre queimado
  cultural:     '#5c2d6e',   // Púrpura imperial
  religious:    '#2e6b4f',   // Verde malaquita
  technological:'#3d3d3d',   // Ferro escurecido
  social:       '#b07a28',   // Âmbar natural
  intellectual: '#4a2060',   // Violeta escuro
  person:       '#8a6a20'    // Ouro velho
};

console.log('[filtros.js] TYPE_COLORS definido:', TYPE_COLORS);

/**
 * Verifica se um século está dentro do range de um período
 */
function centuryInRange(century, centuryStart, centuryEnd) {
  if (!century || (!centuryStart && !centuryEnd)) return false;
  
  const start = centuryStart || -100; // Default para muito antigo
  const end = centuryEnd || 100;      // Default para muito recente
  
  return century >= start && century <= end;
}

/**
 * Coleta filtros ativos do DOM
 */
function coletarFiltros() {
  const periodos = Array.from(document.querySelectorAll('.filtro-periodo:checked'))
    .map(cb => cb.value);
  
  const seculos = Array.from(document.querySelectorAll('.filtro-seculo:checked'))
    .map(cb => parseInt(cb.value));
  
  const regioes = Array.from(document.querySelectorAll('.filtro-regiao:checked'))
    .map(cb => cb.value);
  
  const tipos = Array.from(document.querySelectorAll('.filtro-tipo:checked'))
    .map(cb => cb.value);
  
  return { periodos, seculos, regioes, tipos };
}

/**
 * Determina se uma entidade deve ser visível baseado nos filtros
 */
function entidadeVisivel(entidade, filtros) {
  const { periodos, seculos, regioes, tipos } = filtros;
  const semantic = getSemanticFields(entidade);
  
  // Se nenhum filtro está ativo, mostrar tudo
  const nenhumFiltroAtivo = (
    periodos.length === 0 && 
    seculos.length === 0 && 
    regioes.length === 0 && 
    tipos.length === 0
  );
  
  if (nenhumFiltroAtivo) return true;
  
  // Filtro de período (se houver períodos selecionados)
  if (periodos.length > 0 && !periodos.includes(semantic.period)) {
    return false;
  }
  
  // Filtro de século (se houver séculos selecionados)
  if (seculos.length > 0) {
    const centuryStart = semantic.century_start;
    const centuryEnd = semantic.century_end;
    
    // Verifica se algum século selecionado intersecta com o período da entidade
    const seculoIntersecta = seculos.some(sec => 
      centuryInRange(sec, centuryStart, centuryEnd)
    );
    
    if (!seculoIntersecta) return false;
  }
  
  // Filtro de região (se houver regiões selecionadas)
  if (regioes.length > 0) {
    const regiao = semantic.region;
    
    // Permitir entidades "Multiple" se qualquer região estiver selecionada
    if (regiao === 'Multiple' && regioes.length > 0) {
      // OK, mostrar
    } else if (!regioes.includes(regiao)) {
      return false;
    }
  }
  
  // Filtro de tipo (se houver tipos selecionados)
  if (tipos.length > 0 && !tipos.includes(semantic.type)) {
    return false;
  }
  
  return true;
}

/**
 * Aplica filtros semânticos ao grafo
 * Usa opacity ao invés de remover nós (preserva estabilidade física)
 */
export function aplicarFiltrosSemanticos(entidades, relacoes) {
  const filtros = coletarFiltros();
  
  console.log('[filtros.js] Aplicando filtros semânticos:', filtros);
  
  // Marcar visibilidade de cada entidade
  const entidadesVisiveis = new Set();
  
  entidades.forEach(entidade => {
    entidade.visible = entidadeVisivel(entidade, filtros);
    if (entidade.visible) {
      entidadesVisiveis.add(entidade.id);
    }
  });
  
  // Atualizar nós no D3
  d3.selectAll('.node')
    .transition()
    .duration(500)
    .style('opacity', d => d.visible ? 1 : 0.08)
    .style('pointer-events', d => d.visible ? 'all' : 'none');
  
  // Atualizar labels
  d3.selectAll('.label')
    .transition()
    .duration(500)
    .style('opacity', d => d.visible ? 1 : 0);
  
  // Atualizar conexões
  d3.selectAll('.link')
    .transition()
    .duration(500)
    .style('opacity', d => {
      const sourceVisible = entidadesVisiveis.has(d.source.id);
      const targetVisible = entidadesVisiveis.has(d.target.id);
      
      // Ambos visíveis: opacity normal
      if (sourceVisible && targetVisible) return d.meta ? 0.6 : 0.4;
      
      // Pelo menos um visível: tracejado suave
      if (sourceVisible || targetVisible) return 0.15;
      
      // Nenhum visível: invisível
      return 0;
    })
    .style('stroke-dasharray', d => {
      const sourceVisible = entidadesVisiveis.has(d.source.id);
      const targetVisible = entidadesVisiveis.has(d.target.id);
      
      // Se ambos visíveis ou ambos invisíveis: linha sólida
      if ((sourceVisible && targetVisible) || (!sourceVisible && !targetVisible)) {
        return d.tipo === 'tensao' ? '5,5' : 'none';
      }
      
      // Se apenas um visível: linha tracejada
      return '3,3';
    });
  
  // Log de estatísticas
  const totalVisiveis = entidades.filter(e => e.visible).length;
  const totalInvisiveis = entidades.length - totalVisiveis;
  
  console.log(`[filtros.js] Filtros aplicados: ${totalVisiveis} visíveis, ${totalInvisiveis} ocultos`);
  
  // Garantir que pelo menos alguns nós estejam visíveis
  if (totalVisiveis === 0) {
    console.warn('[filtros.js] Nenhum nó visível! Considere afrouxar os filtros.');
    document.getElementById('aplicar-filtros-semanticos').style.background = '#8b2e1a';
    setTimeout(() => {
      document.getElementById('aplicar-filtros-semanticos').style.background = '';
    }, 2000);
  }
  
  return {
    visiveis: totalVisiveis,
    invisiveis: totalInvisiveis,
    filtros
  };
}

/**
 * Resetar todos os filtros (marcar todos)
 */
export function resetarFiltros() {
  // Marcar todos os checkboxes
  document.querySelectorAll('.filtro-periodo, .filtro-seculo, .filtro-regiao, .filtro-tipo')
    .forEach(cb => cb.checked = true);
  
  // Reaplica filtros (que agora mostrarão tudo)
  if (window.grafoAtual && window.grafoAtual.entidades) {
    aplicarFiltrosSemanticos(window.grafoAtual.entidades, window.grafoAtual.relacoes);
  }
  
  console.log('[filtros.js] Filtros resetados');
}

/**
 * Obtém cor de um nó baseado no tipo
 */
/**
 * Obtém cor de um nó baseado no tipo
 * FALLBACK: Se entidade não tem tipo, usa 'political' (azul)
 */
export function getNodeColor(entidade) {
  if (!entidade) {
    console.warn('[filtros.js] getNodeColor: entidade undefined');
    return TYPE_COLORS.political;
  }
  
  const type = entidade.type || 'political';
  const color = TYPE_COLORS[type];
  
  if (!color) {
    console.warn(`[filtros.js] Tipo desconhecido: ${type}, usando 'political'`);
    return TYPE_COLORS.political;
  }
  
  // Log primeira vez
  if (!window.__getNodeColorCalled) {
    console.log(`[filtros.js] getNodeColor funcionando! Tipo: ${type}, Cor: ${color}`);
    window.__getNodeColorCalled = true;
  }
  
  return color;
}

/**
 * Obter século de forma segura
 */
function getCentury(year) {
  if (!year) return null;
  return Math.floor((year - 1) / 100) + 1;
}

/**
 * Obter campos semânticos com defaults
 */
function getSemanticFields(entidade) {
  return {
    century_start: entidade.century_start || getCentury(entidade.inicio),
    century_end: entidade.century_end || getCentury(entidade.fim),
    region: entidade.region || 'Multiple',
    type: entidade.type || 'political',
    period: entidade.period || 'Contemporary'
  };
}

/**
 * Inicializa event listeners dos filtros
 */
export function inicializarFiltros() {
  // Botão aplicar filtros
  const btnAplicar = document.getElementById('aplicar-filtros-semanticos');
  if (btnAplicar) {
    btnAplicar.addEventListener('click', () => {
      if (window.grafoAtual && window.grafoAtual.entidades) {
        aplicarFiltrosSemanticos(window.grafoAtual.entidades, window.grafoAtual.relacoes);
      } else {
        console.warn('[filtros.js] Nenhum grafo carregado ainda');
      }
    });
  }
  
  // Botão limpar filtros
  const btnLimpar = document.getElementById('limpar-filtros-semanticos');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', resetarFiltros);
  }
  
  // Aplicar filtros automaticamente quando checkboxes mudam (opcional)
  // Comentado para não sobrecarregar, mas pode ser habilitado
  /*
  document.querySelectorAll('.filtro-periodo, .filtro-seculo, .filtro-regiao, .filtro-tipo')
    .forEach(cb => {
      cb.addEventListener('change', () => {
        if (window.grafoAtual && window.grafoAtual.entidades) {
          aplicarFiltrosSemanticos(window.grafoAtual.entidades, window.grafoAtual.relacoes);
        }
      });
    });
  */
  
  console.log('[OK] Filtros semânticos inicializados');
}

// Auto-inicializar quando DOM estiver pronto
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFiltros);
  } else {
    inicializarFiltros();
  }
}
