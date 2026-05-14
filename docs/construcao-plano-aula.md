# Como foi construído o Gerador de Plano de Aula
### Decisões de design, raciocínio técnico e implementação

---

## O problema que estava sendo resolvido

O professor de história precisa produzir planos de aula que:
1. Citem habilidades BNCC corretas — mas as habilidades variam por ano e são 183 ao todo
2. Incluam objetivos, metodologias e avaliações — campos que mudam pouco entre aulas mas que o professor não quer redigir do zero toda vez
3. Gerem um documento imprimível (ou PDF) sem precisar de Word, Google Docs ou qualquer conta
4. Funcionem dentro do ecossistema Heródoto sem quebrar o visual da ferramenta

A decisão central foi: **tudo client-side, zero backend, zero conta, zero dependência**. O professor abre, preenche, imprime. Nada mais.

---

## Decisão arquitetural: página única com inline CSS e JS

O `plano-aula.html` é um arquivo HTML único com `<style>` e `<script>` embutidos. Isso foi deliberado:

- **Portabilidade total**: o arquivo sozinho funciona sem o restante do projeto. Um Claude em outro site pode copiar apenas esse arquivo
- **Sem bundler, sem npm, sem build step**: o projeto inteiro é estático e deve continuar assim
- **Facilidade de manutenção para Claude**: um arquivo único é editável por str_replace sem gerenciar imports entre arquivos

A alternativa (separar em `plano-aula.css` + `plano-aula.js`) adicionaria três arquivos ao projeto para um único recurso. O ganho em organização não justifica a fragmentação.

---

## Estrutura do layout: dois painéis side-by-side

```css
.pw {
  display: grid;
  grid-template-columns: 470px 1fr;
  gap: 1.5rem;
}
```

**Por que dois painéis?**

A escolha entre formulário-depois-preview (scroll único) versus formulário-e-preview lado a lado foi resolvida pelo caso de uso real: o professor precisa ver o documento se formando enquanto preenche, sem ter que descer a página. O layout dual resolve isso.

- **470px fixo para o formulário**: suficiente para todos os campos sem esmagamento, mas deixa espaço generoso para a preview no lado direito em qualquer tela acima de 960px
- **`1fr` para a preview**: o documento ocupa todo o espaço restante — em telas largas fica confortável para ler antes de imprimir
- **`@media(max-width: 960px)` → coluna única**: em tablets e celulares o formulário vem primeiro, preview embaixo

---

## O problema do grid de identificação e como foi resolvido

A seção de identificação tem campos de larguras distintas que precisavam se organizar em fileiras simétricas. A versão inicial misturava `.fr` (2 colunas) e `.fr3` (3 colunas) e o resultado foi assimétrico — a última linha tinha apenas 2 campos enquanto a do meio tinha 3.

A solução foi padronizar todas as linhas como `.fr3` (3 colunas) e **adicionar um terceiro campo útil onde havia ausência**: Carga Horária Total — campo readonly calculado automaticamente a partir de `Nº de Aulas × Duração`.

Além disso, o problema de alinhamento visual entre colunas era causado por labels de comprimentos diferentes quebrando em 2 linhas em algumas colunas e não em outras. A correção:

```css
.fg label {
  min-height: 2em;
  display: flex;
  align-items: flex-end;
  padding-bottom: 0.12rem;
}
```

Todos os labels reservam 2 linhas de altura e alinham o texto pela base, independente de quantas linhas ocupem. Os inputs abaixo ficam sempre nivelados horizontalmente.

---

## Carga Horária calculada automaticamente

```js
function calcCarga() {
  const n   = parseInt(document.getElementById('f-naulas').value) || 0;
  const dur = document.getElementById('f-dur').value;
  const m   = dur === '1h30' ? 90 : parseInt(dur); // "50 min" → 50, "1h30" → 90
  const tot = n * m;
  let txt = '';
  if (tot >= 60) {
    const h = Math.floor(tot / 60), r = tot % 60;
    txt = r ? `${h}h${String(r).padStart(2, '0')}min` : `${h}h`;
  } else {
    txt = `${tot} min`;
  }
  document.getElementById('f-carga').value = txt;
}
```

Dispara em `onchange` de `f-naulas` e `f-dur`, e na inicialização. O campo é `readonly` com fundo levemente mais escuro para sinalizar que não é editável. Evita que o professor precise fazer a conta mental.

---

## Os dados BNCC: embutidos no `<script>`, não em JSON externo

