# PWA e Service Worker — Documentação

**Ficheiros:** `sw.js`, `manifest.json`  
**Versão:** Heródoto v7.43  
**Cache atual:** `herodoto-v7-40`

---

## Visão Geral

O Heródoto é uma **Progressive Web App (PWA)** completa, instalável e utilizável offline após a primeira visita. O Service Worker implementa uma estratégia de cache dupla:

- **Cache-First** para assets estáticos (HTML, CSS, JS, imagens, ícones)
- **Network-First** para dados dinâmicos (`data/*.json`)

---

## Ficheiros

### `manifest.json`

Define os metadados da app instalável:

```json
{
  "name": "Heródoto",
  "short_name": "Heródoto",
  "start_url": "./",
  "display": "standalone",
  "theme_color": "#2a1e0f",
  "background_color": "#a89070",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon.svg",     "sizes": "any",     "type": "image/svg+xml", "purpose": "maskable" }
  ]
}
```

### `sw.js`

Service Worker com duas caches separadas:

| Cache | Nome | Estratégia |
|---|---|---|
| Assets estáticos | `herodoto-v7-40-static` | Cache-First |
| Dados JSON | `herodoto-v7-40-data` | Network-First |

---

## Estratégias de Cache

### Cache-First (assets estáticos)

```
Pedido → Cache?
  Sim → Retorna do cache
  Não → Fetch rede → Guarda no cache → Retorna
```

Aplicado a: `index.html`, `*.css`, `*.js`, `assets/`, `icons/`, páginas auxiliares.

### Network-First (dados JSON)

```
Pedido → Fetch rede
  Sucesso → Guarda no cache → Retorna
  Falha   → Cache?
    Sim → Retorna do cache (modo offline)
    Não → Erro
```

Aplicado a: todos os pedidos `data/*.json`. Garante que o utilizador vê sempre os dados mais recentes quando online, mas mantém a funcionalidade offline.

---

## Assets Pré-Cacheados na Instalação

```js
const STATIC_ASSETS = [
  './',
  './index.html',
  './fontes.html',
  './guia-professor.html',
  './sobre.html',
  './ajuda.html',
  './plano-aula.html',
  './css/base.css',
  './css/components.css',
  './assets/pergaminho.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];
```

> Fontes do Google (Google Fonts) são cacheadas dinamicamente na primeira utilização quando online.

---

## Ciclo de Vida do Service Worker

### Instalação (`install`)
- Abre a cache estática
- Pré-cacheia todos os `STATIC_ASSETS`
- Chama `self.skipWaiting()` para ativação imediata

### Ativação (`activate`)
- Apaga caches com versões antigas (diferente de `CACHE_VERSION`)
- Chama `self.clients.claim()` para controlar tabs existentes imediatamente

### Fetch (`fetch`)
- Interceta todos os pedidos
- Redireciona para Cache-First ou Network-First conforme o tipo de recurso

---

## Atualização de Versão

**Quando atualizar `CACHE_VERSION`:**
- Sempre que modificar ficheiros em `css/`, `js/`, `assets/`, ou qualquer HTML
- Não é necessário atualizar para novos ficheiros `data/*.json` (são Network-First)

**Como atualizar:**
```js
// sw.js, linha 1:
const CACHE_VERSION = 'herodoto-v7-XX'; // incrementar XX
```

Ao fazer deploy com nova versão, o browser deteta o SW modificado, instala a nova versão em background, e na próxima visita ativa a nova cache (apagando a antiga automaticamente).

---

## Registo do Service Worker

Feito em `main.js` via:
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
```

---

## Diagnóstico Offline

Para testar o modo offline no Chrome:
1. DevTools → Application → Service Workers → verificar que está registado e ativo
2. DevTools → Network → selecionar "Offline"
3. Recarregar a página — deve funcionar com os dados previamente cacheados

Para forçar re-cache:
1. DevTools → Application → Storage → "Clear site data"
2. Recarregar para reconstruir o cache

---

## Ícones

| Ficheiro | Dimensões | Uso |
|---|---|---|
| `icons/icon-192.png` | 192×192 | Ícone de app Android / PWA |
| `icons/icon-512.png` | 512×512 | Splash screen e stores |
| `icons/icon.svg` | Vetorial | Favicon, maskable, alta resolução |
