# CHANGELOG — Heródoto
*Linha do Tempo Interativa e Grafo de Conhecimento Histórico*

---

## v7.20 — Brasil: 16 Períodos Cronológicos

**Dados**
- Substituídos ~12 datasets genéricos de Brasil por 16 arquivos cronológicos precisos (104 entidades novas):
  - `01-povos-originarios` — Paleoíndios, Sambaquis, Marajoara, Tupi-Guarani, Alto Xingu, colapso demográfico
  - `02-pre-colonial` — Chegada de Cabral, pau-brasil, náufragos/língua-geral, ameaça francesa
  - `03-capitanias` — Martim Afonso, capitanias hereditárias, escravidão indígena, engenhos
  - `04-governo-geral` — Nóbrega, Anchieta, Confederação dos Tamoios, fundação do Rio
  - `05-uniao-iberica` — Brasil holandês, Nassau, WIC, França Equinocial, tráfico negreiro
  - `06-bandeirismo` — Palmares, bandeirantes, missões do Guairá, revoltas nativistas
  - `07-ciclo-ouro` — Vila Rica, barroco mineiro, Inconfidência, Conjuração Baiana, Pombal
  - `08-joanino` — Fuga da corte, abertura dos portos, tratados com a Inglaterra, Missão Francesa
  - `09-independencia` — 7 de setembro, Constituição de 1824, Confederação do Equador, abdicação
  - `10-regencial` — Cabanagem, Balaiada, Farroupilha, Revolta dos Malês, Golpe da Maioridade
  - `11-segundo-reinado` — D. Pedro II, Guerra do Paraguai, abolição, imigração, ferrovia
  - `12-republica-velha` — Café-com-leite, Canudos, Revolta da Chibata, greve de 1917, tenentismo
  - `13-era-vargas` — Revolução de 1930, Estado Novo, CLT, industrialização, suicídio de Vargas
  - `14-populismo` — JK/Brasília, bossa nova, Goulart, reformas de base, Ligas Camponesas
  - `15-ditadura` — Golpe de 1964, AI-5, milagre econômico, Araguaia, abertura, Constituição 1988
  - `16-nova-republica` — Collor/impeachment, Plano Real, FHC, Lula, Dilma, Bolsonaro, 8 de janeiro
- Mantidos datasets temáticos transversais: quilombos, indígenas, cultura-arte, economia-social, escravidão colonial, missões jesuíticas, guerra do Paraguai, inconfidência, independência

**Scroll vertical corrigido definitivamente**
- Problema: `preventDefault()` no wheel event bloqueava scroll vertical mesmo sem Ctrl pressionado
- Solução: scroll vertical agora aciona `body.scrollTop += deltaY` manualmente — o canvas SVG não intercepta mais
- Ctrl+scroll → zoom | scroll horizontal → pan lateral | scroll vertical → navegar entre regiões

---

## v7.19 — Equilíbrio Editorial, Interface Unificada, Scroll

**Dados — 13 personalidades bíblicas** (`dados-personagens-biblicas.json`)
- Rigor historiográfico: distinção explícita entre narrativa bíblica e atestação histórica externa
- Fontes indicadas por entidade: Josefo, Tácito, Plínio, inscrições arqueológicas
- Casos notáveis: Maria Madalena (correção do mito da prostituta — decretado erro em 1969), Pôncio Pilatos (inscrição de Cesareia, 1961), Moisés (sem evidência arqueológica direta — explicitado)
- Brasil expandido de 157 → 189 entidades: cultura-arte (+8), economia-social (+6), ditadura (+5), indígenas (+5), quilombos (+4), revoltas-república (+4)

**5 entradas reequilibradas editorialmente**
- Golpe/Revolução 1964 — apresenta ambas as nomenclaturas com suas perspectivas
- Desigualdade estrutural — visão histórica, econômico-institucional e cultural
- Bolsa Família — acrescenta críticas reais: custo fiscal, dependência, uso eleitoral
- MST — inclui argumento do direito de propriedade e episódios de violência
- Abolição/Democracia Racial — debate Gilberto Freyre vs. Florestan Fernandes como questão aberta

**Interface — controles da timeline unificados**
- 4 barras separadas (era / tipo / busca / ações) consolidadas em 1 `tl-controls-bar` com seções rotuladas
- Rótulos `Era` e `Tipo` adicionados para clareza pedagógica
- Botão ⊟/⊞ colapsa ou expande todas as regiões com um clique
- Botão `✕ limpar` reseta era, tipos e busca simultaneamente
- Contador de eventos movido para o header, sempre visível
- Hint de instrução como pseudo-elemento CSS (`.tl-svg-cont::after`), desaparece após o primeiro arrasto
- Painel lateral com animação slide-in (`@keyframes spSlideIn`, 0.22s)
- Botão Personalidades corrigido: cor base idêntica aos demais botões da toolbar

**Zip** — removidos `.md`, `.txt`, `.bak` e diretório `scripts/`

---