Todas as 183 habilidades BNCC estão declaradas diretamente no `<script>` como objeto JavaScript literal:

```js
const BNCC = {
  1: [ { id: 'EF01HI01', t: 'Identificar aspetos...' }, ... ],
  // ...
  9: [ ... ],
  EM1: [ { id: 'EM13CHS101', t: '...' }, ... ],
};
```

**Por que não um JSON externo com fetch()?**

- O arquivo precisa funcionar offline, aberto com `file://`, sem servidor
- Um fetch() falharia silenciosamente em ambientes locais
- A performance é idêntica — os dados têm ~60KB e são parseados na inicialização
- Manter tudo num arquivo é consistente com a filosofia do projeto

**Por que o Ensino Médio usa aliases?**

```js
BNCC.EM2 = EM_BNCC;
BNCC.EM3 = EM_BNCC;
```

Na BNCC real, as habilidades CHS do EM (EM13CHS___) não estão segmentadas por série — são as mesmas 32 habilidades para as 3 séries. A distribuição por ano é competência do currículo estadual e do PPP da escola. Criar três objetos idênticos seria redundante; os aliases expressam isso semanticamente.

---

## O sistema de lock por ano

Quando o professor seleciona o ano, a função `onAno()` reconstrói os dois painéis dinâmicos:

```js
function onAno() {
  const a = document.getElementById('f-ano').value;
  const k = isNaN(parseInt(a)) ? a : parseInt(a); // '6' → 6, 'EM1' → 'EM1'
  rc('box-obj',  OBJ[k]  || null, 'obj');
  rc('box-bncc', BNCC[k] || null, 'bncc', true);
}
```

A conversão `isNaN(parseInt(a)) ? a : parseInt(a)` trata os dois tipos de chave: inteiros para o EF (`1`–`9`) e strings para o EM (`'EM1'`).

**Por que apenas Objetos de Conhecimento e Habilidades BNCC são bloqueados por ano, e não Metodologias/Recursos/Avaliação?**

Porque metodologias e instrumentos de avaliação não são específicos por ano — um júri simulado funciona no 6º ano e no 2º EM. Bloquear esses campos por ano adicionaria fricção sem ganho real. O professor precisa selecionar apenas o que se aplica à aula específica.

---

## Renderização dos checkboxes

A função `rc()` (render checkboxes) constrói o HTML dos painéis dinamicamente:

```js
function rc(boxId, items, pfx, hasId = false) {
  const b = document.getElementById(boxId);
  if (!items || !items.length) {
    b.innerHTML = '<div class="pe2">Selecione o ano/série...</div>';
    return;
  }
  b.innerHTML = items.map((item, i) => {
    const id  = hasId ? item.id : `${pfx}-${i}`;
    const txt = hasId ? item.t  : item;
    const lbl = hasId
      ? `<span class="pid">${item.id}</span>${txt}` // BNCC: código destacado
      : txt; // Presets simples
    return `<div class="pi">
      <input type="checkbox" id="c-${boxId}-${i}" class="${pfx}-ck" data-text="${txt.replace(/"/g,'&quot;')}">
      <label for="${id}">${lbl}</label>
    </div>`;
  }).join('');
}
```

O `data-text` armazena o texto completo em cada checkbox. Na hora de gerar o documento, `gc()` coleta apenas os checkboxes marcados e extrai esse atributo — evitando ter que re-consultar os dados originais.

---

## A geração do documento: HTML como template

A função `gerar()` constrói o HTML do documento de forma procedural:

```js
function gerar() {
  // 1. Lê todos os campos
  // 2. Coleta checkboxes + extras de cada seção
  // 3. Monta o HTML concatenando seções condicionalmente
  // 4. Injeta em #doc
  document.getElementById('doc').innerHTML = html;
}
```

**Por que não usar um template real (Handlebars, etc.)?**

Sem build step, sem npm. Uma função que concatena strings HTML é suficiente para um documento com ~10 seções. O padrão `sec(titulo, corpo)`:

```js
function sec(t, c) {
  return `<div class="ds"><span class="dst">${t}</span>${c}</div>`;
}
```

Cada seção só é renderizada se tiver conteúdo — `if (bn.length) html += sec(...)`. Isso garante que um documento sem habilidades selecionadas não exibe uma seção vazia com título.

---

## A preview do documento: CSS dual

O `<div id="doc">` tem dois conjuntos de estilos:

