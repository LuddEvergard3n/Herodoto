# Documentação Heródoto — Índice

**Versão atual:** v7.56  
**Repositório:** https://github.com/LuddEvergard3n/Herodoto  
**URL:** https://luddevergard3n.github.io/Herodoto/

---

## Documentos Disponíveis

| Ficheiro | Função documentada |
|---|---|
| [`grafo-principal.md`](grafo-principal.md) | App principal: grafo de força, modos, datasets, tecnologias, fluxo de inicialização |
| [`filtros-semanticos.md`](filtros-semanticos.md) | Sistema de filtragem por século, continente, tipo e período; paleta de cores |
| [`modos-visualizacao.md`](modos-visualizacao.md) | Modo Guiado, Linha do Tempo, Personalidades, Comparar, Perguntas, Cadeia Causal, Pesquisa |
| [`i18n.md`](i18n.md) | Internacionalização PT/EN/ES; TRANSLATIONS; campos multilingues nos JSONs |
| [`datasets.md`](datasets.md) | Estrutura dos 324 datasets JSON; campos de entidade e relação; validação |
| [`pwa-service-worker.md`](pwa-service-worker.md) | PWA, manifest.json, sw.js, estratégias de cache, atualização de versão |
| [`plano-aula.md`](plano-aula.md) | Gerador de plano de aula: BNCC completa, presets pedagógicos, impressão PDF |
| [`construcao-plano-aula.md`](construcao-plano-aula.md) | Raciocínio técnico e decisões de design do plano de aula |
| [`construcao-sobre.md`](construcao-sobre.md) | Raciocínio técnico e decisões de design da página Sobre |
| [`construcao-guia-professor.md`](construcao-guia-professor.md) | Raciocínio técnico e decisões de design do Guia do Professor |
| [`filosofia-design.md`](filosofia-design.md) | Sistema visual completo: variáveis CSS, tipografia, templates, erros comuns |

---

## Estado Atual (v7.56)

| Métrica | Valor |
|---|---|
| Datasets JSON | **324** |
| Entidades históricas | **2.550** |
| Perguntas geradoras | **307** em **66 grupos** |
| Idiomas | PT / EN / ES (100% traduzido) |
| Cobertura geográfica | Global (todos os continentes, incluindo Oceania) |

---

## Arquitetura Resumida

```
Heródoto v7.56
├── index.html              ← App principal (grafo + todos os modos)
├── filtros-semanticos.html ← Filtros semânticos standalone
├── fontes.html             ← Fontes bibliográficas
├── guia-professor.html     ← Guia pedagógico
├── plano-aula.html         ← Gerador de plano de aula (BNCC)
├── sobre.html              ← Sobre o projeto e ecossistema
├── ajuda.html              ← Ajuda e FAQ
├── sw.js                   ← Service Worker (PWA, cache v7-56)
├── manifest.json           ← Manifesto PWA
├── js/
│   ├── main.js             ← Ponto de entrada
│   ├── graph.js            ← Renderização D3
│   ├── data.js             ← Carregamento de dados
│   ├── filtros.js          ← Filtros semânticos
│   ├── i18n.js             ← Internacionalização
│   ├── timeline.js         ← Modo Linha do Tempo
│   ├── personagens.js      ← Modo Personalidades
│   ├── compare.js          ← Modo Comparar
│   ├── questions.js        ← 307 perguntas em 66 grupos
│   ├── guided-mode.js      ← Modo Exploração Guiada
│   ├── context.js / context-panel.js  ← Painel lateral
│   ├── causal-chain.js / consequence-chain.js  ← Cadeia causal
│   ├── search.js           ← Pesquisa de entidades
│   ├── legend-filter.js    ← Filtro por legenda
│   ├── geo-layer.js        ← Camada geográfica
│   ├── dataset-labels.js   ← Labels de datasets
│   └── utils.js            ← Utilitários e paleta
├── data/
│   └── *.json              ← 324 datasets (2.550 entidades)
├── docs/
│   └── *.md                ← Esta pasta
├── assets/pergaminho.jpg
└── icons/
```

---

## Cobertura Geográfica e Temática (v7.56)

