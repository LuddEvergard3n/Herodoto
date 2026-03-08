# Heródoto
### Linha do Tempo Interativa e Grafo de Conhecimento Histórico

> *«Heródoto de Halicarnasso apresenta aqui os resultados de sua pesquisa, para que o tempo não apague os feitos dos homens.»* — Heródoto, Histórias, c. 440 a.C.

---

## O que é

**Heródoto** é uma ferramenta pedagógica para professores e estudantes de história que combina dois modos principais de visualização:

- **Grafo de conhecimento** — eventos e personalidades históricas como nós interconectados por relações causais, temáticas e cronológicas, renderizado com D3.js force-directed layout
- **Linha do tempo interativa** — eixo SVG com zoom/pan, filtragem multidimensional, agrupamento visual e navegação por região geográfica

O projeto cobre a história mundial desde os primeiros hominídeos (~3,3 milhões a.C.) até o presente, com ênfase especial no Brasil e na Europa.

---

## Estado Atual (v7.39)

| Métrica | Valor |
|---|---|
| Datasets (arquivos JSON) | **303** |
| Entidades históricas | **2.611** |
| Perguntas Geradoras | **248** em **58 grupos** |
| Idiomas | PT / EN / ES |
| Arquivos de fontes | **38 temas** |
| Fontes bibliográficas | **≈ 500** (primárias, secundárias, terciárias) |
| Testes automatizados | **112 / 112 ✓** |

---

## Funcionalidades

### Linha do Tempo
- Eixo histórico com escala ajustada para pré-história e história
- Zoom (`Ctrl+scroll`), pan horizontal (scroll horizontal ou arrasto), navegação vertical entre regiões (scroll)
- Rows colapsíveis por região: Europa, Oriente Médio, Ásia Oriental, Américas, África, etc.
- Filtro semântico por era (5 períodos), tipo de evento (11 categorias) e região
- Busca em tempo real com contagem de resultados
- Painel lateral de detalhes ao clicar num evento
- Botão ⊟/⊞ para colapsar/expandir todas as regiões
- Botão `✕ limpar` para resetar todos os filtros

### Grafo de Conhecimento
- Motor de física com clustering inteligente por dataset
- Forças de coesão intra-dataset e repulsão inter-dataset
- Opacidade das arestas variável por intensidade histórica da relação
- Legenda interativa de tipos (clique para filtrar por categoria)
- Painel de contexto com descrição, importância historiográfica e tags

### Módulos Analíticos
- **Busca global** — pesquisa em nome, descrição, importância e tags de todas as entidades carregadas
- **Comparação** — modo lado-a-lado de dois eventos históricos
- **Cadeia causal** — percorre relações de causalidade/evolução em 2 níveis a partir de qualquer nó
- **Cadeia de consequências** — encadeamento prospectivo a partir de um evento
- **Perguntas Geradoras** — 248 questões históricas em 58 grupos que selecionam e renderizam datasets automaticamente
- **Modo Guiado** — narrativa estruturada com foco num nó, altura dinâmica e abertura automática de painéis

### Personalidades
- 236 figuras históricas em 18 coleções temáticas/regionais
- Painel dedicado com nascimento, morte, área, cargo e ligações a eventos
- Filtro por época, região e área de atuação

### Interface
- Trilíngue: Português / English / Español (troca instantânea)
- **Página de Fontes** — bibliografia por tema (38 temas, ≈500 obras) com filtro por tipo e busca por autor/obra
- **Guia do Professor** — filosofia pedagógica, 6 atividades prontas organizadas por nível de ensino, critérios de classificação histórica e limitações da ferramenta
- **Sobre** — apresentação do projeto, métricas e filosofia
- **Ajuda** — guia de navegação, atalhos, FAQ e instruções de uso offline
- Acesso pelas páginas: `fontes.html`, `guia-professor.html`, `sobre.html`, `ajuda.html`
- PWA: instalável em Android e iOS, funciona offline
- Responsivo: desktop, tablet e mobile landscape
- Paleta de pigmentos históricos: lápis-lazúli, cinábrio, ocre, malaquita, púrpura imperial

---

## Conteúdo

### Brasil — 16 Períodos Cronológicos + Temáticos

