# Orion — Interactive Historical Visualization System

Version: 6.7
Status: Active development
Datasets: 93
Approximate entities: 700+
Approximate relations: 600+
Temporal coverage: -4.200.000 to 2023

---

## Quick Start

### Requirements

- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Local HTTP server (required — `file://` protocol blocks ES module imports and JSON fetch)

### Startup

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Open `http://localhost:8000` in the browser.

---

## Project Structure

```
orion-final/
├── index.html                 # Entry point and sidebar markup
├── README.md                  # This file
├── CHANGELOG.md               # Full version history
├── css/
│   ├── base.css               # Layout, header, sidebar shell
│   └── components.css         # Filter groups, panel, badges
├── js/
│   ├── main.js                # Orchestrator, event listeners
│   ├── graph.js               # D3.js force simulation and rendering
│   ├── data.js                # Dataset loading and merging
│   ├── i18n.js                # Translation system
│   ├── utils.js               # Color helpers, formatters
│   └── context.js             # Context generator (disabled)
└── data/
    └── dados-*.json           # 62 dataset files
```

---

## Dataset Organization

Datasets are grouped in the sidebar in the following order:

1. Pre-Historia e Evolucao Humana (universal — not tied to a continent)
2. Europa
3. Asia
4. Africa
5. Oriente Medio
6. America do Norte
7. America Central
8. America do Sul
9. Antartica (no datasets currently)

The "Continentes" filter in the semantic filter panel has been removed; continent-based organization in the dataset list makes it redundant.

---

## Dataset Format

All datasets follow this JSON schema:

```json
{
  "entidades": [
    {
      "id": "prefix-001",
      "nome": "Portuguese name",
      "nome_en": "English name",
      "nome_es": "Spanish name",
      "tipo": "periodo",
      "descricao": "PT description (220-280 chars)",
      "descricao_en": "EN description (220-280 chars)",
      "descricao_es": "ES description (220-280 chars)",
      "inicio": 1789,
      "fim": 1799,
      "tags": ["tag1", "tag2"],
      "importancia": "Why this entity matters historically",
      "century_start": 18,
      "century_end": 18,
      "region": "Europe",
      "type": "political",
      "period": "EarlyModern"
    }
  ],
  "relacoes": [
    {
      "origem": "prefix-001",
      "destino": "prefix-002",
      "tipo": "causalidade",
      "intensidade": 0.9,
      "descricao": "Relationship description"
    }
  ]
}
```

### Field reference

**Entity fields**

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier, format `prefix-NNN` |
| nome / nome_en / nome_es | string | Trilingual name |
| tipo | string | One of: `conceito`, `estrutura`, `periodo`, `conflito`, `evento` |
| descricao / _en / _es | string | Trilingual description, 220-280 characters |
| inicio / fim | integer | Year (negative = BC) |
| tags | array | Thematic keywords |
| importancia | string | Summary of historical significance |
| century_start / century_end | integer | Century numbers (negative = BC, e.g. -5 = 5th century BC) |
| region | string | See region values below |
| type | string | See type values below |
| period | string | See period values below |

**Relation fields**

| Field | Type | Description |
|---|---|---|
| origem / destino | string | Entity IDs |
| tipo | string | One of: `causalidade`, `influencia`, `tensao`, `contemporaneo` |
| intensidade | float | 0.5-1.0 |
| descricao | string | Relation description |

**Controlled vocabulary**

region values: `Europe`, `Africa`, `MiddleEast`, `SouthAsia`, `SoutheastAsia`, `EastAsia`, `Mesoamerica`, `SouthAmerica`, `NorthAmerica`, `Americas`, `Global`, `Multiple`

type values: `political`, `war`, `economic`, `cultural`, `religious`, `social`, `technological`, `intellectual`

period values: `Ancient`, `Medieval`, `EarlyModern`, `Modern`, `Contemporary`

---

## Adding a New Dataset