**No formulário (tela normal):**
```css
#doc {
  background: white;
  border: 1px solid rgba(176,152,112,.3);
  padding: 2rem 2.2rem;
  font-size: .92rem;
}
```

**Na impressão:**
```css
@media print {
  #doc {
    border: none !important;
    padding: 1.5cm 2cm !important;
    font-size: 10pt !important;
    box-shadow: none !important;
  }
}
```

A preview na tela é uma simulação do documento impresso, não uma réplica exata. Usa as mesmas classes CSS mas com ligeiras diferenças de espaçamento e tamanho de fonte para se adaptar melhor ao painel lateral.

---

## O botão "Baixar / Imprimir PDF"

```js
window.print()
```

Essa é toda a implementação. `window.print()` abre o diálogo de impressão nativo do sistema operacional. Em Chrome/Edge/Firefox, uma das opções é "Salvar como PDF" — o que produz um PDF de qualidade tipográfica perfeita, com fontes embutidas e layout idêntico ao da impressão.

**Por que não usar uma biblioteca de geração de PDF (jsPDF, etc.)?**

- jsPDF não renderiza HTML arbitrário bem — precisaria de html2canvas, que produz bitmaps
- O diálogo nativo de impressão usa o motor de renderização do browser, que já sabe renderizar o HTML/CSS exatamente como está
- Zero dependências, zero KB adicionais

**O que o `@media print` faz:**

```css
@media print {
  body { background: white !important; }
  body::before { display: none; }           /* Remove a sobreposição escura */
  header, .fp, .pt { display: none !important; } /* Remove nav, formulário, toolbar */
  .pw { display: block !important; padding: 0 !important; } /* Uma coluna */
  .pp { background: white !important; border: none !important; box-shadow: none !important; }
  .pb2 { padding: 0 !important; }
  #doc { padding: 1.5cm 2cm !important; font-size: 10pt !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
```

A propriedade `print-color-adjust: exact` é crítica — sem ela, browsers modernos removem fundos coloridos por padrão para economizar tinta. Os títulos de seção com fundo preto (`<span class="dst">`) seriam renderizados como texto preto sobre fundo branco sem ela.

---

## O campo "Adicionar livremente" abaixo de cada preset

Cada seção tem um `<textarea>` de adição livre abaixo dos checkboxes. A função `gc()` (get checked) combina os dois:

```js
function gc(pfx, xaId) {
  const ch = [...document.querySelectorAll(`.${pfx}-ck:checked`)].map(c => c.dataset.text);
  const ex = (document.getElementById(xaId)?.value || '').trim();
  return [...ch, ...(ex ? [ex] : [])];
}
```

O texto livre é tratado como um item único (um parágrafo no documento final), não como lista de itens separados. Isso é intencional — se o professor escreve três objetivos no campo livre, é responsabilidade dele separá-los. Não há lógica de parsing de texto livre.

---

## Inicialização dos presets fixos

Na carga da página, os quatro painéis de presets fixos são renderizados imediatamente (sem esperar seleção de ano):

```js
rp('box-obt', POBJ, 'obt'); // Objetivos
rp('box-met', PMET, 'met'); // Metodologias
rp('box-rec', PREC, 'rec'); // Recursos
rp('box-ava', PAVA, 'ava'); // Avaliação
```

E a data é pré-preenchida:
```js
document.getElementById('f-data').valueAsDate = new Date();
```

Isso reduz o número de cliques obrigatórios — o professor já tem a data atual e os presets visíveis sem precisar fazer nada.

---

## Integração visual com o ecossistema

O `plano-aula.html` usa exatamente as mesmas variáveis CSS e a mesma estrutura de header que `sobre.html` e `guia-professor.html`. Isso não foi acidental — foi copiado deliberadamente de um arquivo existente e adaptado.

A vantagem: qualquer professor que já usou o Heródoto reconhece imediatamente a interface. O mesmo padrão de cores, tipografia e navegação se replica sem esforço.

**Para replicar em outros projetos do ecossistema:**

1. Copiar o bloco `:root { }` com as variáveis CSS (pergaminho, tinta, bordas, tipografia)
2. Copiar o `<header>` exato (inclusive o `::after` de borda dupla)
3. Copiar o padrão `.fp` (form panel) + `.pp` (preview panel) com grid de dois painéis
4. Adaptar os dados (BNCC → conteúdo da disciplina)
5. O `@media print` é 100% reutilizável sem modificação
