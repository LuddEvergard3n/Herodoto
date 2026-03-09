# Plano de Aula — Documentação

**Arquivo:** `plano-aula.html`  
**Versão introduzida:** v7.43  
**Tipo:** Ferramenta auxiliar para professores — gerador de plano de aula estruturado em conformidade com a BNCC

---

## Visão Geral

O **Gerador de Plano de Aula** é uma página standalone do ecossistema Heródoto que permite ao professor preencher um formulário interativo e gerar um documento imprimível de plano de aula para a disciplina de **História**, com habilidades e objetos de conhecimento filtrados por ano/série conforme a Base Nacional Comum Curricular (BNCC 2018).

A página não depende de backend, servidor ou banco de dados. Toda a lógica é executada no navegador via **JavaScript vanilla puro**.

---

## Tecnologias

| Recurso | Detalhe |
|---|---|
| HTML5 | Estrutura semântica; `<select>`, `<input type="date">`, `<textarea>` nativos |
| CSS3 | Grid layout, variáveis CSS (`--var`), `@media print` para saída em PDF |
| JavaScript Vanilla | Sem dependências externas; sem frameworks |
| Tipografia | `IM Fell English` (títulos) + `Crimson Text` (corpo) via Google Fonts |
| Impressão / PDF | `window.print()` com folha de estilos `@media print` que oculta toda a UI e formata o documento em A4 |

Não há chamadas a APIs externas, cookies, localStorage ou qualquer forma de persistência. O estado do formulário existe apenas na sessão ativa.

---

## Estrutura do Arquivo

```
plano-aula.html
├── <head>          — meta, Google Fonts, variáveis CSS, estilos inline
├── <header>        — barra de navegação partilhada do Heródoto
├── .pw (page wrapper)
│   ├── .fp (form panel)   — formulário completo, lado esquerdo (470px)
│   └── .pp (preview panel) — pré-visualização do documento, lado direito
└── <script>        — dados BNCC, lógica de render e geração do documento
```

O layout usa `display: grid` com duas colunas (`470px 1fr`) que colapsam para coluna única em viewports abaixo de 960px.

---

## Dados BNCC Embutidos

Todos os dados são declarados diretamente no `<script>` como objetos JavaScript literais. Nenhuma requisição de rede é feita.

### Estrutura de dados

```js
const BNCC = {
  1: [ { id: 'EF01HI01', t: 'Texto da habilidade...' }, ... ],
  2: [ ... ],
  // ...
  9: [ ... ],
  EM1: [ { id: 'EM13CHS101', t: '...' }, ... ],
  EM2: /* alias de EM1 */,
  EM3: /* alias de EM1 */,
};

const OBJ = {
  1: [ 'Objeto de conhecimento A', 'Objeto B', ... ],
  // por ano, até EM1/EM2/EM3
};
```

### Cobertura

| Etapa | Habilidades BNCC |
|---|---|
| EF 1º ano | EF01HI01 – EF01HI08 (8 habilidades) |
| EF 2º ano | EF02HI01 – EF02HI11 (11 habilidades) |
| EF 3º ano | EF03HI01 – EF03HI12 (12 habilidades) |
| EF 4º ano | EF04HI01 – EF04HI11 (11 habilidades) |
| EF 5º ano | EF05HI01 – EF05HI10 (10 habilidades) |
| EF 6º ano | EF06HI01 – EF06HI19 (19 habilidades) |
| EF 7º ano | EF07HI01 – EF07HI17 (17 habilidades) |
| EF 8º ano | EF08HI01 – EF08HI27 (27 habilidades) |
| EF 9º ano | EF09HI01 – EF09HI36 (36 habilidades) |
| EM (1ª–3ª série) | EM13CHS101 – EM13CHS606 (32 habilidades, área CHS) |
| **Total** | **183 habilidades únicas** |

> **Nota sobre o Ensino Médio:** Na BNCC, a História integra a área de *Ciências Humanas e Sociais Aplicadas* (CHS). Os códigos `EM13CHS___` são transversais às três séries do EM e compartilham o mesmo conjunto (o objeto `EM2` e `EM3` são aliases de `EM1`).

### Presets fixos (independentes de ano)

Cada uma das seções abaixo tem **15 opções pré-selecionáveis** que aparecem para qualquer ano:

- **Objetivos de Aprendizagem** — competências historiográficas gerais (análise de fontes, empatia histórica, pensamento temporal etc.)
- **Metodologia / Estratégias Didáticas** — júri simulado, sala invertida, role-playing, History Oral, gamificação etc.
- **Recursos Didáticos** — inclui referência ao próprio Heródoto como recurso
- **Avaliação** — prova dissertativa, portfólio, autoavaliação, podcasts, análise de imagem etc.

---

## Lógica de Lock por Ano (Filtragem)

Quando o professor seleciona o **Ano / Série**, a função `onAno()` é disparada:

```js
function onAno() {
  const a = document.getElementById('f-ano').value;
  const k = isNaN(parseInt(a)) ? a : parseInt(a); // '6' → 6, 'EM1' → 'EM1'
  rc('box-obj',  OBJ[k]  || null, 'obj');          // renderiza Objetos de Conhecimento
  rc('box-bncc', BNCC[k] || null, 'bncc', true);  // renderiza Habilidades BNCC
}
```

Os painéis de **Objetos de Conhecimento** e **Habilidades BNCC** são completamente substituídos pelos dados do ano selecionado. Se nenhum ano for selecionado, exibem a mensagem de placeholder.

Os painéis de Objetivos, Metodologia, Recursos e Avaliação **não são afetados** pelo lock — são universais e ficam sempre visíveis.

---

## Carga Horária Calculada

