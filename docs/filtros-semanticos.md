# Filtros Semânticos — Documentação

**Ficheiro principal:** `js/filtros.js`  
**Página auxiliar:** `filtros-semanticos.html`  
**Versão:** Heródoto v7.43

---

## Visão Geral

O sistema de **Filtros Semânticos** permite ao utilizador restringir as entidades visíveis no grafo por quatro dimensões independentes e combináveis:

1. **Século** — filtro cronológico por século (ex.: séc. V a.C., séc. XIX)
2. **Continente / Região** — filtro geográfico
3. **Tipo de entidade** — war, political, economic, cultural, religious, technological, social, intellectual, person
4. **Período histórico** — agrupamentos pré-definidos (ex.: Antiguidade Clássica, Idade Média, Era Moderna)

O módulo é um **context selector** (não um filtro de timeline linear) — o objetivo é responder à pergunta *"O que estava a acontecer no mundo quando X ocorreu?"*, revelando simultaneidades históricas.

---

## Tecnologias

| Recurso | Detalhe |
|---|---|
| JavaScript ES Modules | `export/import`; sem dependências externas |
| DOM API | `querySelectorAll()` para ler checkboxes ativos |
| D3.js (via `graph.js`) | A visibilidade dos nós é atualizada diretamente nos dados do grafo após filtragem |

---

## API Pública

```js
import { aplicarFiltrosSemanticos, resetarFiltros, getNodeColor, TYPE_COLORS } from './filtros.js';
```

| Função / Export | Tipo | Descrição |
|---|---|---|
| `aplicarFiltrosSemanticos()` | `function` | Lê os filtros ativos do DOM e atualiza a visibilidade dos nós no grafo |
| `resetarFiltros()` | `function` | Desmarca todos os filtros e restaura todos os nós como visíveis |
| `getNodeColor(tipo)` | `function` | Retorna a cor hex para um dado tipo de entidade |
| `TYPE_COLORS` | `object` | Mapa `tipo → cor hex` para todos os 9 tipos de entidade |

---

## Estrutura de Dados dos Filtros

Os filtros são lidos do DOM a cada chamada de `aplicarFiltrosSemanticos()`:

```js
function coletarFiltros() {
  const periodos = Array.from(document.querySelectorAll('.filtro-periodo:checked')).map(cb => cb.value);
  const seculos  = Array.from(document.querySelectorAll('.filtro-seculo:checked')).map(cb => parseInt(cb.value));
  const regioes  = Array.from(document.querySelectorAll('.filtro-regiao:checked')).map(cb => cb.value);
  const tipos    = Array.from(document.querySelectorAll('.filtro-tipo:checked')).map(cb => cb.value);
  return { periodos, seculos, regioes, tipos };
}
```

Quando todos os arrays estão vazios, nenhum filtro está ativo e todas as entidades são visíveis.

---

## Lógica de Filtragem

A visibilidade de uma entidade é determinada por uma conjunção (AND) entre as dimensões ativas, mas disjunção (OR) dentro de cada dimensão:

```
visível = (nenhum_filtro_ativo)
       OU (século_ok E continente_ok E tipo_ok E período_ok)
```

Exemplo: se o utilizador seleciona `séc. XIX` + `Europa` + `political`, apenas entidades do século XIX, localizadas na Europa e do tipo político são mostradas.

### Correspondência de século
```js
function centuryInRange(century, centuryStart, centuryEnd) {
  const start = centuryStart || -100;
  const end   = centuryEnd   || 100;
  return century >= start && century <= end;
}
```

O campo `seculo` nas entidades JSON pode ser negativo (a.C.) ou positivo (d.C.).

---

## Paleta de Cores (`TYPE_COLORS`)

```js
export const TYPE_COLORS = {
  war:           '#8b2e1a',  // Vermelho cinábrio
  political:     '#2b4b7e',  // Azul lápis-lazúli
  economic:      '#a0622a',  // Ocre queimado
  cultural:      '#5c2d6e',  // Púrpura imperial
  religious:     '#2e6b4f',  // Verde malaquita
  technological: '#3d3d3d',  // Ferro escurecido
  social:        '#b07a28',  // Âmbar natural
  intellectual:  '#4a2060',  // Violeta escuro
  person:        '#8a6a20',  // Ouro velho
};
```

Esta paleta é usada tanto nos nós do grafo como na legenda visual e nos filtros por tipo.

---

## Página `filtros-semanticos.html`

Página auxiliar que apresenta o painel de filtros em modo standalone (fora do grafo principal), útil para exploração pedagógica ou demonstração dos filtros disponíveis.

Utiliza os mesmos seletores CSS (`.filtro-periodo`, `.filtro-seculo`, etc.) e chama `aplicarFiltrosSemanticos()` da mesma forma que o grafo principal.

---

## Integração com o Grafo

Após a filtragem, a função atualiza a propriedade `visible` de cada nó D3 e chama `updateLabels()` e `updateInfoPanel()` em `graph.js` para re-renderizar o estado visual sem recriar a simulação de força.

---

## Extensão

Para adicionar um novo tipo de entidade:
1. Adicionar a chave e cor a `TYPE_COLORS` em `filtros.js`
2. Adicionar o checkbox correspondente no HTML com a classe `filtro-tipo`
3. Garantir que o campo `tipo` nos datasets JSON usa a nova chave
4. Adicionar a tradução da nova chave em `TRANSLATIONS` em `i18n.js`

Para adicionar um novo continente/região:
1. Adicionar o checkbox com classe `filtro-regiao` e o valor correspondente ao campo `continente` nos JSONs
2. Garantir consistência de nomenclatura entre o checkbox e os dados
