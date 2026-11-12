// Біблія Огієнка: завантаження і доступ до віршів.
// Формат ogienko.json: { books: [{ name, chapters: [[вірш1, вірш2, …], …] }] }

export function makeBible(data) {
  const books = data.books;
  return {
    data,
    books,
    chapterCount: (b) => books[b]?.chapters.length || 0,
    verseCount: (b, c) => books[b]?.chapters[c - 1]?.length || 0,
    /** Текст вірша (або діапазону). Якщо у виданні вірш об'єднано з попереднім — повертаємо попередній. */
    text(b, c, v, ve) {
      const ch = books[b]?.chapters[c - 1];
      if (!ch) return '';
      const from = v || 1, to = ve || v || 1;
      const parts = [];
      for (let k = from; k <= to; k++) {
        let t = ch[k - 1] || '';
        if (!t && k > 1) t = ch[k - 2] || '';
        if (t && parts[parts.length - 1] !== t) parts.push(t);
      }
      return parts.join(' ');
    },
  };
}

export async function loadBible(url = './ogienko.json') {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Не вдалося завантажити текст Біблії');
  return makeBible(await res.json());
}
