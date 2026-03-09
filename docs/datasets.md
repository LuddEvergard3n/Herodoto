# Datasets e Estrutura de Dados JSON — Documentação

**Diretório:** `data/`  
**Módulo de carregamento:** `js/data.js`  
**Versão:** Heródoto v7.43

---

## Visão Geral

O Heródoto contém **306 datasets JSON** organizados por continente e subgrupo, cobrindo da Pré-História ao século XXI. Cada dataset é um ficheiro `.json` autónomo carregado via `fetch()` sob demanda quando o utilizador seleciona o checkbox correspondente.

**Total:** 2.644 entidades históricas (incluindo personagens).

---

## Estrutura de um Dataset

```json
{
  "periodo": "Grécia Antiga",
  "entidades": [
    {
      "id": "ga_democracia",
      "nome": "Democracia Ateniense",
      "nome_en": "Athenian Democracy",
      "nome_es": "Democracia Ateniense",
      "tipo": "political",
      "ano_inicio": -508,
      "ano_fim": -322,
      "seculo": -5,
      "continente": "europa",
      "importancia": 5,
      "descricao": "Sistema político criado por Clístenes...",
      "descricao_en": "Political system created by Cleisthenes...",
      "descricao_es": "Sistema político creado por Clístenes...",
      "contexto": "Surgiu como resposta à tirania...",
      "contexto_en": "Emerged as a response to tyranny...",
      "contexto_es": "Surgió como respuesta a la tiranía..."
    }
  ],
  "relacoes": [
    {
      "origem": "ga_democracia",
      "destino": "ga_reformas_clistenes",
      "tipo": "causal"
    }
  ]
}
```

---

## Campos de Entidade

### Obrigatórios

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Identificador único dentro do dataset (convenção: `prefixo_nome`) |
| `nome` | `string` | Nome em português |
| `tipo` | `string` | Tipo historiográfico (ver tabela abaixo) |
| `descricao` | `string` | Descrição em português |

### Recomendados

| Campo | Tipo | Descrição |
|---|---|---|
| `nome_en` | `string` | Nome em inglês |
| `nome_es` | `string` | Nome em espanhol |
| `descricao_en` | `string` | Descrição em inglês |
| `descricao_es` | `string` | Descrição em espanhol |
| `ano_inicio` | `number` | Ano de início (negativo = a.C.) |
| `ano_fim` | `number` | Ano de fim |
| `seculo` | `number` | Século (negativo = a.C.; ex.: `-5` = séc. V a.C.) |
| `continente` | `string` | Região geográfica (ver lista abaixo) |
| `importancia` | `number` | Peso relativo do nó no grafo (1–5) |

### Opcionais

| Campo | Tipo | Descrição |
|---|---|---|
| `contexto` | `string` | Contexto histórico expandido (PT) |
| `contexto_en` | `string` | Contexto em inglês |
| `contexto_es` | `string` | Contexto em espanhol |
| `importancia_texto` | `string` | Texto explicativo da importância (PT) |
| `importancia_texto_en` | `string` | Texto explicativo em inglês |
| `importancia_texto_es` | `string` | Texto explicativo em espanhol |

---

## Tipos de Entidade

A classificação de tipo deve ser **historiograficamente precisa** e nunca automatizada por palavras-chave.

| Valor | Significado | Exemplos |
|---|---|---|
| `war` | Conflito armado | Guerras Púnicas, Batalha de Waterloo |
| `political` | Sistema ou evento político | Democracia Ateniense, Revolução Francesa |
| `economic` | Processo económico | Mercantilismo, Crise de 1929 |
| `cultural` | Produção cultural e artística | Renascimento, Romantismo |
| `religious` | Fenómeno religioso | Reforma Protestante, Islamização |
| `technological` | Inovação técnica | Imprensa de Gutenberg, Bomba Atómica |
| `social` | Movimento ou estrutura social | Nazismo, Abolicionismo, Feudalismo |
| `intellectual` | Pensamento filosófico ou científico | Iluminismo, Positivismo |
| `person` | Personalidade histórica | Napoleão, Cleópatra |

> **Regra de ouro:** classificar pelo *impacto historiográfico primário*, não pelo evento desencadeador. Ex.: o Holocausto é `social`; as bombas de Hiroshima são `technological`; a Revolução Francesa é `political`.

---

## Campos de Relação

```json
{
  "origem": "id_entidade_a",
  "destino": "id_entidade_b",
  "tipo": "causal | sequencial | tematica"
}
```

| Tipo | Descrição |
|---|---|
| `causal` | A originou B diretamente |
| `sequencial` | A precedeu B cronologicamente no mesmo contexto |
| `tematica` | A e B partilham tema ou contexto mas sem relação direta |

---

## Valores de `continente`

| Valor | Região |
|---|---|
| `europa` | Europa |
| `americas` | Américas (Norte, Central e Sul) |
| `africa` | África |
| `asia` | Ásia |
| `oceania` | Oceânia |
| `oriente_medio` | Oriente Médio |
| `global` | Fenómeno de alcance mundial |

---

## Organização dos Ficheiros

Os datasets são organizados no painel de seleção por continente e subgrupo cronológico:

```
data/
├── dados-grecia-antiga.json
├── dados-grecia-helenismo.json
├── dados-roma-antiga.json
├── dados-medieval-feudalismo.json
├── dados-renascimento-italia.json
├── dados-renascimento-norte.json
├── dados-revolucao-francesa.json
├── dados-brasil-colonial-inicial.json
├── ... (306 ficheiros total)
```

Convenção de nomenclatura: `dados-[região/período]-[subgrupo].json`

---

## Módulo `data.js`

### Funções exportadas

```js
import { carregarDadosSelecionados, filterData, getDataExtents } from './data.js';
```

| Função | Descrição |
|---|---|
| `carregarDadosSelecionados()` | Lê os checkboxes `.dataset:checked`, faz fetch de cada JSON e normaliza os dados; retorna `{ entidades, relacoes }` |
| `filterData(dados, filtros)` | Aplica filtros semânticos aos dados carregados |
| `getDataExtents(entidades)` | Retorna `{ minAno, maxAno }` para configurar a escala da timeline |

### Gestão de fetches concorrentes

`data.js` usa `AbortController` para cancelar fetches anteriores quando o utilizador altera a seleção de datasets antes do carregamento terminar (fix #10):

```js
let currentFetchControllers = [];
// Cada nova chamada cancela os fetches anteriores
currentFetchControllers.forEach(ctrl => ctrl.abort());
```

---

## Adição de um Novo Dataset

1. Criar `data/dados-[nome].json` seguindo o schema acima
2. Validar com: `python3 -c "import json; json.load(open('data/dados-[nome].json'))"`
3. Adicionar o checkbox no `index.html` no grupo continente/período correto:
   ```html
   <label class="checkbox-label">
     <input type="checkbox" class="dataset" value="data/dados-[nome].json">
     <span>Descrição legível do dataset</span>
   </label>
   ```
4. Verificar que todos os `id` são únicos dentro do ficheiro e não colidem com outros datasets carregados simultaneamente

---

## Validação em Massa

Script de verificação de todos os JSONs:
```bash
python3 -c "
import json, os
erros = []
for f in sorted(os.listdir('data')):
    if f.endswith('.json'):
        try: json.load(open(f'data/{f}', encoding='utf-8'))
        except Exception as e: erros.append((f, str(e)))
print(f'{len(erros)} erros' if erros else 'Todos os JSONs válidos')
for f, e in erros: print(f'  {f}: {e}')
"
```
