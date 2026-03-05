# CHANGELOG — Heródoto
*anteriormente Órion · Grafo de Conhecimento Histórico e Linha do Tempo Interativa*



---

## v7.25 — Auditoria de Tipos, +65 Personagens, +13 Perguntas Geradoras

**Correção de tipos**
- 18 entidades com `type: 'military'` (tipo inválido) corrigidas para `type: 'war'`
- 221 personagens sem campo `type` agora têm `type: 'person'` — passam a aparecer na timeline
- Adicionados campos `inicio`, `fim` e `region` a todos os personagens (necessários para renderização na timeline)
- Resultado: 0 entidades sem tipo em 1751 entidades totais

**Novos personagens (+65, total: 286)**
- `dados-personagens-mulheres.json` (novo, 20): Cleópatra VII, Hildegarda de Bingen, Wu Zetian, Rosa Parks, Enheduanna, Ada Lovelace, Nzinga de Angola, Marie Curie, Indira Gandhi, Mary Wollstonecraft, Boudicca, Yaa Asantewaa, Hatshepsut, Sojourner Truth, Aung San Suu Kyi, Hypatia, Lakshmibai, Harriet Tubman, Valentina Tereshkova, Eleanor Roosevelt
- `dados-personagens-filosofia-oriental.json` (novo, 15): Confúcio, Buda, Laozi, Nagarjuna, Averróis, Zhuangzi, Al-Ghazali, Mencius, Shankara, Rumi, Mozi, Nalanda, Kanishka I, Fazang, Xuanzang
- `dados-personagens-seculo-xx.json` (novo, 20): Mandela, MLK, Gandhi, Che Guevara, Mao, Ho Chi Minh, Castro, Mother Teresa, Malala, Gorbachev, Hammarskjöld, Wangari Maathai, Deng Xiaoping, Wałęsa, Simone de Beauvoir, Allende, Lumumba, Angela Davis, Arafat, Steve Biko
- `dados-personagens-americas.json` (+10): Moctezuma II, Bolívar, Frederick Douglass, Sor Juana, Túpac Amaru II, Geronimo, Hatuey, H. Beecher Stowe, Zapata, Pachacutec

**Novas perguntas geradoras (+13, total: 106)**
- Grupo: Mulheres na História (3 perguntas)
- Grupo: Filosofia Oriental e Sabedoria Asiática (3 perguntas)
- Grupo: Século XX — Poder e Resistência (4 perguntas)
- Grupo: América Latina — Conquista, Resistência e Revolução (3 perguntas)

**IDs duplicados**
- 22 IDs duplicados detectados e corrigidos — resultado final: 0 duplicatas

---
---

## v7.24 — Timeline: Navegação e Visualização Melhoradas

**Zoom**
- Scroll Ctrl+roda: fator 1.22 → 1.07 por tick (suave, não salta)
- Botões +/−: fator 1.65 → 1.40 por clique
- Limites: min 0.35× / max 25× (antes 0.08–40×)

**Canvas e enquadramento inicial**
- `computeBaseCW` reescrito: `sc=1` agora mostra a era completa confortavelmente (88% do viewport cobre o intervalo da era); antes mostrava só 28% da era no estado inicial
- `clampTx` com 80px de padding à direita — último evento nunca mais cortado

**Lanes**
- `MAX_LANES = 14`: limite de linhas por região; eventos excedentes sobrepõem em vez de multiplicar lanes infinitamente

**Indicadores de overflow**
- Fade suave na borda esquerda: indica que eventos começam antes da era visível
- Fade suave na borda direita: indica que há conteúdo além da tela

---
---

## v7.23 — Scroll da Timeline Corrigido

**Navegação por scroll**
- Scroll vertical (sem modificador) → rola as linhas/regiões da timeline para cima e para baixo
- Ctrl+Scroll (ou Cmd+Scroll no Mac) → zoom in/out no eixo temporal
- Shift+Scroll → pan horizontal (alternativa ao arrasto)
- Scroll horizontal (trackpad swipe) → pan horizontal nativo
- Evento attached ao painel inteiro (`tl-panel`), não só ao SVG — funciona em qualquer área da timeline

