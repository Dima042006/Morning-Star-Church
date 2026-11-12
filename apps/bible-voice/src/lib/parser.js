// Пошук посилань на Біблію в розпізнаному мовленні.
// «Івана три шістнадцять», «до Римлян, восьмий розділ, двадцять восьмий вірш»,
// «перше послання до коринтян тринадцять чотири», «двадцять третій псалом», «Івана 3:16»,
// «Івана 316» (Chrome інколи склеює «3:16» в одне число).

import { BOOKS, NUMBERED, SINGLE_CHAPTER, BOOK_INDEX } from './books.js';
import { foldNumbers } from './numbers.js';

export function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[́]/g, '')
    .replace(/[’'ʼ`´]/g, '')
    .replace(/ё/g, 'е')
    .replace(/(\d)\s*[-–—]\s*(\d)/g, '$1 по $2')     // «16-18» → «16 по 18»
    .replace(/(\d)\s*[:.,]\s*(\d)/g, '$1 $2')        // «3:16» → «3 16»
    .replace(/[^a-zа-яіїєґ0-9]+/gi, ' ')
    .trim();
}

const matchStem = (word, stem) => (stem.length >= 5 ? word.startsWith(stem) : word === stem);

// слова, які можуть стояти між номером книги і назвою: «перше послання апостола Павла до коринтян»
const BOOK_PREFIX_FILLER = new Set(['послання', 'посланні', 'послань', 'соборне', 'соборному', 'апостола',
  'апостол', 'павла', 'святого', 'до', 'від', 'книга', 'книзі', 'книги', 'книгу', 'в', 'у', 'з', 'із', 'євангеліє',
  'євангелії', 'євангелія', 'евангелие', 'від', 'пророка', 'пророк', 'петра', 'івана']);
// слова між назвою книги і числами
const REF_FILLER = new Set(['розділ', 'розділі', 'розділу', 'розділом', 'глава', 'главі', 'глави', 'главу', 'гл',
  'вірш', 'вірші', 'віршах', 'вірша', 'віршу', 'вірш', 'вiрш', 'стих', 'стихи', 'стиха', 'ст',
  'з', 'із', 'зі', 'і', 'й', 'та', 'в', 'у', 'на', 'а', 'це', 'то', 'там', 'читаємо', 'написано', 'сказано',
  'кома', 'двокрапка', 'апостола', 'павла', 'послання', 'книги', 'книзі', 'пророка', 'до', 'від',
  'святе', 'святого', 'євангелія', 'євангеліє']);
const CHAPTER_WORD = /^(розділ|глав|гл$)/;
const VERSE_WORD = /^(вірш|вiрш|стих|ст$)/;
const RANGE_WORD = new Set(['по', 'до']);

/** Яка книга починається зі слова words[i]? → { book, len } або null */
function bookAt(words, i) {
  // кілька слів підряд
  for (let b = 0; b < BOOKS.length; b++) {
    for (const ph of BOOKS[b].phrases || []) {
      const parts = ph.replace(/[’'ʼ]/g, '').split(' ');
      if (parts.every((p, k) => words[i + k] && (k === parts.length - 1 ? matchStem(words[i + k], p) || words[i + k].startsWith(p.slice(0, -1)) : words[i + k] === p)))
        return { book: b, len: parts.length };
    }
  }
  const w = words[i];
  for (const [base, stems] of Object.entries(NUMBERED))
    if (stems.some((s) => matchStem(w, s))) return { numbered: base, len: 1, word: w };
  for (let b = 0; b < BOOKS.length; b++)
    if ((BOOKS[b].stems || []).some((s) => matchStem(w, s))) return { book: b, len: 1 };
  return null;
}

/** Номер книги (1/2/3) зі слів перед назвою. */
function numberBefore(tokens, idx) {
  for (let k = idx - 1, steps = 0; k >= 0 && steps < 7; k--, steps++) {   // «друге послання апостола Павла до солунян»
    const t = tokens[k];
    if (t.num !== undefined) return t.num >= 1 && t.num <= 4 ? { n: t.num, at: k } : null;
    if (!BOOK_PREFIX_FILLER.has(t.word)) return null;
  }
  return null;
}

function resolveNumbered(base, n, word) {
  if (base === 'sam' && word.startsWith('царств')) {      // синодальні 1–4 Царств
    if (n === 3 || n === 4) return BOOK_INDEX[`${n - 2} Царів`];
    return BOOK_INDEX[`${n || 1} Самуїлова`];
  }
  if (base === 'john') return n >= 1 && n <= 3 ? BOOK_INDEX[`${n} Івана`] : BOOK_INDEX['Івана'];
  const name = BOOKS.find((b) => b.numbered === base && b.n === (n || 1));
  return name ? BOOK_INDEX[name.name] : null;
}

/**
 * Знаходить усі посилання в тексті.
 * bible — { chapterCount(book), verseCount(book, chapter) } для перевірки, що такий вірш існує.
 * Повертає [{ book, chapter, verse, verseEnd, label, confidence, from, to }].
 */
export function findReferences(text, bible) {
  const words = normalize(text).split(' ').filter(Boolean);
  const tokens = foldNumbers(words);
  const tw = tokens.map((t) => t.word);
  const refs = [];

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].num !== undefined) continue;
    const hit = bookAt(tw, i);
    if (!hit) continue;
    let book = hit.book, start = i;
    if (hit.numbered) {
      const nb = numberBefore(tokens, i);
      book = resolveNumbered(hit.numbered, nb ? nb.n : 0, hit.word);
      if (book == null) continue;
      if (nb) start = nb.at;
    } else if (BOOKS[book].name.match(/^\d/)) {
      continue;
    }
    // числа після назви
    const nums = [];
    let j = i + hit.len, lastMarker = null, sawRange = false;
    for (let steps = 0; j < tokens.length && steps < 8 && nums.length < 3; j++, steps++) {
      const t = tokens[j];
      if (t.num !== undefined) { nums.push({ n: t.num, marker: lastMarker, range: sawRange }); lastMarker = null; sawRange = false; continue; }
      if (CHAPTER_WORD.test(t.word)) { if (nums.length && !nums[nums.length - 1].marker) nums[nums.length - 1].after = 'ch'; lastMarker = 'ch'; continue; }
      if (VERSE_WORD.test(t.word)) { if (nums.length && !nums[nums.length - 1].marker) nums[nums.length - 1].after = 'v'; lastMarker = 'v'; continue; }
      if (RANGE_WORD.has(t.word) && nums.length) { sawRange = true; continue; }
      if (REF_FILLER.has(t.word)) continue;
      break;
    }
    // «двадцять третій псалом» — число перед назвою
    const before = [];
    if (BOOKS[book].name === 'Псалми' && i > 0 && tokens[i - 1].num !== undefined) {
      before.push({ n: tokens[i - 1].num });
      start = i - 1;
    }
    const all = before.concat(nums);
    const ref = interpret(book, all, bible);
    if (!ref) continue;
    if (BOOKS[book].weak && ref.verse == null) continue;
    ref.from = tokens[start].from;
    ref.to = tokens[Math.max(i + hit.len - 1, j - 1)].to;
    refs.push(ref);
    i = Math.max(i, j - 1);
  }
  return refs;
}

