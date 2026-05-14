# Heródoto — Filosofia de Design e Arquitetura Visual
### Como o projeto foi organizado, equilibrado e otimizado: um guia para os outros Claudes

---

## Por que o Heródoto é a referência do ecossistema

O Heródoto foi o primeiro projeto do ecossistema e, por isso, é onde mais decisões de design foram tomadas, testadas e refinadas. Os outros projetos (Euclides, Quintiliano, Lavoisier, etc.) devem herdar essas decisões — não reinventá-las. Este documento explica **o raciocínio** por trás de cada escolha para que outros Claudes possam aplicá-las com consistência.

---

## 1. A identidade visual: de onde vem o "pergaminho"

O Heródoto é nomeado em homenagem ao historiador grego do século V a.C. A identidade visual foi construída a partir dessa referência:

- **Textura de fundo**: `assets/pergaminho.jpg` — uma imagem de pergaminho real com variações orgânicas de cor
- **Background attachment**: `background-attachment: fixed` — a textura não rola com a página, dando a sensação de que o conteúdo "flutua" sobre um material físico
- **Overlay**: `body::before` com `radial-gradient(ellipse at center, transparent 30%, rgba(15,8,2,0.42) 100%)` — escurece as bordas da tela sem escurecer o centro, como vinheta fotográfica. Isso foca o olhar no conteúdo central

A sobreposição semi-transparente é crítica: sem ela, o pergaminho seria claro demais no centro e o texto sobre o fundo teria baixo contraste.

---

## 2. O sistema de variáveis CSS

Todas as páginas do projeto usam o mesmo conjunto de variáveis:

```css
:root {
  --perg-claro:       #f6f1e4;  /* Pergaminho claro — fundo de cards */
  --perg-medio:       #e8dfc8;  /* Pergaminho médio — textos sobre fundo escuro */
  --perg-escuro:      #c8b898;  /* Pergaminho escuro — bordas, separadores */
  --tinta-pena:       #2a1e0f;  /* Tinta de pena — texto principal */
  --tinta-desbotada:  #5a4030;  /* Tinta desbotada — texto secundário, legendas */
  --borda-pergaminho: #b09870;  /* Borda de pergaminho — bordas de cards */
  --vermelho-ocre:    #8b3a2a;  /* Vermelho ocre — títulos de seção, badges */
  --azul-lapislazuli: #2b4b7e;  /* Azul lápis-lazúli — dados, links, info */
  --dourado-velho:    #7a6228;  /* Dourado velho — acentos, notas */
  --fonte-titulo:     'IM Fell English', ...;
  --fonte-texto:      'Crimson Text', ...;
}
```

**Regras de uso:**

| Variável | Onde usar | Onde NÃO usar |
|---|---|---|
| `--tinta-pena` | Texto principal, textos de alto contraste | Textos sobre fundo escuro |
| `--tinta-desbotada` | Subtítulos, legendas, texto secundário | Texto principal de parágrafo |
| `--vermelho-ocre` | `h2`, badges ativos, elementos estruturais | Links inline, destaques de dado |
| `--azul-lapislazuli` | `h3`, dados numéricos, meta-tags, links | Títulos principais |
| `--dourado-velho` | Notas, acentos, separadores sutis | Alertas, elementos críticos |
| `--perg-claro` | Fundo de cards sobre o pergaminho | Fundos de elementos sobre fundo claro |

A separação entre vermelho (estrutura) e azul (informação) é a distinção mais importante do sistema. Misturá-los destrói a hierarquia visual.

---

## 3. As duas fontes e suas funções

**IM Fell English** (`--fonte-titulo`):
- Fonte serifada com irregularidades orgânicas que evocam tipos móveis do século XVII
- Usada exclusivamente em: `h1`, `h2`, `h3`, titles, badges, `header h1`
- `font-variant: small-caps` + `letter-spacing: 0.06–0.12em` — as small-caps da IM Fell são excepcionais, muito melhor que maiúsculas sintéticas
- `font-weight: 400` — a IM Fell não tem negrito real; usar 700 produz resultado ruim

**Crimson Text** (`--fonte-texto`):
- Fonte serifada de leitura, desenhada para texto longo
- Usada em: parágrafos, labels de formulário, navegação, botões, textos de interface
- Tamanhos: 0.85rem (labels, nav) → 0.9rem (texto compacto) → 1rem (guia) → 1.05rem (sobre)
- `line-height: 1.6–1.75` para texto de leitura

**Regra absoluta**: nunca usar `font-weight: bold` em IM Fell English. Usar apenas `Crimson Text` para negritos, com `font-weight: 600`.

---

## 4. O header: a âncora visual do ecossistema