**Hint de instrução atualizado** (PT/EN/ES) para refletir os novos controles

---

## v7.22 — Auditoria Completa: Bugs, Duplicatas e Cache

**Bug crítico — Timeline parada (sintaxe)**
- `ALL_DATASETS` reconstruído do zero com sintaxe limpa: vírgulas corretas entre todas as 255 entradas, agrupadas por região com comentários
- `async async function openTimeline()` corrigido para `async function openTimeline()` (duplo async quebrava todo o módulo ES6)
- Service worker `sw.js`: versão do cache bumped de `herodoto-v7-1` → `herodoto-v7-22` para forçar invalidação em clientes com versão quebrada cacheada

**43 datasets ausentes do ALL_DATASETS**
- Todos os 16 períodos do Brasil, 12 arquivos de personalidades e 15 outros datasets adicionados à timeline

**76 IDs duplicados em 12 arquivos corrigidos**
- Prefixos únicos aplicados: `aland-`, `binc-`, `caa-`, `cac-`, `cora-`, `corm-`, `euagf-`, `grf-`, `mayc-`, `mesoc-`, `pham-`, `sacol-`, `sudcon-`
- Resultado: **0 IDs duplicados** em 251 arquivos, 1635 entidades

---

## v7.21 — Sidebar Brasil Corrigida, Duplicatas de Personalidades Removidas

**Interface**
- `index.html` — seção Brasil da sidebar substituída: entradas antigas (Colonial, Império, República genéricos)
  pelos 16 períodos cronológicos numerados (01 Povos Originários → 16 Nova República)

**Dados — personalidades**
- Removidas 24 entradas duplicadas em 9 arquivos de personalidades
- Duplicatas internas: Voltaire, Kant, Adam Smith, Mary Wollstonecraft, Che Guevara, Tupac Amaru II,
  Darwin, Marx, Freud, Florence Nightingale, Winston Churchill, Mao Tsé-Tung, Simone de Beauvoir
- Duplicatas entre arquivos (mantida versão mais contextualmente adequada):
  Cleópatra VII → grecia-roma | Ibn Battuta → medieval | Harriet Tubman → americas |
  Ho Chi Minh → asia | Isaac Newton → renascimento-reforma | Joana d'Arc → medieval |
  Nietzsche → seculo-xix | Toussaint Louverture → americas | Mansa Musa → africa-oriente |
  Avicena → medieval | Nelson Mandela → seculo-xx-guerras
- Total: 194 → 170 personalidades únicas

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
- Mantidos datasets temáticos transversais: quilombos, indígenas, cultura-arte, economia-social,
  escravidão colonial, missões jesuíticas, guerra do Paraguai, inconfidência, independência

**Scroll vertical corrigido definitivamente**
- Problema: `preventDefault()` bloqueava scroll vertical mesmo sem Ctrl pressionado
- Solução: scroll vertical aciona `body.scrollTop += deltaY` manualmente — SVG não intercepta
- Ctrl+scroll → zoom | scroll horizontal → pan lateral | scroll vertical → navegar entre regiões

---

## v7.19 — Equilíbrio Editorial, Interface Unificada

**Dados — 13 personalidades bíblicas** (`dados-personagens-biblicas.json`)
- Rigor historiográfico: distinção explícita entre narrativa bíblica e atestação histórica externa
- Fontes indicadas por entidade: Josefo, Tácito, Plínio, inscrições arqueológicas
- Brasil expandido de 157 → 189 entidades: cultura-arte (+8), economia-social (+6), ditadura (+5), indígenas (+5), quilombos (+4), revoltas-república (+4)

