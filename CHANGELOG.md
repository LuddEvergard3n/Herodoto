# CHANGELOG

All notable changes to Orion are documented in this file.
Versions are listed in reverse chronological order.

---

## v6.6 — 2026-02-22

### Datasets adicionados (+11, total: 74)

**Ásia (+3)**
- `dados-india-antiga.json` — Vale do Indo, período védico, Maurya/Asoka, Gupta (zero posicional), Chola/Vijayanagara
- `dados-china-antiga.json` — Shang/Zhou/Reinos Combatentes, Qin/Han (Rota da Seda, papel), Tang/Song (4 invenções), Ming/Qing/República Popular
- `dados-japao-feudal.json` — Nara/Heian (Genji Monogatari), Xogunato/Sengoku/Tokugawa, Meiji/Imperialismo/WWII Pacífico

**África (+3)**
- `dados-africa-oriental.json` — Axum (primeiro Estado cristão africano, 325 d.C.), Civilização Suaíle e comércio do Índico
- `dados-africa-ocidental.json` — Ghana/Mali/Songhai (Mansa Musa, Tombuctu), tráfico escravagista e seus impactos na África
- `dados-africa-centro-sul.json` — Grande Zimbabwe, Shaka Zulu e o Mfecane

**Oriente Médio (+2)**
- `dados-persia-antiga.json` — Aquemênida (Ciro, Cilindro de Ciro), Parta/Sassânida, Safávida e o cisma sunita-xiita
- `dados-oriente-medio-moderno.json` — Civilização Islâmica Clássica (álgebra, Avicena), Cruzadas, Oriente Médio no séc. XX (petróleo, fronteiras, conflitos)

**América do Norte (+2)**
- `dados-povos-nativos-norte.json` — 500 nações nativas, Cahokia, Liga Iroquesa, colonização europeia, Revolução Americana, Guerra Civil e industrialização dos EUA
- `dados-caribe-colonial.json` — Taínos, plantation açucareira, Revolução Haitiana (1804)

**América Central (+1)**
- `dados-maya-classico.json` — Maias Clássicos (Tikal, escrita, astronomia), colapso clássico, conquista espanhola e queima dos códices

### Distribuição de datasets por região após v6.6
| Região               | Datasets |
|----------------------|----------|
| Pré-História/Evolução| 2        |
| Europa               | 34       |
| Ásia                 | 9        |
| África               | 8        |
| Oriente Médio        | 7        |
| América do Norte     | 3        |
| América Central      | 3        |
| América do Sul       | 8        |
| **Total**            | **74**   |

---


## v6.5 — 2026-02-22

### Guided mode — highlight + follow
- Current node now shows a pulsing amber ring (`.guided-ring`) that tracks the node position even while the D3 simulation is running
- On each advance/back, the graph smoothly pans and zooms (scale 2×) to center on the current node — `focusNode()` exported from graph.js, called via guided-mode.js
- Links connected to the current node are highlighted at 0.65 opacity and 2× stroke-width; all other links fade to 0.04
- Arrow keys (←/→ or ↑/↓) also advance/retreat in guided mode; Escape deactivates

### Guided box position
- Moved from center-screen to `left: 50%; transform: translateX(-70%)` — effectively ~120px left of center, avoiding overlap with the info panel on the right

### Internationalization
- Added guided mode strings to all three languages:
  - `guided_btn`, `guided_prev`, `guided_next`, `guided_exit`, `guided_no_data`
- Added continent header strings to EN and ES:
  - `continent_prehistory/europe/asia/africa/middleeast/northamerica/centralamerica/southamerica/antarctica`
  - `continent_no_datasets`
- Added semantic filter strings: `filter_centuries`, `filter_type`, `filter_apply`, `filter_clear`
- All guided-box buttons now have `data-i18n` attributes and update on language change
- Continent `<p class="dataset-group-label">` headers now have `data-i18n` attributes
- `updateGuidedLang()` called from main.js on every language switch

### Responsive design
- Added breakpoints covering four viewport ranges:
  - Desktop ≥1024px: `font-size: 14px` base (slightly denser, ~90% zoom feel), sidebar 260px, info panel 340px
  - Projector ≥1800px: `font-size: 16px`, larger guided box (560px), larger button and text
  - Tablet 600–1023px: sidebar 230px, guided box takes available width between sidebar and info panel
  - Mobile ≤600px: column layout, sidebar as top bar (35vh), info panel as bottom sheet, guided box full-width, legend hidden
- Used `clamp()` for headline font sizes to scale smoothly with viewport
- Added `@media (forced-colors)` rule for accessibility/high-contrast modes

### graph.js — new exports
- `focusNode(entity)`: animates D3 zoom to center on entity (duration 700ms, `easeCubicInOut`)
- `setGuidedHighlight(entityId)`: inserts/removes the `.guided-ring` circle in the SVG group; tracked during simulation tick

