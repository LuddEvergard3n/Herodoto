# Como foi construído o Guia do Professor
### Decisões de design, raciocínio técnico e implementação

---

## O que o Guia do Professor precisa fazer

O guia não é documentação técnica — é material pedagógico dirigido ao professor. O leitor:
- Já sabe que a ferramenta existe (está na página, não chegou por busca)
- Precisa de orientação prática: como usar em sala de aula
- Provavelmente está com o projeto aberto ao lado (dual screen ou tablet)
- Pode querer voltar a uma seção específica rapidamente

Isso define três requisitos estruturais: **navegação interna rápida**, **atividades práticas prontas para usar**, e **linguagem direta sem tecnicismos**.

---

## Estrutura de layout: sidebar + conteúdo

```css
.page-wrapper {
  display: flex;
  max-width: 1200px;
  gap: 1.5rem;
}
.guia-sidebar { width: 220px; flex-shrink: 0; }
.guia-content { flex: 1; min-width: 0; }
```

O layout é `flexbox` com sidebar fixa de 220px e conteúdo `flex: 1`. 

**Por que flexbox e não grid?**

Grid seria natural para layouts de duas colunas, mas flexbox permite que a sidebar seja `flex-shrink: 0` (nunca encolhe) enquanto o conteúdo absorve todo o espaço restante. Com grid, precisaríamos definir colunas explicitamente ou usar `minmax()`, o que torna o comportamento responsivo mais difícil de controlar.

**Por que 220px para a sidebar?**

- Largo o suficiente para acomodar os títulos das seções sem quebrar linha em palavras curtas
- Estreito o suficiente para não roubar espaço do conteúdo principal
- Em 1200px total, a área de conteúdo fica em ~940px — ideal para texto longo com leitura confortável

**O `min-width: 0` no conteúdo é crítico:**

Sem ele, `flex: 1` pode causar overflow em divs filhos com `overflow: hidden` ou tabelas. É um bug clássico de flexbox — o padrão `min-width` de elementos flex é `auto`, não `0`.

---

## A sidebar sticky

```css
.sidebar-panel {
  position: sticky;
  top: 1.5rem;
}
```

`position: sticky` mantém a sidebar visível enquanto o professor lê o conteúdo longo à direita. Sem isso, a sidebar desapareceria ao scrollar e perderia sua utilidade como índice de navegação.

**Estrutura da sidebar:**

```html
<div class="sec-group">Início</div>
<a href="#o-que-e">O que é o Heródoto?</a>
<a href="#como-usar">Como usar em sala</a>
<div class="sec-group">Atividades</div>
<a href="#ativ-guiado">1 — Mapa narrativo</a>
<!-- ... -->
```

`.sec-group` são rótulos de grupo não-clicáveis com `font-variant: small-caps` e cor mais apagada. Criam hierarquia dentro da navegação sem serem links. Isso separa visualmente "seções de contexto" de "atividades práticas".

O hover dos links da sidebar usa `border-left: 3px solid transparent` como base, transitioning para `border-left-color: var(--borda-pergaminho)` no hover. Isso cria um indicador visual de foco à esquerda sem deslocar o texto — a borda já está ocupando espaço (transparent), então só a cor muda.

---

## Os `scroll-margin-top` nos h2

```css
h2 {
  scroll-margin-top: 1.5rem;
}
```

Sem isso, quando o usuário clica num link âncora (`#ativ-guiado`), o browser scrollaria até o `h2` colado no topo da viewport. Com `scroll-margin-top: 1.5rem`, o h2 destino para 1.5rem abaixo do topo — dando respiração visual ao destino.

---

## Os cards de atividade

```html
<div class="atividade">
  <div class="atividade-header">
    <span class="atividade-num">Ativ. 1</span>
    <span class="atividade-titulo">Seguindo o fio</span>
  </div>
  <div class="atividade-body">
    <div class="atividade-meta">
      <span class="meta-tag"><strong>Nível:</strong> Fundamental II / Médio</span>
      <span class="meta-tag"><strong>Duração:</strong> 30–45 min</span>
      <span class="meta-tag"><strong>Modo:</strong> Exploração Guiada</span>
    </div>
    <!-- conteúdo -->
  </div>
</div>
```

**Por que o padrão de card e não texto corrido?**

O professor em sala precisa recuperar a atividade rapidamente. Cards com número, título, nível, duração e modo facilitam o scan visual. Texto corrido obrigaria a ler tudo para encontrar a atividade certa. O formato também sinaliza que as atividades são unidades discretas, não um fluxo contínuo.

**As meta-tags:**

```css
.meta-tag {
  display: inline-block;
  background: rgba(43,75,126,0.08);
  border: 1px solid rgba(43,75,126,0.2);
  border-radius: 3px;
  padding: 0.15rem 0.5rem;
  font-size: 0.85rem;
}
```

Fundo azul muito tênue com borda azul suave. O azul remete ao `--azul-lapislazuli` usado em elementos de informação. As tags são lidas rapidamente — o professor vê "Médio / 45 min / Cadeia Causal" em 2 segundos.

**O header do card:**