// «Йоіла 2:28» (синодальна/англ. нумерація) = «Йоіла 3:1» в Огієнка
const ALT_NUMBERING = {
  'Йоіла 2': { from: 28, ch: 3 },
};

function interpret(book, nums, bible) {
  if (!nums.length) return null;
  const single = SINGLE_CHAPTER.has(BOOKS[book].name);
  // хто розділ, хто вірш — за словами «розділ»/«вірш», якщо вони були
  let ch = null, vs = [];
  for (const x of nums) {
    const role = x.marker || x.after;
    if (role === 'ch' && ch == null) ch = x.n;
    else if (role === 'v') vs.push(x);
    else if (x.range && vs.length) vs.push(x);
    else if (ch == null && !single) ch = x.n;
    else vs.push(x);
  }
  if (single) {                                  // «Юди 3» — це вірш 3; «Юди 1 3» — теж вірш 3
    const marked = nums.filter((x) => (x.marker || x.after) !== 'ch');
    vs = marked.length > 1 && marked[0].n === 1 ? marked.slice(1) : marked;
    ch = 1;
  }
  let verse = vs[0] ? vs[0].n : null;
  let verseEnd = vs[1] && vs[1].n > verse ? vs[1].n : null;

  const make = (c, v, ve, confidence) => {
    if (!(c >= 1 && c <= bible.chapterCount(book))) return null;
    if (v != null && !(v >= 1 && v <= bible.verseCount(book, c))) return null;
    if (ve != null && !(ve > v && ve <= bible.verseCount(book, c))) ve = null;
    const name = BOOKS[book].name;
    const label = v == null ? (name === 'Псалми' ? `Псалом ${c}` : `${name} ${c}`) :
      `${name === 'Псалми' ? 'Псалом' : name} ${c}:${v}${ve ? '–' + ve : ''}`;
    return { book, bookName: name, chapter: c, verse: v, verseEnd: ve, label, confidence };
  };

  // поширені посилання за іншою (синодальною/англійською) нумерацією → нумерація Огієнка
  const alt = ALT_NUMBERING[`${BOOKS[book].name} ${ch}`];
  if (alt && verse != null && verse >= alt.from) {
    const r = make(alt.ch, verse - alt.from + 1, verseEnd ? verseEnd - alt.from + 1 : null, 0.85);
    if (r && !make(ch, verse, null, 1)) return r;
  }
  let ref = make(ch, verse, verseEnd, verse == null ? 0.6 : 0.95);
  if (ref) return ref;
  // «Івана 316» → 3:16 (або 31:6); беремо перший варіант, що існує
  if (verse == null && ch >= 10) {
    const s = String(ch);
    for (let k = 1; k < s.length; k++) {
      if (s[k] === '0') continue;
      ref = make(Number(s.slice(0, k)), Number(s.slice(k)), null, 0.75);
      if (ref) return ref;
    }
  }
  // «Івана 3 162»? — вірш склеївся з наступним числом: пробуємо обрізати (лише тризначні)
  if (verse != null && verse >= 100) {
    const s = String(verse);
    for (let k = s.length - 1; k >= 1; k--) {
      ref = make(ch, Number(s.slice(0, k)), null, 0.6);
      if (ref) return ref;
    }
  }
  return make(ch, null, null, 0.5);
}