**5 entradas reequilibradas editorialmente**
- Golpe/Revolução 1964 — ambas as nomenclaturas com perspectivas distintas
- Desigualdade estrutural — visão histórica, econômico-institucional e cultural
- Bolsa Família — acrescenta críticas: custo fiscal, dependência, uso eleitoral
- MST — inclui argumento do direito de propriedade e episódios de violência
- Abolição/Democracia Racial — debate Gilberto Freyre vs. Florestan Fernandes como questão aberta

**Interface — controles da timeline unificados**
- 4 barras separadas (era / tipo / busca / ações) → 1 `tl-controls-bar` com seções rotuladas
- Botão ⊟/⊞ colapsa/expande todas as regiões de uma vez
- Botão `✕ limpar` reseta era, tipos e busca simultaneamente
- Contador de eventos movido para o header
- Hint de instrução como pseudo-elemento CSS, desaparece após o primeiro arrasto
- Painel lateral com animação slide-in (0.22s)
- Botão Personalidades corrigido: cor base idêntica aos demais botões da toolbar

**Zip** — removidos `.md`, `.txt`, `.bak` e diretório `scripts/`

---

## v7.18 — 7 Novos Módulos JS, China e Islã

**7 novos arquivos JavaScript**
- `timeline.js` — Linha do tempo SVG (rebuild): eixo histórico, zoom/pan, clustering, rows colapsíveis
- `search.js` — Busca textual global em todas as entidades carregadas; até 20 resultados com preview
- `compare.js` — Comparação lado-a-lado de dois eventos históricos
- `questions.js` — 20 perguntas geradoras curadas que selecionam datasets e renderizam o grafo
- `causal-chain.js` — Percorre relações de causalidade/evolução a partir de um nó, árvore de 2 níveis
- `consequence-chain.js` — Antecedentes e consequentes em painel deslizante com timeline vertical
- `dataset-labels.js` — Rótulos trilingues (PT/EN/ES) para todos os 182+ datasets

**Dados** — 11 datasets novos (210 → 221, 1.259 → 1.329 entidades)
- China: neolítico, Shang-Zhou, Mao/revolução, Ming-explorações, Qing-sociedade, Song-ciência
- Islã: origens, fragmentação, Al-Andalus | Índia medieval-moderna

---

## v7.17 — Grécia Clássica e Idade Média Aprofundadas

**Dados** — 8 datasets novos (202 → 210, 1.195 → 1.259 entidades)
- Grécia: Alexandre Magno, Atenas clássica, Esparta
- Roma: exército, sociedade | Medieval: castelos e cavalaria, cruzadas expandidas, cidades e universidades

---

## v7.16 — Mesoamérica e Andes Completos

**Dados** — 13 datasets novos (189 → 202, 1.116 → 1.195 entidades)
- Mesoamérica: Olmecas, Teotihuacan, Toltecas, Astecas, Zapotecas/Mixtecas, Maya ciência, Caral
- Andes: Chimu, Wari, Mapuches e povos do Sul, Tupis-Guaranis Amazônia

---

## v7.15 — EUA Completo, Mesopotâmia e Pérsia

**Dados** — 15 datasets novos (174 → 189, 1.013 → 1.116 entidades)
- EUA completo: colônias, guerra civil, expansão, Gilded Age, New Deal, guerra fria, contemporâneo
- Mesopotâmia clássica e hebreus/fenícios | Pérsia: zoroastrismo | Suméria: religião e legado

---

## v7.14 — Japão, Coreia, Sudeste Asiático, Egito

**Dados** — 16 datasets novos (158 → 174, 918 → 1.013 entidades)
- Japão: antigo, arcaico, Sengoku | Coreia: Joseon
- Egito: Antigo/Médio Reino, Novo Reino, Tardio | Sudeste Asiático: continental e marítimo

**Código** — `main.js` refatorado; `guided-mode.js` renomeado de Órion → Heródoto

---

## v7.13 — Expansão Massiva: 34 Datasets

