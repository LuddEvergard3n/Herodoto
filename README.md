# Heródoto
### Linha do Tempo Interativa e Grafo de Conhecimento Histórico

> *"Heródoto de Halicarnasso apresenta aqui os resultados de sua pesquisa, para que o tempo não apague os feitos dos homens."* — Heródoto, Histórias, c. 440 a.C.

---

## O que é

**Heródoto** é uma ferramenta pedagógica para professores de história que combina dois modos de visualização:

- **Grafo de conhecimento** — eventos e personalidades históricas como nós interconectados por relações causais, temáticas e cronológicas, renderizado com D3.js force-directed layout
- **Linha do tempo interativa** — eixo SVG com zoom/pan, filtragem por era e tipo, agrupamento visual de eventos próximos e navegação por região geográfica

O projeto cobre a história mundial desde os primeiros hominídeos (~3,3 milhões a.C.) até o presente, com ênfase especial no Brasil.

---

## Funcionalidades

### Linha do Tempo
- Eixo histórico com escala logarítmica para pré-história e linear para história
- Zoom (Ctrl+scroll), pan horizontal (scroll horizontal ou arrasto), navegação vertical entre regiões (scroll)
- Rows colapsíveis por região: Europa, Oriente Médio, Ásia Oriental, Américas, África, etc.
- Filtro por era (5 períodos) e tipo de evento (9 categorias)
- Busca em tempo real com contagem de resultados
- Painel lateral de detalhes ao clicar em um evento
- Botão ⊟/⊞ para colapsar/expandir todas as regiões de uma vez
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
- **Perguntas geradoras** — 20 questões históricas curadas que selecionam e renderizam datasets automaticamente

### Interface
- Trilíngue: Português / English / Español (troca instantânea)
- PWA: instalável em Android e iOS, funciona offline
- Responsivo: desktop, tablet e mobile landscape
- Paleta de pigmentos históricos: lápis-lazúli, cinábrio, ocre, malaquita, púrpura imperial

---

## Conteúdo

**Total atual:** ~225 datasets · ~1.450 entidades (v7.20)

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

**Temáticos transversais:** quilombos, povos indígenas, escravidão colonial, missões jesuíticas, guerra do Paraguai, inconfidência, independência, cultura-arte, economia-social

### Cobertura Mundial

| Região | Destaques |
|---|---|
| **Pré-história** | Paleolítico, Neolítico, pré-história europeia e americana |
| **Oriente Médio** | Suméria, Mesopotâmia, Babilônia, Pérsia/Aquemênidas, Fenícios, Cartago, Hitititas, Bronze Egeu |
| **Egito** | Antigo, Médio e Novo Reino, período Tardio |
| **Grécia** | Atenas, Esparta, guerras, filosofia, cultura, Alexandre, helenismo e ciência |
| **Roma** | República, Imperial, exército, sociedade, cultura, queda |
| **Islã** | Origens, expansão, fragmentação, Al-Andalus |
| **Idade Média** | Feudalismo, cruzadas, carolíngios, castelos, cidades e universidades |
| **Índia** | Védica/Maurya, medieval-moderna |
| **China** | Neolítico, Shang-Zhou, Song, Ming, Qing, revolução |
| **Japão** | Arcaico, antigo, Sengoku, Meiji, moderno |
| **Coreia** | Antiga, Joseon, moderna |
| **Sudeste Asiático** | Continental e marítimo |
| **África** | Norte, oriental, ocidental, centro-sul, reinos africanos, descolonização |
| **Mesoamérica** | Olmecas, Teotihuacan, Maias, Astecas, Zapotecas, Toltecas |
| **Andes** | Caral, Wari, Chimu, culturas andinas |
| **Américas Sul** | Mapuches, Tupis-Guaranis Amazônia |
| **EUA** | Colônias, fundação, expansão, guerra civil, sécs. XIX-XX, contemporâneo |
| **América Latina** | Séc. XX, independências |
| **Europa Moderna** | Renascimento (norte e sul), absolutismo, Reforma, Revoluções liberais, Iluminismo |
| **Filosofia** | Antiga, medieval, racionalismo, moderna |
| **Igreja** | Fundação, concílios, inquisição, Reforma, Igreja e ciência, Igreja e escravidão |
| **Antártida** | Descoberta e exploração moderna |
| **Personalidades** | ~194 figuras históricas por região/período, incluindo 13 bíblicas com rigor historiográfico |

