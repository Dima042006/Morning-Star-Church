// ШІ-помічник: надсилає останні речення проповіді в Gemini (через наш Google Apps Script,
// де лежить ключ Gemini) і отримує посилання на вірші.
import { BOOKS, BOOK_INDEX } from './books.js';

// той самий бекенд, що й у Стандартизатора (ключ доступу спільний — той самий сайт)
const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbyHPGCsWbZCiMpaxn32OP5cHgY7oBw4P6-HbGHv9PSSAVHF2x2TStb0_r9RlJJ2XOYz/exec';
const NAMES = BOOKS.map((b) => b.name);

const ls = (k) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
export const aiConfig = () => ({ key: ls('apiKey'), url: ls('apiUrl') || DEFAULT_API_URL, enabled: ls('bv-ai') !== 'off' });
export const setAiKey = (k) => { try { localStorage.setItem('apiKey', k.trim()); } catch {} };
export const setAiEnabled = (on) => { try { localStorage.setItem('bv-ai', on ? 'on' : 'off'); } catch {} };

/** Посилання з адреси: ...bible/#key=...&api=... (як у Стандартизатора) */
export function readKeyFromHash() {
  const h = location.hash;
  const k = h.match(/key=([^&]+)/), a = h.match(/api=([^&]+)/);
  try {
    if (k) localStorage.setItem('apiKey', decodeURIComponent(k[1]));
    if (a) {
      const v = decodeURIComponent(a[1]);
      localStorage.setItem('apiUrl', v.startsWith('http') ? v : `https://script.google.com/macros/s/${v}/exec`);
    }
  } catch {}
  if (k || a) history.replaceState(null, '', location.pathname + location.search);
}

/** → [{ book, chapter, verse, verseEnd, confidence, ai: true }] — лише ті, що існують у Біблії */
export async function askAI(text, bible, timeoutMs = 8000) {
  const { key, url } = aiConfig();
  if (!key) throw new Error('немає ключа доступу');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ key, fn: 'bibleAI', args: [text, NAMES] }), signal: ctrl.signal,
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);
    return (data.result || []).map((r) => {
      const book = BOOK_INDEX[r.book];
      if (book == null || !(r.chapter >= 1 && r.chapter <= bible.chapterCount(book))) return null;
      const max = bible.verseCount(book, r.chapter);
      const verse = r.verse >= 1 && r.verse <= max ? r.verse : null;
      const verseEnd = verse && r.verseEnd > verse && r.verseEnd <= max ? r.verseEnd : null;
      return { book, chapter: r.chapter, verse, verseEnd, confidence: 0.9, ai: true };
    }).filter(Boolean);
  } catch (e) {
    throw new Error(e.name === 'AbortError' ? 'ШІ не відповів вчасно' : e.message);
  } finally { clearTimeout(timer); }
}