**Dados** — 34 datasets novos (124 → 158, 698 → 918 entidades)
- Brasil colonial completo: escravidão, contemporâneo, era Vargas, guerra do Paraguai, inconfidência,
  independência, missões jesuíticas, pré-colonial, redemocratização, república velha
- Mundo: Bronze Egeu, Carolíngios, Coreia, cruzadas, filosofia moderna/racionalismo,
  Grécia (cultura, filosofia, guerras), Japão (Meiji, moderno), feudalismo medieval,
  Mesopotâmia, Mongóis, Pré-história (Américas, Europa, Neolítico, Paleolítico),
  Renascimento Norte, Revoluções liberais, Roma cultura, Rússia Pedro/Catarina, absolutismo

---

## v7.12 — Igreja Católica: 7 Datasets Temáticos

**Dados** — 7 datasets novos (117 → 124, 660 → 698 entidades)
- Concílios Ecuménicos, Igreja e Ciência, Igreja e Escravidão, Fundação da Igreja,
  Igreja Medieval e Cultura, Inquisição, Lutero e a Reforma

---

## v7.8–v7.11 — Smart Dataset Clustering (iterações)

**Código** — `graph.js` série de rebuilds:
- v7.8: Smart Dataset Clustering v2 — grid de células, coesão intra-dataset e repulsão inter-dataset
- v7.9–v7.10: correções de performance, memory leaks e posicionamento temporal

---

## v7.5 — Segundo Reinado: Ciência, Figuras e Infraestrutura

**Dados** — 3 datasets novos (114 → 117, 642 → 660 entidades)
- `dados-brasil-imperio-ciencia.json` | `dados-brasil-imperio-figuras.json` | `dados-brasil-imperio-infraestrutura.json`

---

## v7.4 — Roma, Suméria, Hélade, Índia

**Dados** — 8 datasets novos (106 → 114, 607 → 642 entidades)
- Fenícios/Cartago, Helenismo e ciência, Hitititas/Bronze, Índia védica/Maurya,
  Queda de Roma, Roma Imperial, Roma República, Suméria cidades

---

## v7.3 — Antártida, Quilombos, Ditadura

**Dados** — 4 datasets novos (102 → 106, 590 → 607 entidades)
- `dados-antartica-descoberta.json`, `dados-antartica-moderna.json`
- `dados-brasil-ditadura.json`, `dados-brasil-quilombos.json`

---

## v7.2 — PWA e Responsividade Mobile

**Código**
- `index.html` — PWA completo: `manifest.json`, service worker, meta tags Apple/Android, ícones touch
- `base.css` — `100dvh` para mobile com barra retrátil; fita decorativa com `border-image` gradiente
- `components.css` — layout mobile landscape

---

## v7.1 — Paleta Histórica de Pigmentos

**Código** — paleta saturada moderna → pigmentos historicamente referenciados:
`#2b4b7e` lápis-lazúli · `#8b2e1a` cinábrio · `#a0622a` ocre · `#5c2d6e` púrpura imperial ·
`#2e6b4f` malaquita · `#b07a28` âmbar · `#3d3d3d` ferro escurecido · `#8a6a20` ouro velho
- `graph.js` — arestas com opacidade variável por intensidade histórica (tinta de pena desbotada)

---

## v7.0 — Linha do Tempo SVG Interativa

**Funcionalidades novas**
- Timeline SVG com eixo histórico (pré-história logarítmica + história linear)
- Zoom (scroll), pan (arrasto), clustering de eventos próximos
- Rows colapsíveis por região geográfica
- Filtros de era (5 períodos) e tipo (9 categorias)
- Painel lateral de detalhes ao clicar num evento

**Dados** — 6 datasets novos (96 → 102, 567 → 590 entidades)
- África Norte, América Latina séc. XX, Indígenas Brasileiros, EUA história, EUA séc. XX, Europa Medieval

---

## v6.9-final (→ Heródoto) — Refactoring de Identidade