---

## v6.4 — 2026-02-22

### Interface
- Removed "Conjuntos de Dados" label (replaced by continent headers in previous version)
- Added dedicated "Pre-Historia e Evolucao Humana" section above all continent sections in dataset list
- Removed the "Continentes" filter block from the semantic filter panel (redundant with continent-based dataset organization)
- Renamed `dados-pre-historia` entry to "Idades dos Metais e Transicao" in sidebar (Paleolithic/Neolithic now in the new expanded dataset)

### Datasets added (1)
- `dados-evolucao-humana.json` — 10 entities covering: Australopithecus, Homo habilis/erectus, Neanderthals/Denisovans, Homo sapiens origins and dispersals, Lower/Middle Paleolithic, Upper Paleolithic, Mesolithic, Neolithic Revolution, Bronze Age, Bronze Age Collapse/Iron Age

### Bias corrections
- `dados-pre-historia.json` / `preh-001`: Removed "Sem agricultura, propriedade privada ou hierarquias complexas" (Rousseau-flavored primitive-communism framing); replaced with factual description
- `dados-capitalismo.json` / `cap-002`: Renamed from "Acumulacao Primitiva" (Marxist term) to "Capitalismo Industrial e os Cercamentos"; removed Hilferding/Lenin as cited analysts; neutralized framing
- `dados-capitalismo.json` / `cap-003`: Removed Hilferding/Lenin citation as authoritative economic analysts
- `dados-capitalismo.json` / `cap-005`: Removed "primeiro experimento neoliberal no Chile apos golpe militar" (implied causal equivalence); replaced with factual description of policies and debated results
- `dados-socialismo-trabalho.json` / `soc-002`: Added that Marx's theory is "contestada por economistas liberais e conservadores"; removed uncritical framing
- `dados-socialismo-trabalho.json` / `soc-004`: Removed "primeiro exemplo de poder operario" (Marxist valorization of Paris Commune); added that interpretations diverge sharply across political traditions
- `dados-socialismo-trabalho.json` / `soc-008`: Renamed "Movimentos de Libertacao Nacional" to "Movimentos Anticoloniais e Guerra Fria"; added that results ranged from stable democracies to violent dictatorships; removed Fanon as heroic authority
- `dados-descolonizacao.json` / `desc-004`: Added that independence frequently led to one-party regimes, not democracy
- `dados-descolonizacao.json` / `desc-008`: Reframed Dependency Theory as a contested economic theory with notable counter-examples (Korea, Taiwan), not as established fact
- `dados-descolonizacao-guerras.json` / Vietnam title: Removed triumphalist framing "A Derrota Americana"; Gulf of Tonkin changed from "fabricado" (proven false) to "pretexto contestado" (historically accurate)
- `dados-movimentos-sociais.json` / LGBT+: Added "Politicamente controverso em diversas regioes e culturas"
- `dados-movimentos-sociais.json` / 1968: Added Tlatelolco massacre; balanced "transformacao cultural" vs "colapso da autoridade institucional"
- `dados-movimentos-sociais.json` / Globalizacao: Added poverty reduction data alongside inequality criticism; balanced both sides

### Homo sapiens origins — evo-004 updated
O modelo "saída única da África" (~60-70 ka) está em revisão profunda, invalidado por fósseis de H. sapiens datados muito antes e em múltiplas regiões. Entidade `evo-004` atualizada com descobertas específicas:
- Apidima Cave, Grécia: ~210.000 a.C. (Nature, 2019) — mais antigo H. sapiens fora da África
- Misliya Cave, Israel: ~194.000-177.000 a.C.
- Al Wusta, Arábia Saudita: ~85.000 a.C. — mais antigo diretamente datado fora da África/Levante
- Daoxian/Fuyan Cave, China: ~80.000-120.000 a.C.
- Tam Pa Ling, Laos: ~65.000-45.000 a.C.
- Madjedbebe, Austrália: ~65.000 a.C.
- Chiquihuite Cave, México: ~26.000 a.C. (Nature, 2020) — pré-Clovis nas Américas
- Nota: achados pré-Clovis no Brasil (Pedra Furada, Serra da Capivara) e na Escandinávia permanecem debatidos na literatura especializada
- Framing: Africa como origem do H. sapiens permanece suportado; o que foi invalidado é o modelo de saída única e tardia (~60-70 ka), substituído por modelo de dispersões múltiplas com fluxo gênico

### Statistics after v6.4
- Total datasets: 63
- Approximate entities: 490+
- Approximate relations: 430+

