# Grafo Principal — Documentação

**Arquivo principal:** `index.html`  
**Módulo de entrada:** `js/main.js`  
**Versão:** Heródoto v7.43

---

## Visão Geral

O **Grafo Principal** é a interface central do Heródoto. Renderiza um grafo de força interativo (force-directed graph) que conecta entidades históricas (eventos, conceitos, períodos, personalidades) por relações causais, temáticas e cronológicas. O utilizador seleciona datasets, aplica filtros e explora o grafo de forma livre ou guiada.

---

## Tecnologias

| Recurso | Detalhe |
|---|---|
| D3.js (v7) | Force simulation, zoom/pan, SVG rendering |
| Canvas API | Fallback de renderização para grafos com +800 nós (limiar `CANVAS_THRESHOLD`) |
| ES Modules | Todos os ficheiros JS usam `import/export`; sem bundler |
| Fetch API | Carregamento assíncrono dos datasets JSON |
| Service Worker | Cache-first para assets, network-first para dados (ver `sw.js`) |

---

## Módulos JS

| Ficheiro | Responsabilidade |
|---|---|
| `main.js` | Ponto de entrada; inicialização, orquestração de eventos e layout |
| `graph.js` | Renderização SVG/Canvas, force simulation, zoom, pan, destaque de nós |
| `data.js` | Carregamento e normalização dos datasets JSON; suporte a múltiplos formatos |
| `filtros.js` | Filtragem semântica por século, continente, tipo e período |
| `i18n.js` | Internacionalização PT/EN/ES; `TRANSLATIONS` object; `applyTranslations()` |
| `timeline.js` | Modo Linha do Tempo |
| `personagens.js` | Modo Personalidades Históricas |
| `compare.js` | Modo Comparar Épocas |
| `questions.js` | Modo Perguntas Guiadas |
| `guided-mode.js` | Modo Exploração Guiada: sequência narrativa com pan/zoom suave |
| `context.js` | Geração de contexto histórico para painéis de informação |
| `context-panel.js` | Painel lateral de contexto; `initContextPanel()` |
| `causal-chain.js` | Painel de cadeia causal/consequencial |
| `consequence-chain.js` | Lógica de consequências encadeadas |
| `search.js` | Pesquisa/busca de entidades no grafo ativo |
| `legend-filter.js` | Filtro por cor/tipo via legenda visual |
| `geo-layer.js` | Camada geográfica opcional sobreposta ao grafo |
| `dataset-labels.js` | Labels de datasets agrupados |
| `utils.js` | Utilitários: paleta de cores (`CORES`), formatação, helpers |

---

## Modos de Visualização

O Heródoto oferece 5 modos acessíveis pela barra de ferramentas (`toolbar`):

| Modo | Botão | Módulo | Descrição |
|---|---|---|---|
| Grafo Livre | (padrão) | `graph.js` | Force-directed graph interativo; clique para informações |
| Linha do Tempo | `#btn-timeline` | `timeline.js` | Vista cronológica de todos os eventos selecionados |
| Personalidades | `#btn-personagens` | `personagens.js` | Filtro e destaque de figuras históricas (tipo `person`) |
| Comparar | (toolbar) | `compare.js` | Comparação lado a lado de duas épocas ou regiões |
| Perguntas | (toolbar) | `questions.js` | Questionário contextual sobre os dados carregados |
| Modo Guiado | `#btn-guided-mode` | `guided-mode.js` | Sequência narrativa automática com pan/zoom suave por nó |

---

## Datasets

### Seleção
O painel lateral esquerdo lista os 306 datasets JSON organizados por continente e subgrupo. Cada dataset é um `<input type="checkbox" class="dataset">`. Ao alterar a seleção, `carregarDadosSelecionados()` em `data.js` é chamado.

### Formato JSON
```json
{
  "periodo": "Nome do Período",
  "entidades": [
    {
      "id": "id_unico",
      "nome": "Nome em PT",
      "nome_en": "Name in EN",
      "nome_es": "Nombre en ES",
      "tipo": "war|political|economic|cultural|religious|technological|social|intellectual|person",
      "ano_inicio": -500,
      "ano_fim": -323,
      "descricao": "...",
      "descricao_en": "...",
      "descricao_es": "...",
      "seculo": -5,
      "continente": "europa",
      "importancia": 3
    }
  ],
  "relacoes": [
    { "origem": "id_a", "destino": "id_b", "tipo": "causal|sequencial|tematica" }
  ]
}
```

### Tipos de entidade e cores

| Tipo | Cor | Significado historiográfico |
|---|---|---|
| `war` | `#8b2e1a` Vermelho cinábrio | Conflitos armados |
| `political` | `#2b4b7e` Azul lápis-lazúli | Sistemas e eventos políticos |
| `economic` | `#a0622a` Ocre queimado | Processos económicos |
| `cultural` | `#5c2d6e` Púrpura imperial | Produção cultural e artística |
| `religious` | `#2e6b4f` Verde malaquita | Fenómenos religiosos |
| `technological` | `#3d3d3d` Ferro escurecido | Inovações técnicas |
| `social` | `#b07a28` Âmbar natural | Movimentos e estruturas sociais |
| `intellectual` | `#4a2060` Violeta escuro | Pensamento e filosofia |
| `person` | `#8a6a20` Ouro velho | Personalidades históricas |

> **Princípio de classificação:** as classificações de tipo são historiograficamente intencionais e não podem ser automatizadas por palavras-chave. Ex.: Nazismo → `social`; bombas atómicas → `technological`.

---

## Renderização: SVG vs Canvas

```js
const CANVAS_THRESHOLD = 800; // em graph.js
```

Abaixo de 800 nós → renderização SVG (interatividade total, hover, click).  
Acima de 800 nós → renderização Canvas (desempenho preservado, interatividade simplificada).

---

## Sistema de Zoom e Pan

Implementado com `d3.zoom()`. O grafo suporta:
- **Roda do rato** → zoom (Ctrl + scroll no modo PWA para não conflitar com scroll da página)
- **Arrastar** → pan
- **Scroll vertical** → scroll da página (interceptado e redirecionado)
- **Scroll horizontal (trackpad)** → pan horizontal do grafo

---

## Internacionalização (i18n)

Suporte completo a PT / EN / ES via `js/i18n.js`.

```js
import { applyTranslations, setCurrentLang, getCurrentLang } from './i18n.js';
```

- Textos da UI via atributos `data-i18n="chave"` no HTML
- Campos de entidades: `nome` / `nome_en` / `nome_es`; `descricao` / `descricao_en` / `descricao_es`
- O módulo `i18n.js` exporta `TRANSLATIONS` com todas as strings dos 3 idiomas

---

## PWA (Progressive Web App)

Configurado via `manifest.json` + `sw.js`.

- **Estratégia de cache:** Cache-First para assets estáticos; Network-First para ficheiros `data/*.json`
- **Versão de cache:** `herodoto-v7-40` (atualizar `CACHE_VERSION` em `sw.js` a cada release que modifique assets)
- Permite uso **offline completo** após a primeira visita

---

## Fluxo de Inicialização

```
DOMContentLoaded
  └── main.js: inicializar i18n
  └── main.js: registar service worker
  └── main.js: initContextPanel()
  └── main.js: initGuidedMode()
  └── main.js: initGeoLayer()
  └── main.js: initLegendFilter()
  └── main.js: initSearch()
  └── main.js: initChainPanel()
  └── main.js: initQuestions()
  └── main.js: initTimeline()
  └── main.js: initPersonagens()
  └── main.js: initCompare()
  └── main.js: carregar datasets selecionados → renderizarGrafo()
```