1. Create `data/dados-<name>.json` following the schema above.
2. Add a checkbox entry in `index.html` inside the appropriate continent section:

```html
<label class="checkbox-label">
  <input type="checkbox" class="dataset" value="data/dados-<name>.json">
  <span>Display Name</span>
</label>
```

3. Update `CHANGELOG.md` under the current version entry.
4. Update this README: increment dataset count and entity/relation approximations in the header block.

---

## Architecture

### Module loading order

```
main.js
  data.js       -- fetch + merge JSON datasets
  graph.js      -- D3 force simulation, SVG/Canvas render
    i18n.js     -- translate node labels and panel text
    utils.js    -- color map, date formatters
```

### Rendering modes

| Node count | Mode | Labels |
|---|---|---|
| < 800 | SVG | Visible |
| >= 800 | Canvas | Hidden |
| Any | Performance mode (manual) | Hidden, reduced physics |

Performance mode is toggled via the sidebar checkbox. It reduces node radius, repulsion force, and alpha decay rate.

### Data flow

1. User selects dataset checkboxes and clicks "Visualizar"
2. `data.js` fetches all checked JSON files in parallel via `Promise.all`
3. Entities and relations are merged into a single graph object
4. Active filters (temporal range, century, region, type) are applied
5. `graph.js` initializes or restarts the D3 force simulation with filtered data
6. On node click, the info panel renders name, type, description, period, tags, and importancia in the active language

### i18n system

Language is selected via the header dropdown (PT / EN / ES). `i18n.js` replaces all `data-i18n` attribute targets and re-renders node labels and panel content. Default language is Portuguese.

### Filter system

Filters operate on the merged dataset before passing nodes to D3:

- Temporal range: `inicio` / `fim` fields, supports negative years
- Century: `century_start` / `century_end` fields
- Region: `region` field
- Type: `type` field
- Period: `period` field

Checked values within the same filter dimension use OR logic. Different dimensions use AND logic.

---

## Performance

| Nodes | Mode | Typical FPS | Init time | Memory |
|---|---|---|---|---|
| 10-50 | SVG | 60 | < 200ms | ~20 MB |
| 100 | SVG | 45-60 | < 500ms | ~40 MB |
| 500 | SVG | 20-30 | 1-2s | ~150 MB |
| 800+ | Canvas auto | 60 | 2-3s | ~200 MB |

For sessions with 500+ nodes, enabling performance mode is recommended.

---

## Troubleshooting

**Graph does not render**
Cause: opened via `file://` protocol.
Fix: serve with a local HTTP server.

**"2 entidades, 0 relacoes" in status bar**
Cause: stale dataset files or browser cache.
Fix: hard reload (Ctrl+Shift+R) after replacing data files.

**CORS error in console**
Cause: same as above.
Fix: use HTTP server.

**Few nodes visible despite many datasets checked**
Cause: temporal range filter excludes most entities.
Fix: set range to -3000 / 2100 and verify all region/type checkboxes are checked.

**Nodes appear but info panel shows no text**
Cause: `descricao` field missing or empty in the dataset.
Fix: verify all three description fields are populated in the JSON file.

---

## Checklist for New Datasets

- Valid JSON (`python -m json.tool dados-x.json`)
- Minimum 4 entities
- All three language fields populated for nome and descricao
- Description length 220-280 characters per language
- `importancia` field present and non-empty
- `century_start`, `century_end`, `region`, `type`, `period` fields present
- `inicio` and `fim` as integers (negative for BC)
- ID prefix unique across all existing datasets
- At least 2 relations defined
- Checkbox entry added to `index.html` under the correct continent section
- `CHANGELOG.md` updated
- README dataset count and entity approximation updated

---

## Dependencies

- D3.js v7 (loaded from CDN, BSD-3-Clause license)
- Google Fonts, Cormorant Garamond (loaded from CDN)
- No build step, no bundler, no npm packages required

---

## License

Educational open-source project.
D3.js: BSD-3-Clause.
Historical content compiled from public academic sources.
