/**
 * Rejects malformed or repetitive model output before it reaches the learner.
 * This complements factual grounding; it does not judge historical accuracy.
 */
export function isDegenerateText(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length < 20 || text.includes('\uFFFD')) return true;

  const words = text.match(/[\p{L}\p{N}]+/gu) || [];
  if (text.length > 80 && words.length < 6) return true;
  if (words.some(word => word.length > 45)) return true;
  if (/(.{3,18})\1{3,}/iu.test(text)) return true;

  if (words.length >= 12) {
    const normalized = words.map(word => word.toLocaleLowerCase('pt-BR'));
    const counts = new Map();
    normalized.forEach(word => counts.set(word, (counts.get(word) || 0) + 1));
    const uniqueRatio = new Set(normalized).size / normalized.length;
    const mostRepeated = Math.max(...counts.values());
    if (uniqueRatio < 0.28 || mostRepeated > Math.max(4, normalized.length * 0.25)) return true;
  }

  return false;
}