**Código**
- `legend-filter.js`, `context-panel.js` — comentários "Órion v6.1" → "Heródoto"
- `filtros-semanticos.html` — convertido de fragmento para documento HTML completo
- Emojis removidos dos títulos de seção nos filtros

---

## v6.9 — Brasil Econômico e Holocausto

**Dados** — 3 datasets novos (93 → 96, 557 → 567 entidades)
- `dados-brasil-ciclos-economicos.json`, `dados-brasil-revoltas-republica.json`, `dados-holocausto.json`

---

## Órion v6.7-bias-fixed

Correção de viés editorial em entradas da China moderna e Oriente Médio (sem adição de datasets)

---

## Órion v6.7-final — China e Ásia: Cobertura Completa

**Dados** — 19 datasets novos (74 → 93, 516 → 557 entidades)
- China completa: filosofia, Ming, PRC, Qin-Han, Qing, República, Song-Yuan, Tang, Três Reinos
- Oriente Médio: Arábia pré-islâmica, Arábia Saudita, Ásia Central, Irã moderno, Israel-Palestina, Turquia
- Índia britânica, Índia medieval, Mongóis Gengis Khan, Sudeste Asiático colonial

---

## Órion v6.6-final — África e Ásia Oriental Expandidas

**Dados** — 11 datasets novos (63 → 74, 484 → 516 entidades)
- África: centro-sul, ocidental, oriental
- Ásia: China antiga, Índia antiga, Japão feudal e Meiji, Pérsia antiga
- Américas: Caribe colonial, Maya clássico, Povos Nativos do Norte | Oriente Médio Moderno

**Interface** — rótulos de grupo de datasets adicionados com `data-i18n`

---

## Órion v6.5-final — Internacionalização dos Rótulos

**Código** — `index.html`: todos os `dataset-group-label` recebem atributo `data-i18n`

---

## Órion v6.4-final — Evolução Humana

**Dados** — 1 dataset novo: `dados-evolucao-humana.json` (62 → 63, 474 → 484 entidades)

---

## Órion v6.3-final — Expansão Mundial: 28 Datasets

**Dados** — 28 datasets novos (34 → 62, 290 → 474 entidades)
- Américas: coloniais, Astecas, Incas, Independências da América Latina
- Europa: Capitalismo, Guerras Napoleônicas, Imperialismo, Nacionalismo, Reforma Protestante,
  Renascimento Italiano, Revolução Francesa, Revolução Russa, Rússia Czarismo, Socialismo
- Ásia: China Imperial, Coreia, Japão, Mongóis | África: Reinos Africanos
- Outros: Civilizações Mediterrâneo, Ciência e Tecnologia, Descolonização, Existencialismo,
  Filosofia Medieval, Movimentos de Arte, Movimentos Sociais, Religiões do Mundo, Sudeste Asiático

---

## Órion v6.2 — Pensamento e Oriente

**Dados** — 8 datasets novos (26 → 34, 147 → 290 entidades)
- Filosofia Antiga, Iluminismo, Império Otomano, Índia Mogol, Mongóis Ásia Central,
  Revolução Científica, Revolução Industrial, África Pré-Colonial

---

## Órion v6.1 — 4 Novos Módulos JS

**Código** — 4 novos arquivos JavaScript:
- `context-panel.js` — painel lateral dinâmico ao clicar num nó
- `guided-mode.js` — modo guiado com narrativas históricas estruturadas
- `legend-filter.js` — legenda interativa de tipos com filtro por opacidade
- `geo-layer.js` — camada geográfica auxiliar

---

## Órion v6.0 — Filtros Semânticos Contextuais

**Código**
- `filtros.js` (novo) — lógica de filtro por tipo histórico, `getNodeColor()` centralizado
- `index.html` — filtros contextuais: séculos, continentes, tipo histórico (com `<details>`)
- `graph.js` — integrado com `filtros.js`; `window.grafoAtual` exposto

