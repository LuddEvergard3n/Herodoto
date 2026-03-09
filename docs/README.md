# Documentação Heródoto — Índice

**Versão atual:** v7.43  
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
| [`datasets.md`](datasets.md) | Estrutura dos 306 datasets JSON; campos de entidade e relação; validação |
| [`pwa-service-worker.md`](pwa-service-worker.md) | PWA, manifest.json, sw.js, estratégias de cache, atualização de versão |
| [`plano-aula.md`](plano-aula.md) | Gerador de plano de aula: BNCC completa, presets pedagógicos, impressão PDF |

---

## Arquitetura Resumida

```
Heródoto v7.43
├── index.html              ← App principal (grafo + todos os modos)
├── filtros-semanticos.html ← Filtros semânticos standalone
├── fontes.html             ← Fontes bibliográficas
├── guia-professor.html     ← Guia pedagógico
├── plano-aula.html         ← Gerador de plano de aula (BNCC)
├── sobre.html              ← Sobre o projeto e ecossistema
├── ajuda.html              ← Ajuda e FAQ
├── sw.js                   ← Service Worker (PWA)
├── manifest.json           ← Manifesto PWA
├── css/
│   ├── base.css
│   └── components.css
├── js/
│   ├── main.js             ← Ponto de entrada
│   ├── graph.js            ← Renderização D3
│   ├── data.js             ← Carregamento de dados
│   ├── filtros.js          ← Filtros semânticos
│   ├── i18n.js             ← Internacionalização
│   ├── timeline.js         ← Modo Linha do Tempo
│   ├── personagens.js      ← Modo Personalidades
│   ├── compare.js          ← Modo Comparar
│   ├── questions.js        ← Modo Perguntas
│   ├── guided-mode.js      ← Modo Exploração Guiada
│   ├── context.js          ← Geração de contexto
│   ├── context-panel.js    ← Painel lateral
│   ├── causal-chain.js     ← Cadeia causal
│   ├── consequence-chain.js← Consequências encadeadas
│   ├── search.js           ← Pesquisa de entidades
│   ├── legend-filter.js    ← Filtro por legenda
│   ├── geo-layer.js        ← Camada geográfica
│   ├── dataset-labels.js   ← Labels de datasets
│   └── utils.js            ← Utilitários e paleta
├── data/
│   └── *.json              ← 306 datasets (2.644 entidades)
├── docs/
│   └── *.md                ← Esta pasta
├── assets/
│   └── pergaminho.jpg      ← Textura de fundo
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon.svg
```

---

## Ecossistema

O Heródoto faz parte de um ecossistema de ferramentas educativas:

| Projeto | Disciplina | URL |
|---|---|---|
| **Heródoto** | História | https://luddevergard3n.github.io/Herodoto/ |
| Euclides | Matemática | https://luddevergard3n.github.io/euclides/ |
| Quintiliano | Língua Portuguesa e Literatura | https://luddevergard3n.github.io/quintiliano/ |
| Johnson English | Laboratório de Língua Inglesa | https://luddevergard3n.github.io/johnson-english/ |
| Lavoisier | Laboratório Visual de Química | https://luddevergard3n.github.io/lavoisier/ |
| Humboldt | Atlas Interativo de Geografia | https://luddevergard3n.github.io/humboldt/ |
