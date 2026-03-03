/**
 * DATA.JS — Heródoto v7.14
 * Carregamento e normalização dos datasets JSON.
 * Suporta múltiplos formatos: entidades, personagens, campanhas, etc.
 */

// FIX #10: Armazenar controllers para poder cancelar fetches
let currentFetchControllers = [];

export async function carregarDadosSelecionados() {
  // FIX #10: Cancelar fetches anteriores se existirem
  currentFetchControllers.forEach(ctrl => {
    try {
      ctrl.abort();
    } catch(e) {
      // Ignorar erros de abort
    }
  });
  currentFetchControllers = [];
  
  const selecionados = Array.from(document.querySelectorAll('.dataset:checked')).map(cb => cb.value);
  const fallbackEnabled = false; // DESABILITADO - usuário deve escolher datasets
  const arquivos = selecionados.length ? selecionados : [];
  
  console.log('carregarDadosSelecionados arquivos:', arquivos);
  
  if (arquivos.length === 0) return { entidades: [], relacoes: [] };
  
  const controllers = arquivos.map(() => new AbortController());
  currentFetchControllers = controllers; // FIX #10: Armazenar para poder cancelar
  
  const arrayDeDados = await Promise.all(arquivos.map((f, i) => {
    const url = f.includes('/') ? f : `data/${f}`;
    return fetch(url, { signal: controllers[i].signal })
      .then(r => {
        if (!r.ok) {
          console.warn('fetch não OK', url, r.status);
          return null;
        }
        return r.json();
      })
      .catch(err => { 
        // Não logar erro se foi abortado propositalmente
        if (err.name !== 'AbortError') {
          console.warn('Erro ao buscar', url, err); 
        }
        return null; 
      });
  }));
  
  const entidadeMap = new Map();
  const relacoes = [];

  arrayDeDados.forEach((dados, idx) => {
    console.log('dataset', arquivos[idx], 'loaded ->', !!dados);
    if (!dados) return;
    
    // Extrair nome do dataset do caminho do arquivo
    const datasetName = arquivos[idx].split('/').pop().replace('.json', '');

    // If dataset is a plain array of entities
    if (Array.isArray(dados)) {
      dados.forEach(e => { 
        if (e && e.id) {
          e.dataset = datasetName; // Adiciona dataset
          entidadeMap.set(String(e.id), e); 
        }
      });
      return;
    }

    // Standard shape
    if (Array.isArray(dados.entidades)) {
      dados.entidades.forEach(e => { 
        if (e && e.id) {
          e.dataset = datasetName; // Adiciona dataset
          entidadeMap.set(String(e.id), e); 
        }
      });
    }

    // Alternate shape: `itens` (e.g., examples that use `itens`)
    if (Array.isArray(dados.itens)) {
      dados.itens.forEach(item => {
        if (!item) return;
        const e = Object.assign({}, item);
        if (!e.id) e.id = item.id || item.titulo || item.title || JSON.stringify(item).slice(0,8);
        if (!e.nome) e.nome = item.titulo || item.title || e.nome;
        
        // Map 'ano' to inicio/fim if present
        if (item.ano !== undefined && e.inicio === undefined) {
          e.inicio = item.ano;
          e.fim = item.ano;
        }
        
        // ensure tags array exists; infer from dataset filename when possible
        if (!Array.isArray(e.tags)) {
          const fname = String(arquivos && arquivos[idx] ? arquivos[idx] : '').toLowerCase();
          if (fname.includes('rev-francesa') || fname.includes('revol')) e.tags = ['revolucao'];
          else if (fname.includes('napoleao') || fname.includes('napoleon')) e.tags = ['napoleao'];
          else e.tags = [];
        }
        
        e.dataset = datasetName; // Adiciona dataset
        entidadeMap.set(String(e.id), e);
      });
    }

    // Biography-like small files
    if (dados.biografia) {
      const b = dados.biografia;
      const e = {
        id: b.id || (b.nome ? b.nome.replace(/\s+/g,'_').toLowerCase() : ('bio-' + Math.random().toString(36).slice(2,8))),
        nome: b.nome || b.title || b.id,
        descricao: b.breve || b.descricao || '',
        inicio: b.nascimento,
        fim: b.falecimento,
        tipo: b.tipo || 'evento',
        tags: [], // Adicionar tags vazio se não existir
        dataset: datasetName // Adiciona dataset
      };
      
      // Inferir tag do filename
      const fname = String(arquivos && arquivos[idx] ? arquivos[idx] : '').toLowerCase();
      if (fname.includes('napoleao') || fname.includes('napoleon')) {
        e.tags.push('napoleao');
      }
      
      entidadeMap.set(String(e.id), e);
    }

    // FIX #1: Processar campo 'campanhas' de dados-napoleao.json
    if (Array.isArray(dados.campanhas)) {
      dados.campanhas.forEach((campanha, campIdx) => {
        if (!campanha) return;
        
        const e = {
          id: campanha.id || `campanha-${campIdx}-${Math.random().toString(36).slice(2,6)}`,
          nome: campanha.nome || campanha.title || `Campanha ${campIdx + 1}`,
          descricao: campanha.descricao || campanha.description || `Campanha militar: ${campanha.nome || ''}`,
          inicio: campanha.ano_inicio || campanha.anoInicio || campanha.inicio,
          fim: campanha.ano_fim || campanha.anoFim || campanha.fim || campanha.ano_inicio,
          tipo: campanha.tipo || 'conflito',
          tags: ['napoleao', 'guerra'] // Tags automáticas para campanhas
        };
        
        console.log('Processando campanha:', e.nome);
        entidadeMap.set(String(e.id), e);
      });
    }

    // Collect relations if present
    if (Array.isArray(dados.relacoes)) {
      dados.relacoes.forEach(r => relacoes.push(r));
    }
  });

  // Criar meta-relações (linhas grossas) entre ecossistemas de períodos
  const metaRelacoes = [
    // === FASE 1: ANTIGUIDADE ===
    // Pré-História → Civilizações Antigas
    { origem: 'preh-004', destino: 'egito-001', tipo: 'evolucao', intensidade: 2.0, meta: true, descricao: 'Idade do Bronze permitiu surgimento das primeiras civilizações' },
    { origem: 'preh-004', destino: 'meso-001', tipo: 'evolucao', intensidade: 2.0, meta: true, descricao: 'Revolução Urbana na Mesopotâmia durante Idade do Bronze' },
    
    // Idade do Ferro → Grécia e outros
    { origem: 'preh-005', destino: 'grecia-001', tipo: 'evolucao', intensidade: 1.5, meta: true, descricao: 'Metalurgia do ferro possibilitou expansão grega' },
    
    // Mesopotâmia → Grécia (conexão cultural)
    { origem: 'meso-005', destino: 'grecia-002', tipo: 'influencia', intensidade: 1.5, meta: true, descricao: 'Conquista persa da Babilônia precedeu Guerras Médicas gregas' },
    
    // Grécia Helenística → Roma
    { origem: 'grecia-003', destino: 'roma-001', tipo: 'evolucao', intensidade: 2.0, meta: true, descricao: 'Roma conquistou reinos helenísticos absorvendo cultura grega' },
    
    // Roma → Idade Média
    { origem: 'roma-005', destino: 'medieval-001', tipo: 'evolucao', intensidade: 2.0, meta: true, descricao: 'Queda de Roma levou à Alta Idade Média' },
    { origem: 'roma-007', destino: 'medieval-001', tipo: 'evolucao', intensidade: 1.5, meta: true, descricao: 'Antiguidade Tardia transitou gradualmente para Idade Média' },
    
    // === FASE 2: MEDIEVAL E MODERNA ===
    // Idade Média → Renascimento
    { origem: 'medieval-006', destino: 'ren-new-001', tipo: 'evolucao', intensidade: 2.0, meta: true, descricao: 'Crise do XIV e Peste Negra prepararam transição para Renascimento' },
    
    // Bizâncio → Renascimento
    { origem: 'biz-001', destino: 'ren-new-001', tipo: 'causalidade', intensidade: 1.5, meta: true, descricao: 'Queda de Constantinopla (1453) trouxe refugiados e manuscritos gregos' },
    
    // Califados → Renascimento
    { origem: 'islam-001', destino: 'ren-new-001', tipo: 'influencia', intensidade: 1.5, meta: true, descricao: 'Conhecimento árabe (Aristóteles, matemática, medicina) influenciou Renascimento' },
    
    // Humanismo → Reforma
    { origem: 'ren-new-003', destino: 'reform-001', tipo: 'causalidade', intensidade: 2.0, meta: true, descricao: 'Humanismo crítico preparou questionamento da Igreja na Reforma' },
    
    // Renascimento → Revolução Científica
    { origem: 'ren-new-001', destino: 'moderna-002', tipo: 'evolucao', intensidade: 1.5, meta: true, descricao: 'Renascimento recuperou textos clássicos que alimentaram Revolução Científica' },
    
    // Reforma → Absolutismo
    { origem: 'reform-003', destino: 'moderna-001', tipo: 'causalidade', intensidade: 1.5, meta: true, descricao: 'Guerras de Religião levaram à centralização monárquica absolutista' },
    
    // === FASE 3: CONTEMPORÂNEA ===
    // Iluminismo/Revolução Científica → Revoluções do XVIII
    { origem: 'moderna-002', destino: 'rev18-001', tipo: 'causalidade', intensidade: 2.0, meta: true, descricao: 'Iluminismo e ciência inspiraram ideias revolucionárias americanas e francesas' },
    
    // Revolução Francesa → Napoleão
    { origem: 'rev18-003', destino: 'nap-001', tipo: 'evolucao', intensidade: 2.0, meta: true, descricao: 'Terror Jacobino levou à ascensão de Napoleão' },
    
    // Napoleão → Congresso de Viena
    { origem: 'nap-005', destino: 'sec19-001', tipo: 'causalidade', intensidade: 2.0, meta: true, descricao: 'Derrota napoleônica levou à reorganização conservadora de Viena' },
    
    // Século XIX → Primeira Guerra
    { origem: 'sec19-005', destino: 'pgm-001', tipo: 'causalidade', intensidade: 2.0, meta: true, descricao: 'Belle Époque e tensões imperialistas explodiram na Primeira Guerra' },
    
    // Primeira Guerra → Entreguerras
    { origem: 'pgm-010', destino: 'entr-001', tipo: 'causalidade', intensidade: 2.0, meta: true, descricao: 'Primeira Guerra criou condições para Revolução Russa' },
    { origem: 'pgm-010', destino: 'entr-002', tipo: 'evolucao', intensidade: 1.5, meta: true, descricao: 'Dívidas de guerra contribuíram para Grande Depressão' },
    
    // Entreguerras → Segunda Guerra
    { origem: 'entr-003', destino: 'sgm-001', tipo: 'causalidade', intensidade: 2.0, meta: true, descricao: 'Ascensão do fascismo e nazismo levou à Segunda Guerra' },
    
    // Segunda Guerra → Guerra Fria
    { origem: 'sgm-012', destino: 'gf-001', tipo: 'causalidade', intensidade: 2.0, meta: true, descricao: 'Vitória aliada criou bipolarismo EUA-URSS' },
    
    // Segunda Guerra → Descolonização
    { origem: 'sgm-012', destino: 'descol-001', tipo: 'causalidade', intensidade: 1.5, meta: true, descricao: 'Segunda Guerra enfraqueceu impérios coloniais permitindo independências' },
    
    // Guerra Fria → Pós-Guerra Fria
    { origem: 'gf-012', destino: 'posgf-001', tipo: 'evolucao', intensidade: 2.0, meta: true, descricao: 'Colapso da URSS encerrou Guerra Fria' },
    
    // Pós-Guerra Fria → Globalização
    { origem: 'posgf-001', destino: 'posgf-002', tipo: 'causalidade', intensidade: 1.5, meta: true, descricao: 'Fim da Guerra Fria acelerou globalização neoliberal' },
    
    // === CONEXÕES ANTIGAS (mantidas) ===
    // Antiguidade → Idade Média
    { origem: 'ant-014', destino: 'med-002', tipo: 'evolucao', intensidade: 1.5, meta: true, descricao: 'Queda de Roma levou à fragmentação carolíngia' },
    // Idade Média → Renascimento
    { origem: 'med-007', destino: 'ren-001', tipo: 'evolucao', intensidade: 1.5, meta: true, descricao: 'Refugiados bizantinos impulsionaram Renascimento italiano' },
    // Renascimento → Navegações
    { origem: 'ren-005', destino: 'nav-001', tipo: 'causalidade', intensidade: 1.5, meta: true, descricao: 'Imprensa e conhecimento possibilitaram navegações' },
    // Navegações → Revolução Industrial
    { origem: 'nav-009', destino: 'ri-001', tipo: 'causalidade', intensidade: 1.5, meta: true, descricao: 'Intercâmbio colombiano forneceu recursos para industrialização' },
    // Iluminismo → Revolução Francesa
    { origem: 'ilum-003', destino: 'rev-001', tipo: 'causalidade', intensidade: 1.5, meta: true, descricao: 'Ideias de Rousseau inspiraram revolucionários franceses' },
    // Revolução Francesa → Napoleão (antiga)
    { origem: 'rev-001', destino: 'nap-001', tipo: 'evolucao', intensidade: 1.5, meta: true, descricao: 'Revolução criou condições para ascensão napoleônica' }
  ];
  
  // Adicionar meta-relações apenas se ambas entidades existem
  metaRelacoes.forEach(mr => {
    if (entidadeMap.has(mr.origem) && entidadeMap.has(mr.destino)) {
      relacoes.push(mr);
    }
  });

  return { entidades: Array.from(entidadeMap.values()), relacoes };
}

export function filterData(todosOsDados) {
  if (!todosOsDados) return { entidades: [], relacoes: [] };
  
  // v6.0: Filtro por ano removido, agora usa filtros semânticos
  // Retornar todos os dados sem filtrar
  return todosOsDados;
}

export function getDataExtents(todosOsDados) {
  const anos = (todosOsDados.entidades || []).reduce((acc, e) => {
    if (typeof e.inicio === 'number') acc.push(e.inicio);
    if (typeof e.fim === 'number') acc.push(e.fim);
    return acc;
  }, []);
  
  const minYear = anos.length ? Math.min(...anos) : 1700;
  const maxYear = anos.length ? Math.max(...anos) : 1900;
  
  return { minYear, maxYear };
}
