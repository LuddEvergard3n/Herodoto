// Context generator - DESABILITADO
// Dados devem vir completos dos arquivos JSON
// NÃO gera eventos relacionados fake

export function ensureEntityContext(entity) {
  if (!entity) return;
  if (!Array.isArray(entity.tags)) {
    entity.tags = [];
  }
}

export function generateContextForEntities(entities) {
  if (!Array.isArray(entities)) return;
  // Não gera contexto automático
}
