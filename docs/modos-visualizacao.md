# Modos de Visualização — Documentação

**Módulos:** `js/guided-mode.js`, `js/timeline.js`, `js/personagens.js`, `js/compare.js`, `js/questions.js`  
**Versão:** Heródoto v7.43

---

## Visão Geral

O Heródoto oferece 5 modos de visualização acessíveis pela barra de ferramentas. O modo padrão é o **Grafo Livre**. Os outros modos são camadas sobrepostas ao grafo ou painéis alternativos que podem ser ativados e desativados independentemente.

---

## Modo Guiado (`guided-mode.js`)

### Descrição
Sequência narrativa automatizada que percorre as entidades do grafo uma a uma. A cada passo, o grafo anima com pan + zoom suave para o nó atual, destaca-o com um anel pulsante, e exibe o painel de contexto lateral.

### Ativação
Botão `#btn-guided-mode` na toolbar: **"Modo Exploração Guiada"**

### Comportamento
- Constrói uma sequência (`sequence[]`) ordenada por `importancia` e `ano_inicio`
- Avança/recua com botões ou teclas ←/→
- Nó atual: anel pulsante animado via CSS `@keyframes`
- Nós conectados ao atual: opacidade aumentada; restantes diminuída
- Pan + zoom via `focusNode()` em `graph.js` — animação D3 com `duration: 600ms`

### API
```js
import { initGuidedMode, updateGuidedLang } from './guided-mode.js';

initGuidedMode();        // inicializa o painel e eventos de teclado
updateGuidedLang();      // atualiza strings após mudança de idioma
```

### Integração i18n
O Modo Guiado usa `TRANSLATIONS` de `i18n.js` para os botões de navegação e títulos do painel. Registra `window.updateGuidedLang` para ser chamado pelo seletor de idioma.

---

## Linha do Tempo (`timeline.js`)

### Descrição
Visualização cronológica de todas as entidades dos datasets selecionados, ordenadas por `ano_inicio`. Apresenta uma linha do tempo scrollável com marcadores por século e agrupamento por tipo.

### Ativação
Botão `#btn-timeline` na toolbar: **"Linha do Tempo"**

### Comportamento
- Renderiza via SVG escalável com `d3.scaleLinear()` mapeando `ano_inicio`/`ano_fim` para posição X
- Suporta scroll horizontal para períodos muito longos
- Cada entidade é um marcador clicável que abre o painel de informação
- Agrupa visualmente por continente ou tipo (configurável)

### Integração i18n
Registra `window.refreshTimelineLang` — chamado pelo seletor de idioma para atualizar labels.

### API
```js
import { initTimeline } from './timeline.js';
initTimeline(); // inicializa; chamado uma vez em main.js
```

---

## Personalidades (`personagens.js`)

### Descrição
Filtra e destaca no grafo apenas as entidades do tipo `person`, com um painel lateral listando as personalidades presentes nos datasets selecionados.

### Ativação
Botão `#btn-personagens` na toolbar: **"Personalidades"**

### Comportamento
- Filtra `entidades` por `tipo === 'person'`
- Lista as personalidades ordenadas por `importancia` (desc) e `ano_inicio`
- Clicar numa personalidade centraliza o grafo nesse nó
- Nós não-`person` ficam com opacidade reduzida

### API
```js
import { initPersonagens } from './personagens.js';
initPersonagens();
```

---

## Comparar (`compare.js`)

### Descrição
Permite comparar duas épocas, regiões ou períodos lado a lado, visualizando entidades de ambos os contextos em painéis paralelos.

### Ativação
Botão de comparação na toolbar.

### Comportamento
- Divide o viewport em dois painéis
- Cada painel tem o seu próprio conjunto de filtros (época A vs época B)
- Entidades exclusivas de cada lado são destacadas com cores distintas
- Entidades partilhadas (mesma `id` ou tipo+século sobrepostos) são realçadas no centro

### API
```js
import { initCompare } from './compare.js';
initCompare();
```

---

## Perguntas (`questions.js`)

### Descrição
Modo pedagógico com perguntas contextuais sobre as entidades e relações dos datasets atualmente selecionados. Gera questões dinamicamente com base nos dados carregados.

### Ativação
Botão de perguntas na toolbar.

### Comportamento
- Gera até N perguntas por sessão (configurável internamente)
- Perguntas de múltipla escolha sobre: datas, tipos, relações causais, personagens
- Feedback imediato após cada resposta
- Pontuação acumulada por sessão

### Estrutura das perguntas
As perguntas são organizadas em **grupos temáticos** (58 grupos, 248 questões na versão atual). Cada grupo é associado a um conjunto de datasets.

### API
```js
import { initQuestions } from './questions.js';
initQuestions();
```

---

## Cadeia Causal (`causal-chain.js` + `consequence-chain.js`)

### Descrição
Painel que traça a cadeia causal de um evento selecionado: antecedentes (causas) e consequências encadeadas, visualizadas como árvore ou lista hierárquica.

### Ativação
Botão de cadeia causal no painel de informação de uma entidade.

### Comportamento
- Percorre as `relacoes` do tipo `causal` em ambas as direções
- `causal-chain.js`: lógica do painel e renderização
- `consequence-chain.js`: algoritmo de travessia do grafo de relações

### API
```js
import { initChainPanel, showChainPanel } from './causal-chain.js';

initChainPanel();           // inicializa uma vez
showChainPanel(entityId);   // abre o painel para uma entidade específica
```

---

## Painel de Contexto (`context-panel.js` + `context.js`)

### Descrição
Painel lateral deslizante que apresenta o contexto histórico detalhado de uma entidade selecionada no grafo. Inclui: nome, tipo, período, descrição, contexto expandido, importância e entidades relacionadas.

### Ativação
Clique num nó do grafo.

### `context.js`
Gera o HTML do conteúdo do painel a partir dos dados da entidade e do idioma ativo:
```js
import { generateContextForEntities } from './context.js';
```

### `context-panel.js`
Controla a visibilidade, animação de entrada/saída e eventos do painel:
```js
import { initContextPanel, showContextPanel } from './context-panel.js';
```

---

## Pesquisa (`search.js`)

### Descrição
Campo de pesquisa de texto livre que filtra entidades no grafo ativo por nome (PT/EN/ES).

### Comportamento
- Pesquisa em tempo real ao digitar (`input` event)
- Destaca os nós correspondentes; oculta os restantes
- Suporta pesquisa nos três idiomas simultaneamente

### API
```js
import { initSearch } from './search.js';
initSearch();
```

---

## Camada Geográfica (`geo-layer.js`)

### Descrição
Camada opcional que sobrepõe um mapa geográfico simplificado ao grafo, posicionando os nós aproximadamente nas suas regiões de origem com base no campo `continente`.

### API
```js
import { initGeoLayer } from './geo-layer.js';
initGeoLayer();
```