| # | Período | Cobertura |
|---|---|---|
| 01 | Povos Originários (até 1500) | Paleoíndios, sambaquis, Marajoara, Tupi-Guarani |
| 02 | Pré-Colonial (1500–1530) | Cabral, pau-brasil, feitorias, ameaça francesa |
| 03 | Capitanias (1530–1549) | Martim Afonso, engenhos, escravidão indígena |
| 04 | Governo-Geral (1549–1580) | Nóbrega, Anchieta, Tamoios, fundação do Rio |
| 05 | União Ibérica e Invasões (1580–1640) | Brasil holandês, Nassau, WIC, tráfico negreiro |
| 06 | Expansão e Bandeirismo (1640–1700) | Palmares, bandeirantes, missões do Guairá |
| 07 | Ciclo do Ouro (1700–1808) | Vila Rica, barroco mineiro, Inconfidência, Pombal |
| 08 | Período Joanino (1808–1821) | Fuga da corte, abertura dos portos, Missão Francesa |
| 09 | Independência (1821–1831) | 7 de setembro, Constituição de 1824, Confederação do Equador |
| 10 | Regencial (1831–1840) | Cabanagem, Balaiada, Farroupilha, Revolta dos Malês |
| 11 | Segundo Reinado (1840–1889) | D. Pedro II, Guerra do Paraguai, abolição, imigração |
| 12 | República Velha (1889–1930) | Café-com-leite, Canudos, greve de 1917, tenentismo |
| 13 | Era Vargas (1930–1945) | Revolução de 1930, Estado Novo, CLT, industrialização |
| 14 | Populismo (1946–1964) | JK/Brasília, bossa nova, Goulart, reformas de base |
| 15 | Ditadura Militar (1964–1985) | AI-5, milagre econômico, Araguaia, abertura |
| 16 | Nova República (1985–presente) | Collor, Plano Real, Lula, Dilma, Bolsonaro |

**Temáticos transversais:** quilombos, povos indígenas, escravidão colonial, missões jesuíticas, guerra do Paraguai, inconfidência, independência, ciclos econômicos, cultura-arte, economia-social, redemocratização

### Europa — Cobertura Expandida (v7.30)

| Período | Datasets |
|---|---|
| **Grécia** | Helenismo, reinos sucessores, Alexandria, ciência, estoicismo/epicurismo |
| **Roma** | Imperadores (Augusto → Antoninos), Crise do III Século, Queda do Ocidente, Direito Romano |
| **Medieval** | Vikings, Carlomagno/Carolíngios, Peste Negra, Guerra dos Cem Anos, Humanismo |
| **Reforma** | Calvino/Zuínglio, Contrarreforma (Trento/Jesuítas), Guerras de Religião (1524–1648) |
| **Era Moderna** | Habsburgos, Luís XIV/Ancien Régime, Revolução Inglesa, Holanda Século de Ouro, Guerra dos 30 Anos/Vestfália, Rivalidade Áustria-Prússia |
| **Iluminismo** | Francês (Voltaire/Rousseau/Montesquieu), Britânico (Locke/Hume/Smith), Alemão (Kant/Goethe/Schiller) |
| **Século XIX** | Napoleão, Congresso de Viena, Revoluções de 1848, Unificações italiana e alemã, Belle Époque, Impérios britânico e francês, Industrialização |
| **Guerras Mundiais** | Frente Ocidental 1914–18, Versalhes, República de Weimar, Nazismo, Fascismo italiano, Guerra Civil Espanhola, Frente Oriental, Holocausto |
| **Pós-Guerra** | Plano Marshall, Wirtschaftswunder, Nuremberg, União Europeia (CECA → Next Gen), Guerra Fria na Europa, 1968 |
| **Contemporâneo** | Desintegração da URSS/1989, Guerras dos Bálcãs, Europa contemporânea (Brexit, populismo) |
| **Rússia** | Império Russo (Pedro I → Nicolau II) |

### Cobertura Mundial