### Interface
- Removed the "Conjuntos de Dados" section label from the sidebar
- Reorganized all dataset checkboxes by continent: Europa, Asia, Africa, Oriente Medio, America do Norte, America Central, America do Sul, Antartica
- Added placeholder text for Antarctica (no datasets available)
- Added missing region filter values: SoutheastAsia, Mesoamerica, SouthAmerica, NorthAmerica, Global
- Added Seculo XXXIII a.C. to temporal filter range

### Datasets added (10)
- `dados-reinos-africanos.json` — Aksum, Mali/Mansa Musa, Songhai, Zimbabwe, Kongo, Zulu
- `dados-sudeste-asiatico.json` — Srivijaya, Angkor, Majapahit, Dai Viet, Malaca
- `dados-coreia.json` — Tres Reinos, Joseon/Hangul, Colonizacao Japonesa, Guerra da Coreia, Milagre do Rio Han
- `dados-aztecas.json` — Olmecas, Teotihuacan, Tenochtitlan, Conquista Espanhola, Ciencia Azteca
- `dados-incas.json` — Tiwanaku/Wari, Tawantinsuyu, Machu Picchu, Queda para Pizarro
- `dados-nacionalismo-europeu.json` — Metternich/1815, Primavera dos Povos/1848, Risorgimento, Bismarck, Questao dos Balcas
- `dados-existencialismo.json` — Hegel, Kierkegaard, Nietzsche, Heidegger, Sartre/de Beauvoir
- `dados-movimentos-arte.json` — Romantismo, Impressionismo, Vanguardas, Expressionismo Abstrato, Pop Art
- `dados-capitalismo.json` — Capitalismo Mercantil, Capitalismo Industrial, Monopolios/1929, Keynesianismo, Neoliberalismo
- `dados-descolonizacao-guerras.json` — Bandung, Guerra da Algeria, Guerra do Vietnam, Independencias Africanas, Apartheid/Mandela

### Statistics after v6.3
- Total datasets: 62
- Approximate entities: 480+
- Approximate relations: 420+
- Temporal coverage: -2.700.000 to 2023

---

## v6.2 — 2026-02-21

### Datasets added (10)
- `dados-revolucao-francesa.json` — Ancien Regime, Queda da Bastilha, Terror Jacobino, Napoleao/Brumario
- `dados-guerras-napoleonicas.json` — Napoleao, Bloqueio Continental, Russia 1812, Congresso de Viena, Waterloo
- `dados-independencias-america-latina.json` — Haiti, Bolivar, San Martin, Brasil 1822, Fragmentacao
- `dados-civilizacoes-mediterraneo.json` — Fenicia, Cartago, Persia Aquemenida, Alexandre Magno, Etruscos, Minoicos
- `dados-expansao-isla.json` — Muhammad, Califado Rashidun, Cisma Sunita-Xiita, Abassidas, Expansao Iberia/India, Sufismo
- `dados-russia-czarismo.json` — Rus de Kiev, Ivan o Terrivel, Pedro o Grande, Catarina II, Serfidao, Russificacao
- `dados-reforma-protestante.json` — Lutero, Calvino, Contrarreforma, Guerra dos 30 Anos, Reforma Anglicana
- `dados-filosofia-medieval.json` — Agostinho, Anselmo, Averrois, Aquino, Ockham, Maimonides
- `dados-renascimento-italiano.json` — Florenca/Medicis, Leonardo, Michelangelo, Rafael, Humanismo Literario, Maquiavel
- `dados-imperialismo-colonial.json` — Berlim 1884, Imperio Britanico, Racismo Cientifico, Imperialismo Americano, Resistencias

### Interface
- Removed geographic minimap from sidebar (v6.1 → v6.2 transition)

---

## v6.1 — 2026-02-21

### Interface
- Removed geographic minimap from sidebar
- Sidebar layout corrections

---

## v6.0 — 2026-02-21

### Architecture
- Introduced semantic filter system (filtros-semanticos.html, context.js)
- Added multi-axis filtering: century, region, type, period
- Dataset schema extended with fields: century_start, century_end, region, type, period, importancia
- Trilingual descriptions standardized to 220–280 characters (2–4 rendered lines)

### Datasets added (8)
- `dados-filosofia-antiga.json`
- `dados-revolucao-cientifica.json`
- `dados-iluminismo.json` (expanded)
- `dados-revolucao-industrial.json` (expanded)
- `dados-africa-pre-colonial.json`
- `dados-mongois-asia-central.json`
- `dados-imperio-otomano.json`
- `dados-india-mogol.json`

---

## v5.1 — 2026-02-20

### Datasets added (16 historical periods, Medieval and Early Modern)
- Idade Media Europeia (6 sub-periods: Alta Idade Media, Imperio Carolingio, Feudalismo, Cruzadas, Renascimento Comercial, Crise do Seculo XIV)
- Bizancio Medieval
- Califados Islamicos
- Renascimento Cultural (3 sub-periods: Proto-Renascimento, Alto Renascimento, Maneirismo)
- Reformas Religiosas (3 sub-periods: Reforma Protestante, Contrarreforma, Guerras de Religiao)
- Era Moderna (2 sub-periods: Mercantilismo, Absolutismo)

