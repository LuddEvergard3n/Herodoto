// Paleta expandida de 30+ cores distintas para evitar repetições
export const PALETA_CORES = [
  '#e74c3c', // vermelho vibrante
  '#3498db', // azul royal
  '#2ecc71', // verde esmeralda
  '#f39c12', // laranja dourado
  '#9b59b6', // roxo
  '#1abc9c', // turquesa
  '#e67e22', // laranja queimado
  '#34495e', // azul marinho
  '#f1c40f', // amarelo
  '#16a085', // verde água escuro
  '#c0392b', // vermelho escuro
  '#8e44ad', // roxo escuro
  '#2980b9', // azul médio
  '#27ae60', // verde médio
  '#d35400', // laranja escuro
  '#2c3e50', // azul aço
  '#95a5a6', // cinza médio
  '#7f8c8d', // cinza escuro
  '#ecf0f1', // cinza claro (não usar)
  '#e84393', // rosa magenta
  '#fd79a8', // rosa claro
  '#6c5ce7', // índigo
  '#a29bfe', // lavanda
  '#00b894', // verde menta
  '#00cec9', // cyan
  '#0984e3', // azul dodger
  '#74b9ff', // azul céu
  '#fdcb6e', // amarelo pastel
  '#e17055', // terracota
  '#d63031', // vermelho tijolo
  '#fab1a0', // pêssego
  '#ff7675', // coral
  '#fd79a8', // rosa flamingo
  '#fdcb6e', // mel
  '#ffeaa7', // creme
  '#55efc4', // menta claro
  '#81ecec', // água marinha
  '#a29bfe', // violeta
  '#dfe6e9', // cinza gelo
  '#b2bec3'  // cinza azulado
];

// Cores por tipo (fallback se não houver cor única) — pigmentos históricos
export const CORES = {
  conceito:  '#2b4b7e',   // azul lápis-lazúli
  estrutura: '#a0622a',   // ocre queimado
  periodo:   '#7a6228',   // sépia
  conflito:  '#8b2e1a',   // cinábrio
  evento:    '#5c2d6e'    // púrpura
};

// Gera cor única baseada no ID da entidade
export function getCorPorId(id, tipo) {
  if (!id) return CORES[tipo] || '#95a5a6';
  
  // Hash simples do ID para índice na paleta
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % PALETA_CORES.length;
  return PALETA_CORES[index];
}

export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