O campo **Carga Horária Total** é somente-leitura e atualizado automaticamente:

```js
function calcCarga() {
  const n   = parseInt(document.getElementById('f-naulas').value) || 0;
  const dur = document.getElementById('f-dur').value;
  const m   = dur === '1h30' ? 90 : parseInt(dur); // minutos
  const tot = n * m;
  // formata: 100 min → '1h40min', 120 min → '2h'
  document.getElementById('f-carga').value = /* ... */;
}
```

Dispara nos eventos `onchange` de `f-naulas` e `f-dur`, e também na inicialização da página.

---

## Geração do Documento

A função `gerar()` constrói o HTML do documento de forma procedural, sem templates externos:

1. Coleta todos os campos do formulário (`v(id)`)
2. Coleta os checkboxes marcados de cada seção (`gc(prefix, extraId)`)
3. Monta o HTML do documento concatenando seções condicionalmente (seções vazias são omitidas)
4. Injeta o HTML no `<div id="doc">` do painel de pré-visualização

```js
function gerar() {
  // 1. lê valores
  // 2. constrói cabeçalho, grid de meta, seções
  // 3. injeta em #doc
  document.getElementById('doc').innerHTML = html;
}
```

Cada seção segue o padrão:
```js
function sec(titulo, corpo) {
  return `<div class="ds"><span class="dst">${titulo}</span>${corpo}</div>`;
}
```

---

## Impressão e Exportação PDF

O botão **"Baixar / Imprimir PDF"** chama `window.print()`. A folha de estilos `@media print` garante:

- Header de navegação, formulário e toolbar ficam **ocultos** (`display: none`)
- O `page-wrapper` passa para `display: block` (coluna única)
- O `<div id="doc">` recebe `padding: 1.5cm 2cm` e `font-size: 10pt`
- `print-color-adjust: exact` preserva os fundos coloridos (ex.: o fundo preto dos títulos de seção)

O workflow para gerar PDF:
1. Preencher o formulário
2. Clicar em **Gerar Plano**
3. Clicar em **Baixar / Imprimir PDF** → diálogo nativo do navegador → **Salvar como PDF**

---

## Campos do Formulário

### Identificação
| Campo | Tipo | Observações |
|---|---|---|
| Professor(a) | `text` | Aparece também na assinatura do documento |
| Data | `date` | Pré-preenchida com a data atual via `valueAsDate = new Date()` |
| Escola / Instituição | `text` | Aparece no cabeçalho do documento |
| Turma | `text` | Livre (ex.: `8ºA`) |
| Bimestre / Trimestre | `select` | 1º–4º Bimestre ou 1º–3º Trimestre |
| Nº de Aulas | `select` | 1–5 aulas; dispara cálculo de carga horária |
| Duração de cada aula | `select` | 45 min / 50 min / 60 min / 1h30; dispara cálculo |
| Ano / Série | `select` | Lock dos dados BNCC; disparador principal |
| Carga Horária Total | `text` (readonly) | Calculado automaticamente |

### Seções com Presets + Campo Livre
Cada uma das seções abaixo tem dois modos de entrada combinados:
- **Checkboxes** — seleção múltipla dos presets BNCC/pedagógicos
- **Textarea livre** — adição de conteúdo não listado

| Seção | Fonte dos presets |
|---|---|
| Objetos de Conhecimento | BNCC, filtrado por ano |
| Habilidades BNCC | BNCC, filtrado por ano, com código alfanumérico |
| Objetivos de Aprendizagem | Lista pedagógica fixa (15 itens) |
| Metodologia / Estratégias Didáticas | Lista pedagógica fixa (15 itens) |
| Recursos Didáticos | Lista pedagógica fixa (15 itens) |
| Avaliação | Lista pedagógica fixa (15 itens) |

### Campos Livres
- **Referências Bibliográficas** — textarea sem presets
- **Observações** — textarea sem presets

---

## Integração com o Ecossistema Heródoto

- A barra de navegação (`<header>`) é partilhada com todas as páginas do projeto, com o link "Plano de Aula" marcado como `.on` (active).
- O arquivo `manifest.json` e os ícones PWA são referenciados, permitindo que a página seja acessível como parte do app instalado.
- O Heródoto aparece como recurso didático nos presets da seção "Recursos Didáticos".

---

## Manutenção e Extensão

### Adicionar novas habilidades BNCC
Editar diretamente o objeto `BNCC` no `<script>`:
```js
BNCC[6].push({ id: 'EF06HI20', t: 'Nova habilidade...' });
```

### Adicionar novos presets pedagógicos
Adicionar strings aos arrays `POBJ`, `PMET`, `PREC` ou `PAVA`:
```js
PMET.push('Nova estratégia didática.');
```

### Suporte a outras disciplinas
Os objetos `BNCC` e `OBJ` são indexados por chave de ano. Para suportar Geografia, Filosofia etc., basta:
1. Criar objetos `BNCC_GEO`, `OBJ_GEO` com a mesma estrutura
2. Adicionar um campo "Componente Curricular" ao formulário
3. Despachar o objeto correto na função `onAno()` conforme o componente selecionado

---

## Limitações Conhecidas

- **Sem persistência:** fechar a aba apaga o formulário. Não há rascunho automático.
- **Verificação BNCC:** os textos das habilidades e objetos de conhecimento foram inseridos manualmente a partir da BNCC 2018. Recomenda-se confrontar com o [documento oficial do MEC](http://basenacionalcomum.mec.gov.br/) antes de uso institucional.
- **EM multi-série:** as habilidades CHS do EM são as mesmas para as 3 séries. A BNCC não segmenta por série no EM — a distribuição por série é de responsabilidade do currículo estadual e do projeto pedagógico da escola.
