// Пошук вірша за словами: «так бо Бог полюбив світ» → Івана 3:16.
// Слова порівнюються за початком (перші 5 літер), щоб «полюбив/полюбила» вважались одним словом.

import { normalize } from './parser.js';

const STOP = new Set(['і', 'й', 'та', 'а', 'але', 'що', 'як', 'бо', 'в', 'у', 'на', 'з', 'із', 'до', 'від', 'не', 'ні',
  'він', 'вона', 'вони', 'ми', 'ви', 'я', 'ти', 'це', 'той', 'та', 'то', 'же', 'ж', 'його', 'її', 'їх', 'мене', 'тебе',
  'для', 'по', 'за', 'під', 'над', 'при', 'про', 'хто', 'кожен', 'так', 'усе', 'все', 'вас', 'нас']);
const key = (w) => w.slice(0, 5);
const keysOf = (text) => normalize(text).split(' ').filter((w) => w.length > 2 && !STOP.has(w)).map(key);

export function makeSearch(bible) {
  const index = new Map();          // ключ слова -> [id вірша]
  const refs = [];                  // id -> [книга, розділ, вірш]
  bible.books.forEach((b, bi) => b.chapters.forEach((ch, ci) => ch.forEach((t, vi) => {
    if (!t) return;
    const id = refs.push([bi, ci + 1, vi + 1]) - 1;
    for (const k of new Set(keysOf(t))) {
      let list = index.get(k);
      if (!list) index.set(k, (list = []));
      list.push(id);
    }
  })));

  return function search(query, limit = 6) {
    const q = [...new Set(keysOf(query))];
    if (q.length < 2) return [];
    const score = new Map();
    for (const k of q) for (const id of index.get(k) || []) score.set(id, (score.get(id) || 0) + 1);
    return [...score.entries()]
      .map(([id, n]) => ({ id, n }))
      .filter((x) => x.n / q.length >= 0.5)
      .sort((a, b) => b.n - a.n || a.id - b.id)
      .slice(0, limit)
      .map(({ id, n }) => {
        const [book, chapter, verse] = refs[id];
        return { book, chapter, verse, confidence: n / q.length };
      });
  };
}