```css
header {
  background: linear-gradient(180deg, #2a1e0f 0%, #3d2e1a 100%);
  border-bottom: 3px solid var(--dourado-velho);
  box-shadow: 0 3px 18px rgba(0,0,0,0.55);
}
header::after {
  content: '';
  position: absolute;
  bottom: -6px; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent, var(--borda-pergaminho), transparent);
}
```

O header tem **três camadas de borda inferior**:
1. A borda sólida `3px solid var(--dourado-velho)` — a linha principal
2. O `::after` com gradiente — uma linha mais suave 3px abaixo, que se dissolve nas bordas
3. A sombra `box-shadow: 0 3px 18px rgba(0,0,0,0.55)` — profundidade

O efeito é um header que parece ter espessura, não apenas cor. Isso foi descoberto iterativamente — uma borda única produzia resultado plano.

**Os botões de navegação:**

```css
.nav-btn {
  border: 1px solid var(--borda-pergaminho);
  background: rgba(255,255,255,0.06);
  transition: background 0.2s, color 0.2s;
}
.nav-btn.active {
  background: rgba(176,152,112,0.3);
  border-color: var(--perg-escuro);
}
```

`rgba(255,255,255,0.06)` como fundo padrão — quase invisível. O botão existe pela borda, não pelo fundo. No hover, `rgba(255,255,255,0.15)` — levemente mais visível. O `.active` usa `rgba(176,152,112,0.3)` — cor de pergaminho, não branco, para manter a paleta.

---

## 5. O padrão de card

Todos os cards de conteúdo do projeto seguem o mesmo padrão base:

```css
.content-card {
  background: rgba(246,241,228,0.92);    /* perg-claro com 92% de opacidade */
  border: 1px solid var(--borda-pergaminho);
  border-radius: 4px;                    /* mínimo, não redondo */
  box-shadow: 2px 4px 18px rgba(0,0,0,0.28);
  padding: 2rem 2.5rem;                  /* espaçamento generoso */
}
```

A opacidade 92% é deliberada — deixa a textura de fundo aparecer sutilmente, mantendo a continuidade com o pergaminho. 100% (branco sólido) cortaria visualmente o card do contexto.

O `border-radius: 4px` é o máximo aceitável para manter a estética documental. Bordas mais arredondadas conflitam com a sensação de material físico.

---

## 6. Como a simetria é garantida nos formulários

O problema de formulários assimétricos é recorrente. A causa mais comum é **labels de alturas diferentes** causando desalinhamento dos inputs abaixo.

**A solução universal:**

```css
.fg label {
  min-height: 2em;
  display: flex;
  align-items: flex-end;
  padding-bottom: 0.12rem;
}
```

- `min-height: 2em` — todos os labels têm no mínimo 2 linhas de altura
- `display: flex; align-items: flex-end` — o texto do label alinha pela base
- Resultado: inputs sempre na mesma linha horizontal, independente do label acima

Para grids de 3 colunas simétricos:

```css
.fr3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}
```

Se uma linha de 3 colunas não tem conteúdo suficiente para a terceira célula, inventar um campo útil (como "Carga Horária Total" no plano de aula) em vez de deixar a célula vazia ou usar `1fr 1fr` que quebraria a simetria com a linha acima.

---

## 7. Os três templates de página

O ecossistema usa três templates de página, cada um com sua aplicação:

### Template 1: Coluna única estreita (`sobre.html`)
```
max-width: 860px + .content-card
```
- Para: páginas de conteúdo puro (sobre, créditos, changelog)
- Sem sidebar, sem interatividade
- 860px → ~70 caracteres por linha → leitura confortável

### Template 2: Sidebar + conteúdo longo (`guia-professor.html`)
```
flex + 220px sidebar sticky + flex:1 conteúdo
```
- Para: documentação, guias, referências longas com seções navegáveis
- Sidebar com `position: sticky` + links âncora
- `scroll-margin-top` nos destinos de âncora

### Template 3: Dois painéis (`plano-aula.html`, `index.html` com sidebar)
```
grid com coluna fixa + 1fr
```
- Para: ferramentas interativas com input + output em paralelo
- Coluna esquerda: formulário/controles (largura fixa, ex.: 470px)
- Coluna direita: resultado/visualização (`1fr`)
- `@media(max-width: 960px)` → coluna única

---

## 8. Hierarquia de destaque (aviso/nota/info)

Três níveis de destaque foram estabelecidos:

```css
/* Aviso — vermelho — mais urgente */
.aviso {
  background: rgba(139,58,42,0.08);
  border-left: 4px solid var(--vermelho-ocre);
}

/* Nota — dourado — informação complementar */
.nota {
  background: rgba(122,98,40,0.07);
  border-left: 3px solid var(--dourado-velho);
}

/* Info — azul — dado neutro */
.info {
  background: rgba(43,75,126,0.06);
  border-left: 3px solid var(--azul-lapislazuli);
}
```