| Região | Destaques |
|---|---|
| **Pré-história** | Evolução humana (~3,3Ma), Paleolítico, Neolítico, pré-história europeia e americana |
| **Oriente Médio** | Suméria, Mesopotâmia, Babilônia, Pérsia, Fenícios, Cartago, Hitititas, Bronze Egeu |
| **Egito** | Antigo, Médio e Novo Reino, período Tardio, Greco-Romano |
| **Grécia** | Arcaica, Atenas, Esparta, guerras, filosofia, cultura, Alexandre, Helenismo |
| **Roma** | República, Imperial, exército, sociedade, cultura, queda, Direito Romano |
| **Islã** | Fundação e Califas, expansão, fragmentação, Al-Andalus |
| **Idade Média** | Feudalismo, Cruzadas, Carolíngios, castelos, cidades e universidades |
| **Índia** | Védica/Maurya, Mogol, medieval-moderna, britânica |
| **China** | Neolítico, Shang-Zhou, Song, Ming, Qing, Revolução, Mao |
| **Japão** | Arcaico/Jomon, antigo, feudal/Sengoku, Meiji, moderno |
| **Coreia** | Antiga, Joseon, moderna |
| **Sudeste Asiático** | Continental e marítimo |
| **África** | Norte, oriental, ocidental, centro-sul, reinos africanos, descolonização |
| **Mesoamérica** | Olmecas, Teotihuacan, Maias, Astecas, Zapotecas, Toltecas |
| **Andes** | Caral, Wari, Chimú, culturas andinas, Incas |
| **EUA** | Colônias, fundação, expansão, guerra civil, sécs. XIX–XX, Guerra Fria |
| **América Latina** | Independências, séc. XX, descolonização |
| **Antártida** | Descoberta e exploração moderna |

---

## Estrutura de Arquivos

```
herodoto/
├── index.html                        # Entrada principal
├── fontes.html                       # Bibliografia histórica (38 temas, ≈500 obras)
├── guia-professor.html               # Guia pedagógico com 6 atividades
├── sobre.html                        # Apresentação do projeto
├── ajuda.html                        # Guia de navegação e FAQ
├── manifest.json                     # PWA manifest
├── sw.js                             # Service Worker (offline)
├── CHANGELOG.md                      # Histórico de versões
├── css/
│   ├── base.css                      # Layout, variáveis de cor, tipografia
│   └── components.css                # Componentes: toolbar, painéis, timeline
├── js/
│   ├── main.js                       # Inicialização e orquestração
│   ├── graph.js                      # Motor D3.js force-directed
│   ├── timeline.js                   # Linha do tempo SVG + ALL_DATASETS (303 entradas)
│   ├── data.js                       # Carregamento e normalização de dados
│   ├── filtros.js                    # Lógica de filtros semânticos
│   ├── search.js                     # Busca textual global
│   ├── compare.js                    # Modo comparação de eventos
│   ├── questions.js                  # 248 perguntas em 58 grupos
│   ├── causal-chain.js               # Cadeia de causas
│   ├── consequence-chain.js          # Cadeia de consequências
│   ├── context-panel.js              # Painel lateral de contexto
│   ├── context.js                    # Contexto global da aplicação
│   ├── legend-filter.js              # Legenda interativa de tipos
│   ├── guided-mode.js                # Modo guiado com narrativas
│   ├── personagens.js                # Módulo de personalidades
│   ├── geo-layer.js                  # Camada geográfica
│   ├── dataset-labels.js             # 306 rótulos trilingues
│   ├── i18n.js                       # Internacionalização PT/EN/ES
│   └── utils.js                      # Utilitários
├── data/
│   ├── dados-brasil-01-povos-originarios.json
│   ├── ...                           # 303 arquivos JSON no total (≥8 entidades cada)
│   └── dados-personagens-*.json      # 18 coleções de personalidades
├── fontes/
│   ├── fontes-pre-historia.json
│   ├── fontes-mesopotamia-oriente-antigo.json
│   ├── ...                           # 38 arquivos JSON de bibliografia
│   └── fontes-historiografia.json    # Teoria e metodologia histórica
└── tests/
    ├── runner.js                     # Runner CLI (node tests/runner.js)
    ├── assert.js                     # Biblioteca de asserções zero-dependência
    ├── test-data-integrity.js        # Valida todos os 303 JSONs
    ├── test-dataset-registry.js      # Verifica ALL_DATASETS e labels
    ├── test-historical-consistency.js # Datas, bias, cobertura regional
    ├── test-personagens.js           # Valida 18 coleções de personalidades
    └── test-questions.js             # Valida 248 perguntas geradoras
```