### Meta-relations
- Cross-dataset causal relations added between medieval and ancient periods

---

## v5.0 — 2026-02-20

### Datasets added (24 historical periods, Antiquity)
- Pre-Historia (5 sub-periods: Paleolitico, Mesolitico, Neolitico, Idade do Bronze, Idade do Ferro)
- Egito Antigo (4 sub-periods: Antigo Imperio, Medio Imperio, Novo Imperio, Periodo Tardio)
- Mesopotamia (5 sub-periods: Sumeria, Babilonia, Assira, Neo-Babilonia, Persia Aquemenida)
- Grecia Antiga (3 sub-periods: Arcaica, Classica, Helenistica)
- Roma Antiga (7 sub-periods: Monarquia, Republica Inicial, Republica Tardia, Augusto, Alto Imperio, Crise, Queda)

### Meta-relations
- 40+ cross-dataset causal relations connecting antiquity periods

---

## v4.6 — 2026-02-19

### Interface
- Fixed invisible click-blocking area in header
- All period names now fully translated in PT/EN/ES
- Visual parity between language modes verified

---

## v4.5 — 2026-02-18

### Datasets
- Added `dados-japao.json`
- Added `dados-china-imperial.json`
- Added `dados-religioes-mundo.json`
- Added `dados-movimentos-sociais.json`
- Added `dados-socialismo-trabalho.json`
- Added `dados-americas-coloniais.json`
- Added `dados-revolucao-russa.json`
- Added `dados-descolonizacao.json`
- Added `dados-pos-guerra-fria.json`
- Added `dados-ciencia-tecnologia.json`

---

## v4.4 — 2026-02-18

### Datasets
- Added Brazil series: `dados-brasil-colonial-inicial.json`, `dados-brasil-colonial-tardio.json`, `dados-brasil-imperio.json`, `dados-brasil-republica.json`
- Added `dados-americas-coloniais.json`
- Added `dados-mesoamerica.json`, `dados-andes.json`
- Added `dados-seculo-xix.json`, `dados-revolucoes-sec18.json`
- Added `dados-entreguerras.json`

---

## v4.2 — 2026-02-16

### Bug fixes
- Fixed critical regression: clicking "Visualizar" no longer discarded already-loaded datasets
- Restored intelligent auto-load on page open when checkboxes are pre-checked
- Corrected checkbox default state persistence across renders

---

## v4.1 — 2026-02-15

### Interface
- Removed redundant "Temas" section; sidebar now has single "Periodos Historicos" section
- Default time range set to -500 to 2000 (covers all datasets at load)
- Filter logic simplified: temporal range only, no tag-based pre-filter

### Bug fixes
- Datasets from multiple simultaneous selections now all appear in graph
- Node count in status bar now reflects merged dataset correctly

---

## v4.0 — 2026-02-15

### Datasets added (8 core datasets)
- `dados-grecia-antiga.json`
- `dados-roma-antiga.json`
- `dados-idade-media-europeia.json`
- `dados-renascimento-cultural.json`
- `dados-navegacoes.json`
- `dados-primeira-guerra.json`
- `dados-segunda-guerra.json`
- `dados-guerra-fria.json`

### Statistics
- Total entities: 118
- Total relations: 91
- Coverage: -500 to 1991 (2491 years)

---

## v3.0 — 2026-02-15

### Architecture
- Removed automatic "related events" generation (context.js disabled)
- Removed `dados.json` monolithic file
- All data now curated manually per dataset file
- Zero synthetic content in graph output

---

## v2.0 — 2026-02-14

### Bug fixes (10 issues resolved)
- Memory leak: global event listeners on window (graph.js)
- Undefined fields producing "NaN (Seculo NaN)" output (graph.js)
- Width/height = 0 with no warning when container hidden (graph.js)
- Duplicate event listeners in main.js
- Duplicate "Contexto" label in info panel (graph.js)
- Napoleonic campaigns not processed (data.js)
- Quadtree silent failure without log (graph.js)
- Inconsistent innerHTML usage (graph.js)
- AbortController created but abort() never called (data.js)
- Language selector CSS visual artifacts (base.css)

### Interface
- Header CSS fully rewritten
- Memory leaks eliminated

---

## v1.0 — 2026-02-14

Initial release.
- Force-directed graph with D3.js v7
- SVG/Canvas adaptive rendering
- PT/EN/ES internationalization
- 2 datasets: Revolucao Francesa, Era Napoleonica
- Known bugs: 10 (resolved in v2.0)