## v7.18 — 7 Novos Módulos JS, China e Islã

**7 novos arquivos JavaScript**
- `timeline.js` — Linha do tempo SVG interativa (rebuild completo): eixo histórico com escala logarítmica para pré-história e linear para história, zoom/pan, clustering, rows colapsíveis
- `search.js` — Busca textual global em todas as entidades carregadas (`window.todosOsDados`): pesquisa em nome, descrição, importância e tags; até 20 resultados com preview e navegação ao nó
- `compare.js` — Modo de comparação lado-a-lado de dois eventos históricos
- `questions.js` — 20 perguntas geradoras curadas que selecionam datasets relevantes e renderizam o grafo automaticamente
- `causal-chain.js` — Percorre relações de `causalidade`/`evolucao` a partir de um nó, exibe árvore de 2 níveis em painel flutuante
- `consequence-chain.js` — Cadeias de antecedentes e consequentes em painel deslizante com timeline vertical
- `dataset-labels.js` — Rótulos trilingues (PT/EN/ES) para todos os 182+ datasets

**Arquivos existentes atualizados** — `context-panel.js`, `filtros.js`, `graph.js`, `i18n.js`, `legend-filter.js`, `main.js`, `components.css`, `index.html`

**Dados** — 11 datasets novos (210 → 221, 1.259 → 1.329 entidades)
- China: neolítico, Shang-Zhou, Mao/revolução, Ming-explorações, Qing-sociedade, Song-ciência
- Islã: origens, fragmentação, Al-Andalus
- Índia medieval-moderna

---

## v7.17 — Grécia Clássica e Idade Média Aprofundadas

**Dados** — 8 datasets novos (202 → 210, 1.195 → 1.259 entidades)
- Grécia: Alexandre Magno, Atenas clássica, Esparta
- Roma: exército, sociedade
- Medieval: castelos e cavalaria, cruzadas expandidas, cidades e universidades

---

## v7.16 — Mesoamérica e Andes Completos

**Dados** — 13 datasets novos (189 → 202, 1.116 → 1.195 entidades)
- Mesoamérica: Olmecas, Teotihuacan, Toltecas, Astecas, Zapotecas/Mixtecas, Maya ciência, Caral
- Andes: Chimu, Wari, Mapuches e povos do Sul, Tupis-Guaranis Amazônia

---

## v7.15 — EUA Completo, Mesopotâmia e Pérsia

**Dados** — 15 datasets novos (174 → 189, 1.013 → 1.116 entidades)
- EUA completo: colônias, guerra civil, expansão, Gilded Age, New Deal, guerra fria, contemporâneo
- Mesopotâmia clássica e hebreus/fenícios
- Pérsia: zoroastrismo e cultura | Suméria: religião e legado

---

## v7.14 — Japão, Coreia, Sudeste Asiático, Egito

**Dados** — 16 datasets novos (158 → 174, 918 → 1.013 entidades)
- Japão: antigo, arcaico, Sengoku | Coreia: Joseon
- Egito: Antigo/Médio Reino, Novo Reino, Tardio
- Sudeste Asiático: continental e marítimo
- Suméria expandida | Pérsia expandida | Maya expandido

**Código** — `main.js` refatorado com cabeçalho de versão; `guided-mode.js` renomeado de Órion → Heródoto; `data.js` e `i18n.js` atualizados

---

## v7.13 — Expansão Massiva: 34 Datasets

**Dados** — 34 datasets novos (124 → 158, 698 → 918 entidades)
- Brasil colonial completo: escravidão, contemporâneo, era Vargas, guerra do Paraguai, inconfidência, independência, missões jesuíticas, pré-colonial, redemocratização, república velha
- Mundo: Bronze Egeu, Carolíngios, Coreia antiga/moderna, cruzadas, filosofia moderna e racionalismo, Grécia (cultura, filosofia, guerras), Japão (Meiji, moderno), feudalismo medieval, Mesopotâmia, Mongóis, Pré-história (Américas, Europa, Neolítico, Paleolítico), Renascimento Norte, Revoluções liberais, Roma cultura, Rússia Pedro/Catarina, absolutismo

---

## v7.12 — Igreja Católica: 7 Datasets Temáticos

**Dados** — 7 datasets novos (117 → 124, 660 → 698 entidades)
- Concílios Ecuménicos, Igreja e Ciência, Igreja e Escravidão, Fundação da Igreja, Igreja Medieval e Cultura, Inquisição, Lutero e a Reforma

---

## v7.8–v7.11 — Smart Dataset Clustering (iterações)

**Código** — `graph.js` série de rebuilds do motor de física:
- v7.8: Smart Dataset Clustering v2 — grid de células, forças de coesão intra-dataset e repulsão inter-dataset
- v7.9–v7.10: correções de performance, memory leaks e posicionamento temporal
- `base.css` — ajustes menores de layout

---

## v7.6–v7.7 — Estabilizações

**Código** — `i18n.js` e `index.html` atualizados para novos datasets; refinamentos menores

---