**Iterações internas** (BASE-CONTEXT-SELECTOR → FIX-COMPLETO → SEM-EMOJIS →
FINAL-LIMPO → ORGANIZADO → ESTETICA-CLASSICA → INTEGRADO):
emojis removidos, revisão de dados, teste de paleta clara (revertida), sidebar escura definitiva

---

## Órion v5.7 — Mesoamérica e Andes

**Dados** — 2 datasets novos (24 → 26, 136 → 147 entidades)
- `dados-mesoamerica.json`, `dados-andes.json`

---

## Órion v5.6 — Clustering 2D por Dataset

**Código** — `graph.js`: separação temporal forte → suave + distribuição Y por grupo de dataset

---

## Órion v5.5 — Limpeza de Datasets Duplicados

**Dados** — 8 datasets antigos removidos, substituídos pelas versões v5 mais ricas

---

## Órion v5.4 — Brasil no Grafo

**Dados** — 4 datasets novos (28 → 32, 167 → 203 entidades)
- Brasil colonial inicial e tardio, Brasil imperial, Brasil republicano

---

## Órion v5.2 — Mundo Completo: 12 Datasets

**Dados** — 12 datasets novos (16 → 28, 134 → 167 entidades)
- Bizâncio/Medieval, Califados Islâmicos, Descolonização, Entreguerras, Era Moderna,
  Idade Média Europeia, Pós-Guerra Fria, 1ª Guerra (detalhada), Reformas Religiosas,
  Renascimento Cultural, Revoluções do séc. XVIII, Século XIX

---

## Órion v5.0 — Antiguidade Completa

**Dados** — 5 datasets novos (11 → 16, 110 → 134 entidades)
- Egito Antigo, Grécia Antiga, Mesopotâmia, Pré-História, Roma Antiga

---

## Órion v4.7 — Ajuste Final de Forças

**Código** — `graph.js`: forças aumentadas (link 150/300, charge -200/-400, collision 20/70)

---

## Órion v4.6 — Remoção da Force Center

**Código** — `graph.js`: `forceCenter` removida; grafo ocupa espaço livremente

---

## Órion v4.5 — Parâmetros de Física Balanceados

**Código** — `graph.js`: rebalanceamento de forças com `center.strength(0.05)`

---

## Órion v4.4 — Meta-Relações entre Datasets

**Código** — `graph.js`: meta-relações com espessura 3× maior e renderização em duas passadas

---

## Órion v4.3 — Cores por ID e Zoom Ampliado

**Código** — `graph.js` + `utils.js`: `getCorPorId(id, tipo)` — identidade visual única por entidade;
zoom expandido para `scaleExtent([0.05, 20])`

---

## Órion v4.2 — Auto-carregamento

**Código** — `main.js`: carregamento automático ao iniciar se houver checkboxes marcados por padrão

---

## Órion v4.1 — Filtro Simplificado

**Código** — removida seção "Temas" redundante; interface unificada em "Períodos Históricos"
Corrigido: datasets marcados não apareciam quando o tema correspondente não estava selecionado

---

## Órion v4.0 — Expansão para 11 Datasets

**Dados** — 8 novos datasets (3 → 11, ~30 → 110 entidades):
Antiguidade Clássica, Idade Média, Renascimento, Grandes Navegações, Revolução Industrial,
1ª Guerra Mundial, 2ª Guerra Mundial, Guerra Fria

---

## Órion v3.0 — Curadoria Manual de Dados

- Geração automática de eventos removida; `context.js` desabilitado
- `dados.json` monolítico removido
- 3 datasets curados manualmente: Revolução Francesa, Napoleão, Iluminismo

---

## Órion v2.0 — Estabilização

- 10 bugs corrigidos | CSS do header refeito | Memory leaks eliminados no motor D3.js

---

## Órion v1.0 — Versão Inicial

- Grafo D3.js force-directed com dados históricos
- 2 datasets: Revolução Francesa + Era Napoleônica
- Interface trilíngue PT/EN/ES