---

## Estrutura de Arquivos

```
herodoto/
├── index.html              # Entrada principal
├── manifest.json           # PWA manifest
├── css/
│   ├── base.css            # Layout, variáveis de cor, tipografia
│   └── components.css      # Componentes: toolbar, painéis, timeline
├── js/
│   ├── main.js             # Inicialização e orquestração
│   ├── graph.js            # Motor D3.js force-directed
│   ├── timeline.js         # Linha do tempo SVG interativa
│   ├── data.js             # Carregamento e normalização de dados
│   ├── filtros.js          # Lógica de filtros e paleta de cores
│   ├── search.js           # Busca textual global
│   ├── compare.js          # Modo comparação de eventos
│   ├── questions.js        # 20 perguntas geradoras
│   ├── causal-chain.js     # Cadeia de causas
│   ├── consequence-chain.js# Cadeia de consequências
│   ├── context-panel.js    # Painel lateral de contexto
│   ├── legend-filter.js    # Legenda interativa de tipos
│   ├── guided-mode.js      # Modo guiado com narrativas
│   ├── dataset-labels.js   # Rótulos trilingues dos datasets
│   ├── i18n.js             # Internacionalização PT/EN/ES
│   └── utils.js            # Utilitários
└── data/
    ├── dados-brasil-01-povos-originarios.json
    ├── dados-brasil-02-pre-colonial.json
    ├── ... (225+ arquivos JSON)
    └── dados-personagens-*.json
```

---

## Estrutura de Entidade (JSON)

```json
{
  "id": "br15-001",
  "nome": "O Golpe de 1964",
  "nome_en": "The 1964 Coup",
  "nome_es": "El Golpe de 1964",
  "inicio": 1964,
  "fim": 1964,
  "tipo": "evento",
  "region": "Americas",
  "period": "20th Century",
  "type": "political",
  "tags": ["golpe", "militares", "Goulart", "1964", "debate-histórico"],
  "descricao": "...",
  "descricao_en": "...",
  "descricao_es": "...",
  "importancia": "...",
  "importancia_en": "...",
  "importancia_es": "...",
  "century_start": 19,
  "century_end": 20
}
```

---

## Princípios Editoriais

- **Equilíbrio**: eventos controversos apresentam múltiplas perspectivas historiográficas sem tomar partido
- **Rigor**: distinção explícita entre evidência histórica, debate acadêmico e consenso corrente
- **Acessibilidade pedagógica**: cada entidade tem descrição factual e análise de importância histórica
- **Trilingismo**: todo conteúdo disponível em PT, EN e ES

---

## Uso em Sala de Aula

1. Abrir `index.html` em qualquer navegador moderno (sem servidor necessário)
2. Selecionar datasets pelo painel lateral ou usar as **Perguntas Geradoras**
3. Alternar entre **Grafo** e **Linha do Tempo** conforme o objetivo da aula
4. Clicar em qualquer evento para ver descrição completa e importância historiográfica
5. Usar **Comparação** para contrastar dois eventos ou períodos
6. Usar **Cadeia Causal** para explorar causas e consequências de um evento

---

## Tecnologias

- **D3.js** v7 — grafo e simulação de força
- **SVG nativo** — linha do tempo
- JavaScript ES6+ puro, sem frameworks
- CSS custom properties para tema consistente
- Service Worker para funcionamento offline (PWA)
