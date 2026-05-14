# Como foi construída a página Sobre
### Decisões de design, raciocínio técnico e implementação

---

## O que a página Sobre precisa fazer

Uma página "Sobre" pedagógica tem funções distintas de uma landing page comercial. Ela precisa:

1. Explicar **o que a ferramenta é** para quem chega sem contexto
2. Mostrar **os números do projeto** de forma impactante mas não exagerada
3. Comunicar a **filosofia** por trás das decisões de curadoria (por que o nazismo é "social" e não "guerra")
4. Mostrar que o projeto é **código aberto e confiável**
5. Contextualizar a ferramenta dentro do **ecossistema** maior de que faz parte

E fazer tudo isso sem perder o tom: solene, acadêmico, mas acessível. O visual de pergaminho não pode parecer kitsch — precisa ser funcional.

---

## Estrutura da página: coluna única centrada

```css
.page-wrapper {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}
```

Ao contrário do `guia-professor.html` (que tem sidebar de navegação) e do `plano-aula.html` (que tem dois painéis), o `sobre.html` usa **coluna única estreita**.

**Por que 860px e não 1100px?**

Texto longo em colunas muito largas cansa o olho — a linha ideal para leitura confortável em português é entre 60 e 80 caracteres. Com a tipografia usada (Crimson Text, ~18px), 860px produz aproximadamente essa largura de linha. O `guia-professor.html` usa 1200px porque tem sidebar, reduzindo a área de texto efetiva para o mesmo intervalo.

---

## O card de conteúdo

```css
.content-card {
  background: rgba(246,241,228,0.92);
  border: 1px solid var(--borda-pergaminho);
  border-radius: 4px;
  box-shadow: 2px 4px 18px rgba(0,0,0,0.28);
  padding: 2.5rem 3rem;
}
```

O fundo é `rgba(246,241,228,0.92)` — quase opaco mas ligeiramente transparente. Isso deixa a textura do pergaminho do body aparecer sutilmente através do card, mantendo a continuidade visual. Se fosse `opacity: 1` (branco sólido), o card ficaria "flutuando" desconectado do fundo.

`border-radius: 4px` é propositalmente pequeno — bordas muito arredondadas dariam um aspecto moderno/app que conflita com a estética documental. 4px é suficiente para suavizar os cantos sem perder a sensação de documento.

---

## A epígrafe de Heródoto

```html
<blockquote class="epigraph">
  «Heródoto de Halicarnasso apresenta aqui os resultados de sua pesquisa,
   para que o tempo não apague os feitos dos homens.»
  <cite>— Heródoto, <em>Histórias</em>, c. 440 a.C.</cite>
</blockquote>
```

```css
.epigraph {
  font-style: italic;
  border-left: 3px solid var(--borda-pergaminho);
  padding: 0.6rem 1.2rem;
  margin: 1.5rem 0 2rem;
}
```

Três decisões aqui:

1. **A borda esquerda em vez de aspas tipográficas CSS** — produz um recuo visual mais elegante e academicamente familiar (é o padrão de citação em documentos acadêmicos)
2. **`color: var(--tinta-desbotada)`** — o texto da epígrafe usa a cor "desbotada" (marrom médio), não o preto total da `--tinta-pena`. Isso sinaliza que é citação, não texto do autor
3. **`<cite>` como `display: block`** — coloca a atribuição em linha separada abaixo da citação, como em textos acadêmicos

A epígrafe não é decoração — é o argumento central da ferramenta expresso em uma linha. O usuário que lê entende imediatamente a filosofia do projeto sem precisar do texto explicativo.

---

## O grid de métricas

```css
.metricas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}
```

`repeat(auto-fit, minmax(160px, 1fr))` é uma das construções CSS mais elegantes disponíveis: o grid se adapta automaticamente ao número de cards sem breakpoints manuais. Com 6 métricas numa tela de 860px, o resultado é 3 colunas × 2 linhas. Em telas menores, colapsa para 2 colunas naturalmente.

**Por que não uma tabela?**

Tabelas comunicam "comparação entre linhas". Cards comunicam "fatos independentes". As métricas (303 datasets, 2.611 entidades, etc.) são fatos autônomos — não há relação de comparação entre eles que justifique o formato de tabela.