```css
.atividade-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(90deg, rgba(139,58,42,0.08), transparent);
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--perg-escuro);
}
.atividade-num {
  background: var(--vermelho-ocre);
  color: var(--perg-claro);
  font-variant: small-caps;
  padding: 0.15rem 0.6rem;
  border-radius: 2px;
}
```

O número da atividade tem fundo `--vermelho-ocre` (o mesmo usado em `h2`), criando consistência: vermelho = elemento estrutural/navigacional. O gradiente horizontal no header vai de `rgba(139,58,42,0.08)` (tênue vermelho) para `transparent`, criando uma transição suave que integra o badge sem ser agressivo.

---

## A tabela de tipos históricos

```html
<table class="nivel-table">
  <thead><tr><th>Tipo</th><th>Critério</th><th>Exemplo contraintuitivo</th></tr></thead>
  <tbody>
    <tr><td><strong>Social</strong></td><td>Estruturas sociais, movimentos...</td><td>Nazismo → social, não guerra</td></tr>
  </tbody>
</table>
```

A coluna "Exemplo contraintuitivo" foi uma decisão deliberada. A tabela poderia ter apenas Tipo + Critério — mas o objetivo pedagógico é justamente provocar o professor a questionar classificações óbvias. A terceira coluna transforma a tabela de referência em instrumento de reflexão.

O CSS da tabela usa `border-collapse: collapse` com bordas em `var(--perg-escuro)`. Sem isso, bordas duplas apareceriam entre células — visualmente pesado para uma tabela de conteúdo.

---

## O bloco de aviso

```css
.aviso {
  background: rgba(139,58,42,0.08);
  border-left: 4px solid var(--vermelho-ocre);
  padding: 0.8rem 1.2rem;
  border-radius: 0 3px 3px 0;
  margin: 1rem 0;
}
```

Fundo levemente avermelhado com borda esquerda vermelha sólida. Funciona como "callout" — sinaliza informação importante sem ser alarme. Usado na seção de limitações, onde o aviso ao professor é: "comunique as limitações explicitamente — isso é parte do aprendizado".

```css
.nota {
  background: rgba(122,98,40,0.07);
  border-left: 3px solid var(--dourado-velho);
  /* ... */
}
```

O `.nota` usa dourado (informação complementar, menos urgente que aviso). A distinção dourado/vermelho cria dois níveis de "destaque" sem precisar de ícones.

---

## Os levels de ensino (`.nivel-tag`)

```css
.nivel-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 2px;
  font-size: 0.8rem;
  font-variant: small-caps;
}
.nivel-tag.ef { background: rgba(46,91,62,0.12); color: var(--verde-historico); border: 1px solid rgba(46,91,62,0.3); }
.nivel-tag.em { background: rgba(43,75,126,0.1);  color: var(--azul-lapislazuli); border: 1px solid rgba(43,75,126,0.25); }
```

EF usa verde (`--verde-historico`), EM usa azul. A distinção de cores nos badges de nível permite ao professor escanear visualmente quais atividades são para qual etapa, sem ler o texto.

---

## Navegação responsiva em mobile

O guia não colapsa a sidebar em mobile — ela some e o conteúdo ocupa a largura toda. Isso é aceitável porque:
- O público primário usa o guia em desktop (aula, projetor)
- Em mobile, a sidebar de 220px consumiria metade da tela e forçaria scroll horizontal
- Não vale a complexidade de um menu hamburguer para um documento pedagógico de uso ocasional

---

## Decisões de conteúdo que afetam o design

**Atividades têm "Variante"**: cada atividade tem pelo menos uma variante ou extensão. Isso foi uma decisão de conteúdo com implicação de design — a variante usa `<p>` com `<strong>Variante:</strong>` inline em vez de um bloco separado. Mantém o card compacto sem perder a informação.

**Linguagem das atividades**: imperativa, direta. "Acesse o modo X. Escolha Y. Discuta com os alunos." Não "O professor pode sugerir que os alunos acessem". O tom instrucional encurta o texto e o deixa mais fácil de seguir em tempo real de aula.

**Seção de limitações é a última**: deliberadamente posicionada após todas as atividades. Se estivesse no início, criaria resistência antes do professor ver o valor da ferramenta. No final, funciona como contextualização crítica depois de já ter sido convencido.

---

## Para replicar em outros projetos do ecossistema

A estrutura do `guia-professor.html` é o **template de conteúdo longo com navegação**. Para replicar:

1. Usar o layout `flexbox` com sidebar de 220px + `flex: 1` para conteúdo
2. Sidebar com `position: sticky; top: 1.5rem`
3. Links âncora (`href="#secao"`) + `scroll-margin-top` nos destinos
4. Cards de atividade com header colorido + meta-tags + corpo
5. `.aviso` (vermelho) e `.nota` (dourado) para destaques de dois níveis
6. `h2` com `border-bottom` e cor `--vermelho-ocre`
7. `h3` com cor `--azul-lapislazuli` para sub-seções

O padrão sidebar + conteúdo longo é reutilizável para qualquer guia pedagógico de qualquer disciplina do ecossistema.