---

## Estrutura de Entidade (JSON)

### Entidade histórica
```json
{
  "id": "br15-001",
  "nome": "O Golpe de 1964",
  "nome_en": "The 1964 Coup",
  "nome_es": "El Golpe de 1964",
  "inicio": 1964,
  "fim": 1964,
  "type": "political",
  "region": "Americas",
  "tags": ["golpe", "militares", "Goulart", "1964"],
  "descricao": "...",
  "descricao_en": "...",
  "descricao_es": "...",
  "importancia": "...",
  "importancia_en": "...",
  "importancia_es": "..."
}
```

### Personalidade
```json
{
  "id": "pg-001",
  "nome": "Sócrates",
  "nascimento": -470,
  "morte": -399,
  "regiao": "Europe",
  "area": ["filosofia"],
  "cargo": "Filósofo",
  "descricao": "...",
  "importancia": "...",
  "eventos": ["grecia-012", "grecia-003"]
}
```

**Tipos válidos:** `political` · `war` · `economic` · `cultural` · `religious` · `social` · `technological` · `intellectual` · `prehistoric` · `natural` · `scientific`

**Regiões válidas:** `Europe` · `MiddleEast` · `Mediterranean` · `EastAsia` · `Asia` · `CentralAsia` · `SouthAsia` · `SoutheastAsia` · `Africa` · `Americas` · `NorthAmerica` · `SouthAmerica` · `Mesoamerica` · `Oceania` · `Antarctica` · `Global` · `Multiple` · `Other`

---

## Testes Automatizados

```bash
# Rodar tudo
node tests/runner.js

# Filtrar por arquivo
node tests/runner.js data         # test-data-integrity
node tests/runner.js personagens  # test-personagens
node tests/runner.js registry     # test-dataset-registry
node tests/runner.js questions    # test-questions
node tests/runner.js historical   # test-historical-consistency

# Listar arquivos disponíveis
node tests/runner.js --list
```

| Arquivo de teste | O que valida |
|---|---|
| `test-data-integrity.js` | JSON válido, campos obrigatórios, inicio ≤ fim, IDs únicos globais, tipos/regiões válidos |
| `test-dataset-registry.js` | ALL_DATASETS sem duplicados/órfãos, labels PT/EN/ES completos |
| `test-historical-consistency.js` | Série Brasil cronológica, âncoras de data, auditoria de bias, cobertura regional mínima |
| `test-personagens.js` | 18 coleções, campos obrigatórios, unicidade de ID e nome, nascimento < morte |
| `test-questions.js` | 248 questões, IDs únicos, todos datasets existem no disco, multilíngue |

---

## Princípios Editoriais

- **Equilíbrio** — eventos controversos apresentam múltiplas perspectivas sem tomar partido
- **Rigor** — distinção explícita entre evidência histórica, debate acadêmico e consenso corrente
- **Classificação historiográfica** — tipos de evento refletem a natureza histórica primária (ex: Nazismo → `social`; bomba atômica → `technological`)
- **Acessibilidade pedagógica** — cada entidade tem descrição factual e análise de importância histórica
- **Trilingismo** — todo conteúdo disponível em PT, EN e ES

---

## Uso em Sala de Aula

1. Abrir `index.html` em qualquer navegador moderno (sem servidor necessário)
2. Selecionar datasets pelo painel lateral ou usar as **Perguntas Geradoras**
3. Alternar entre **Grafo** e **Linha do Tempo** conforme o objetivo da aula
4. Clicar em qualquer evento para ver descrição completa e importância historiográfica
5. Usar **Comparação** para contrastar dois eventos ou períodos
6. Usar **Cadeia Causal** para explorar causas e consequências de um evento
7. Usar o **Modo Guiado** para percorrer uma narrativa estruturada

---

## Tecnologias

- **D3.js** v7 — grafo e simulação de força
- **SVG nativo** — linha do tempo
- JavaScript ES6+ puro, sem frameworks
- CSS custom properties para tema consistente
- Service Worker para funcionamento offline (PWA)
- Node.js (apenas para testes — sem dependências de produção)