## v7.5 — Segundo Reinado: Ciência, Figuras e Infraestrutura

**Dados** — 3 datasets novos (114 → 117, 642 → 660 entidades)
- `dados-brasil-imperio-ciencia.json` — D. Pedro II mecenas, Colégio Pedro II, IHGB, exposições universais
- `dados-brasil-imperio-figuras.json` — Caxias, Mauá, Nabuco, Machado de Assis, Rui Barbosa e outros
- `dados-brasil-imperio-infraestrutura.json` — Ferrovias, telégrafo elétrico, modernização dos portos

---

## v7.4 — Roma, Suméria, Hélade, Índia

**Dados** — 8 datasets novos (106 → 114, 607 → 642 entidades)
- Fenícios/Cartago, Helenismo e ciência, Hitititas/Bronze, Índia védica/Maurya, Queda de Roma, Roma Imperial, Roma República, Suméria cidades

---

## v7.3 — Antártida, Quilombos, Ditadura

**Dados** — 4 datasets novos (102 → 106, 590 → 607 entidades)
- `dados-antartica-descoberta.json`, `dados-antartica-moderna.json`
- `dados-brasil-ditadura.json`, `dados-brasil-quilombos.json`

---

## v7.2 — PWA e Responsividade Mobile

**Código**
- `index.html` — suporte completo a PWA: `manifest.json`, service worker, meta tags Apple/Android, ícones touch (192px e SVG)
- `base.css` — `height: calc(var(--app-height, 100dvh) - 88px)` para mobile com barra retrátil do navegador; fita decorativa lateral com `border-image` gradiente (dourado → vermelho ocre → dourado)
- `components.css` — layout mobile landscape: border-image lateral removida, bordas superior/inferior

---

## v7.1 — Paleta Histórica de Pigmentos

**Código** — substituição completa da paleta por pigmentos historicamente referenciados:

| Tipo | Cor | Pigmento |
|---|---|---|
| Político | `#2b4b7e` | Azul lápis-lazúli |
| Guerra | `#8b2e1a` | Vermelho cinábrio |
| Econômico | `#a0622a` | Ocre queimado |
| Cultural | `#5c2d6e` | Púrpura imperial |
| Religioso | `#2e6b4f` | Verde malaquita |
| Social | `#b07a28` | Âmbar natural |
| Tecnológico | `#3d3d3d` | Ferro escurecido |
| Intelectual | `#4a2060` | Violeta escuro |
| Pessoa | `#8a6a20` | Ouro velho |

- `graph.js` — arestas com opacidade variável por intensidade histórica (simulação de tinta de pena desbotada); cor base `rgba(59,43,31,…)` — marrom sépia
- Paleta sincronizada em `filtros.js` e `legend-filter.js`

---

## v7.0 — Linha do Tempo SVG Interativa

**Funcionalidades novas**
- Timeline SVG com eixo histórico: escala logarítmica para pré-história, linear para história
- Zoom via scroll, pan via arrasto
- Clustering automático de eventos sobrepostos
- Rows colapsíveis por região geográfica
- Hierarquia visual: tamanho e opacidade dos pontos variam por peso histórico
- Filtros de era (5 períodos) e tipo (9 categorias)
- Painel lateral de detalhes: acento colorido por tipo, descrição completa, importância, tags
- Busca em tempo real com contagem de resultados filtrados

**Dados** — 6 datasets novos (96 → 102, 567 → 590 entidades)
- África Norte, América Latina séc. XX, Indígenas Brasileiros, EUA história, EUA séc. XX, Europa Medieval aprofundada

---

## v6.9-final — Refactoring de Identidade

**Código**
- `legend-filter.js`, `context-panel.js` — comentários internos renomeados de "Órion v6.1" → "Heródoto"
- `filtros-semanticos.html` — convertido de fragmento para documento HTML completo com `<!DOCTYPE>`, `<head>`, `<meta charset>` e `<title>`
- Emojis removidos dos títulos de seção nos filtros semânticos

---

## v6.9 — Brasil Econômico e Revoltoso; Holocausto

**Dados** — 3 datasets novos (93 → 96, 557 → 567 entidades)
- `dados-brasil-ciclos-economicos.json` — pau-brasil, açúcar, ouro, café
- `dados-brasil-revoltas-republica.json` — Revolta da Vacina, Chibata, Tenentismo, Contestado, Intentona Comunista, Greve Geral de 1917
- `dados-holocausto.json`

---

## v6.8-final — Base do Heródoto

**Estado inicial do projeto** — 93 datasets, 557 entidades
- Grafo de conhecimento histórico interativo com D3.js force-directed layout
- Filtros semânticos por período histórico, região geográfica e tipo de evento
- Modo guiado com narrativas históricas estruturadas
- Interface trilíngue (PT / EN / ES) com troca instantânea
- Paleta visual de manuscrito medieval: pergaminho, tinta sépia, dourado, vermelho ocre
- Painel de contexto com entidade selecionada, conexões causais e referências