**Europa** — Grécia, Roma, Medievalismo, Renascimento, Reformas Religiosas, Iluminismo, Impérios Coloniais, Guerras Mundiais, Guerra Fria, Contemporaneidade  
**Américas** — Povos pré-colombianos, Brasil Colonial ao Contemporâneo, EUA, América Latina, Independências, Ditaduras, Haiti  
**África** — Reinos pré-coloniais, Tráfico Transatlântico, Colonialismo, Descolonização, Apartheid, África do Sul contemporânea  
**Ásia** — China, Japão, Índia, Pérsia, Mongóis, Rota da Seda, Revolução Iraniana, Primavera Árabe  
**Oriente Médio** — Mesopotâmia, Islã, Cruzadas, Império Otomano, Primavera Árabe, Conflito Israel-Palestina  
**Oceania** — Aborígenes australianos (65.000 anos), Expansão Polinésia/Maori, Melanésia, Contemporâneo  
**Global/Transversal** — Colapso da Idade do Bronze, Idade Axial, Pandemias, Tráfico Transatlântico, Rota da Seda, Pirataria, História da Alimentação, Movimento Não-Alinhado, Revolução Digital, Anos 1990, Guerra do Vietnam

---

## Datasets Adicionados na Expansão (sessões 14–atual)

Entre os datasets notáveis criados após a base inicial:

- `dados-trafico-transatlantico.json` — 12,5 milhões de embarcados, triângulo atlântico, resistência, abolicionismo
- `dados-colapso-idade-bronze.json` — 1200 a.C., Povos do Mar, Ugarit, queda simultânea dos impérios
- `dados-pandemias.json` — Da Praga de Atenas à AIDS, quarentena como poder do Estado
- `dados-rota-seda.json` — Da ARPANET... da Han ao Belt and Road de Xi Jinping
- `dados-anos-1990.json` — Fukuyama, internet, Ruanda, Oslo, oligarcas, Al-Qaeda gestada
- `dados-idade-axial.json` — Buda, Confúcio, Sócrates e profetas hebreus contemporâneos
- `dados-guerra-vietnam.json` — Dien Bien Phu, Tet, My Lai, Pentagon Papers, Saigon
- `dados-oceania-aborigenes.json` — 65.000 anos, songlines, terra nullius, Gerações Roubadas, Mabo
- `dados-oceania-polinesia.json` — Austronésios, waka, Havaí, Ilha de Páscoa, Maori
- `dados-oceania-melanesia.json` — Papua, Fiji, testes nucleares em Bikini e Mururoa
- `dados-oceania-contemporanea.json` — Descolonização, Tuvalu e crise climática, renascimento cultural
- `dados-revolucao-iraniana.json` — Golpe CIA 1953, Xá, Revolução 1979, reféns, Irã-Iraque, Mahsa Amini
- `dados-primavera-arabe.json` — Bouazizi, Tunísia, Egito, Líbia, Síria, Iêmen, ISIS
- `dados-africa-sul-apartheid.json` — Pass Books, Soweto, boicote, Mandela, TRC, milagre inacabado
- `dados-revolucao-digital.json` — Turing, ARPANET, PC, dot-com, Web 2.0, Snowden, Cambridge Analytica, IA
- `dados-pirataria.json` — Mediterrâneo antigo, Vikings, corsários berberes, Caribe, Índico, Somália
- `dados-historia-alimentacao.json` — Fogo, agricultura, especiarias, Troca Colombiana, açúcar/escravidão, fome política
- `dados-movimento-nao-alinhado.json` — Bandung 1955, Nehru/Nasser/Tito, Suez, NOEI, BRICS

---

## Ecossistema

| Projeto | Disciplina | URL |
|---|---|---|
| **Heródoto** | História | https://luddevergard3n.github.io/Herodoto/ |
| Euclides | Matemática | https://luddevergard3n.github.io/euclides/ |
| Quintiliano | Língua Portuguesa e Literatura | https://luddevergard3n.github.io/quintiliano/ |
| Johnson English | Laboratório de Língua Inglesa | https://luddevergard3n.github.io/johnson-english/ |
| Lavoisier | Laboratório Visual de Química | https://luddevergard3n.github.io/lavoisier/ |
| Humboldt | Atlas Interativo de Geografia | https://luddevergard3n.github.io/humboldt/ |