A espessura da borda esquerda (4px vs 3px) também sinaliza urgência. A diferença é sutil mas perceptível.

---

## 9. O `@media print` como cidadão de primeira classe

Qualquer página que gera saída para impressão (plano de aula, fichas, guias) precisa de um `@media print` robusto. O padrão:

```css
@media print {
  /* 1. Remover o fundo decorativo */
  body { background: white !important; }
  body::before { display: none; }

  /* 2. Remover elementos de interface */
  header, .sidebar, .toolbar, .btn { display: none !important; }

  /* 3. Colapsar para coluna única */
  .pw { display: block !important; padding: 0 !important; }

  /* 4. Remover decorações do container */
  .card { background: white !important; border: none !important; box-shadow: none !important; }

  /* 5. Definir margens de página e tipografia */
  .content { padding: 1.5cm 2cm !important; font-size: 10pt !important; }

  /* 6. CRÍTICO: preservar cores de fundo */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```

O item 6 é o mais frequentemente esquecido. Sem `print-color-adjust: exact`, Chrome remove fundos coloridos por padrão para economizar tinta. Qualquer elemento com background (badges, headers de card, meta-tags) fica transparente na impressão.

---

## 10. Filosofia de dependências zero

Todas as páginas do ecossistema funcionam:
- Sem servidor (podem ser abertas com `file://`)
- Sem npm/bundler
- Sem frameworks JS (React, Vue, Angular)
- Sem bibliotecas CSS (Bootstrap, Tailwind)
- Sem backend ou banco de dados

As únicas exceções são:
- **D3.js**: para o grafo principal (`index.html`) — complexidade justifica dependência
- **Google Fonts**: carregamento de tipografia — aceitável, degrada graciosamente para fallbacks serifados

**Por que essa restrição?**

Os projetos são hospedados em GitHub Pages, são estáticos e precisam ser mantidos por anos sem atualizações de dependências. Uma dependência de npm hoje pode ser breaking change em 2 anos. Sem dependências, não há breaking changes.

---

## 11. Como escalar para outros projetos do ecossistema

Para criar um novo projeto (ex.: Euclides para Matemática):

**Passo 1: Copiar o template base**
- Escolher qual dos 3 templates se aplica
- Copiar o HTML correspondente (sobre, guia, ou plano-aula)
- Substituir o título, subtítulo e conteúdo

**Passo 2: Ajustar a identidade preservando o sistema**
- Manter as variáveis CSS idênticas — NUNCA alterar as cores base
- Se a disciplina justifica uma cor de acento nova (ex.: verde para Biologia), adicioná-la como variável extra sem substituir as existentes
- Manter as duas fontes

**Passo 3: Atualizar o header**
- Substituir "Heródoto" e o subtítulo pelo nome do projeto
- Atualizar os links da navegação
- Marcar a página atual com `.active` no link correto

**Passo 4: Atualizar o ecossistema**
- No bloco `.ecossistema-section`, marcar o projeto atual como `.eco-card--active`
- Verificar que todos os outros links apontam para as URLs corretas de GitHub Pages

**Passo 5: Atualizar `manifest.json` e `sw.js`**
- Trocar nome e `short_name`
- Trocar `CACHE_VERSION` (ex.: `euclides-v1-0`)
- Atualizar `STATIC_ASSETS` com os arquivos do novo projeto

O tempo estimado para uma nova página do ecossistema no padrão visual completo é:
- Página `sobre.html`: ~20 minutos
- Página `guia.html` com sidebar: ~45 minutos
- Ferramenta interativa com dois painéis: 1–3 horas dependendo da complexidade

---

## 12. Erros comuns a evitar

| Erro | Consequência | Correção |
|---|---|---|
| Esquecer `print-color-adjust: exact` | Fundos desaparecem na impressão | Adicionar ao `@media print` |
| `font-weight: bold` em IM Fell English | Resultado tipográfico ruim | Usar sempre `font-weight: 400` |
| `border-radius > 4px` nos cards | Perde estética documental | Manter em 4px ou menos |
| Labels sem `min-height` em grids | Assimetria nos formulários | Adicionar `min-height: 2em; display: flex; align-items: flex-end` |
| `opacity: 1` no fundo dos cards | Card se desconecta do pergaminho | Manter `rgba(..., 0.92)` |
| Misturar vermelho e azul sem hierarquia | Destrói o sistema visual | Vermelho = estrutura, Azul = dados |
| `background-attachment: fixed` em mobile | Pode causar glitch em Safari iOS | Adicionar `@media (max-width: 768px) { body { background-attachment: scroll } }` |
| Esquecer `position: relative; z-index: 10` no header | Header fica sob o overlay `body::before` | Sempre incluir no header |