**A `metrica-valor` usa `var(--azul-lapislazuli)` (#2b4b7e):**

```css
.metrica-valor {
  font-family: var(--fonte-titulo);
  font-size: 1.6rem;
  color: var(--azul-lapislazuli);
}
```

O azul lapis-lazúli é usado para elementos de destaque não-críticos. O vermelho ocre é reservado para títulos de seção e elementos de maior hierarquia. Os números das métricas são importantes mas não são títulos — o azul comunica "dado relevante" sem competir com a hierarquia tipográfica.

---

## O badge de versão inline

```html
<h2>Números atuais <span class="versao-badge">v7.56</span></h2>
```

```css
.versao-badge {
  display: inline-block;
  background: var(--tinta-pena);
  color: var(--perg-claro);
  font-size: 0.82rem;
  font-variant: small-caps;
  padding: 0.2rem 0.7rem;
  border-radius: 3px;
  vertical-align: middle;
}
```

O badge é colocado inline no `<h2>` porque o número de versão é contextual à seção de métricas — não merece uma linha própria, mas precisa estar visível para o professor saber se os números que está vendo são da versão atual.

---

## A seção Ecossistema: o footer separado

```css
.ecossistema-section {
  background: var(--cor-fundo, #2a1f14);
  border-top: 1px solid rgba(180,150,100,0.2);
  padding: 3rem 2rem 2.5rem;
}
```

A seção de ecossistema é **fora do `.page-wrapper`** e **fora do `.content-card`**. Ela tem fundo escuro (quase preto, `#2a1f14`) que contrasta com o card de conteúdo claro acima.

**Por que separada e não dentro do card?**

O ecossistema não é conteúdo sobre o Heródoto — é contexto sobre onde o Heródoto existe. É uma seção diferente hierarquicamente. Colocá-la fora do card, com fundo escuro, comunica visualmente essa distinção: "você acabou de ler sobre esta ferramenta; agora veja o que mais existe".

**Os eco-cards:**

```css
.eco-card {
  border: 1px solid rgba(180,150,100,0.2);
  background: rgba(255,255,255,0.02);
  transition: border-color 0.2s, background 0.2s;
}
.eco-card--active {
  border-color: rgba(180,150,100,0.45);
  cursor: default;
  pointer-events: none;
}
```

O card ativo (Heródoto, quando na página sobre.html) tem `pointer-events: none` — não é clicável porque já estamos nele. Sinaliza posição atual no ecossistema. Os outros cards são links com hover suave.

A opacidade muito baixa do fundo (`rgba(255,255,255,0.02)`) foi escolhida para os cards quase desaparecerem no fundo escuro e só ganharem presença no hover. Cartões muito sólidos sobre fundo escuro seriam pesados visualmente.

---

## Tipografia e hierarquia

A hierarquia tipográfica da página `sobre.html` tem 4 níveis:

| Nível | Tag/Classe | Família | Tamanho | Cor |
|---|---|---|---|---|
| Título da página | `.content-card h1` | IM Fell English | 2rem | `--tinta-pena` |
| Subtítulo | `.subtitulo` | Crimson Text italic | 1.05rem | `--tinta-desbotada` |
| Seção | `h2` | IM Fell English small-caps | 1.2rem | `--vermelho-ocre` |
| Corpo | `p` | Crimson Text | 1.05rem | `--tinta-pena` |

O `h2` usa `font-variant: small-caps` — não maiúsculas (`text-transform: uppercase`). Small-caps usa a versão desenhada das letras capitulares, proporcionalmente corretas para o tamanho. Maiúsculas artificiais em tipografias serifadas criam inconsistências ópticas.

O `h2` tem `border-bottom: 1px solid var(--perg-escuro)` — uma linha separadora sutil abaixo de cada título de seção. Isso cria ritmo visual na página longa sem adicionar elementos decorativos.

---

## O que foi propositalmente omitido

- **Navegação por âncoras**: o `sobre.html` não tem sidebar de navegação porque não é longo o suficiente para justificá-la. Três seções de texto não precisam de índice
- **Imagens**: sem screenshots, sem logos. O visual do projeto é criado pela tipografia e cores, não por recursos visuais externos
- **CTAs ("Comece agora!")**: o projeto é pedagógico, não comercial. Não há conversão a ser otimizada

---

## Para replicar em outros projetos do ecossistema

A estrutura do `sobre.html` é **o template mais simples do ecossistema** — página de conteúdo estático sem interatividade. Para replicar:

1. Copiar o `<head>` completo (variáveis CSS, Google Fonts, meta tags PWA)
2. Copiar o `<header>` e `.header-nav` (apenas alterar os links e o `.active`)
3. Usar `.page-wrapper` > `.content-card` como container de conteúdo
4. Usar `h2` com `border-bottom` para seções
5. Para métricas: usar `.metricas` com `auto-fit minmax(160px, 1fr)`
6. Copiar o bloco `.ecossistema-section` inteiro — apenas trocar qual `.eco-card--active` está ativo
7. O `footer` é padrão — apenas trocar o nome e versão

O tempo estimado para criar um `sobre.html` funcional e no padrão visual do ecossistema é de 15–20 minutos partindo deste arquivo.
