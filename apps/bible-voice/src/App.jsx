import React, { useState, useEffect, useRef, useCallback } from 'react';
import StarMark from './StarMark.jsx';
import { loadBible } from './lib/bible.js';
import { findReferences, normalize } from './lib/parser.js';
import { makeSearch } from './lib/search.js';
import { BOOKS } from './lib/books.js';

const LIVE_KEY = 'bible-voice-live';
const KEYS_KEY = 'bv-keys';
const DEFAULT_KEYS = { start: 'PageDown', stop: 'PageUp', publish: 'Enter', clear: 'Escape' };
const KEY_LABELS = { start: 'Почати слухати', stop: 'Завершити слухати', publish: 'Показати у LIVE', clear: 'Очистити LIVE' };

const getStore = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };

/** Повний запис для показу: посилання + текст. */
function toVerse(bible, r, confidence = r.confidence ?? 1) {
  const name = BOOKS[r.book].name;
  const label = `${name === 'Псалми' ? 'Псалом' : name} ${r.chapter}:${r.verse ?? 1}${r.verseEnd ? '–' + r.verseEnd : ''}`;
  return { label, book: r.book, chapter: r.chapter, verse: r.verse ?? 1, verseEnd: r.verseEnd || null,
    text: bible.text(r.book, r.chapter, r.verse ?? 1, r.verseEnd), confidence, chapterOnly: r.verse == null };
}

/** Ручне введення зі скороченнями: «ів 3 16», «1 кор 13:4», «пс 23». */
function manualReference(input, bible) {
  const m = normalize(input).match(/^([123])?\s*([а-яіїєґa-z]{2,})\s+(\d+)(?:\s+(\d+))?(?:\s+по\s+(\d+))?$/);
  if (!m) return null;
  const prefix = m[2];
  const candidates = BOOKS.map((b, i) => ({ i, name: normalize(b.name) }))
    .filter(({ name }) => (m[1] ? name.startsWith(m[1] + ' ') : !/^\d/.test(name)))
    .filter(({ name }) => name.replace(/^\d /, '').startsWith(prefix));
  if (!candidates.length) return null;
  const book = candidates[0].i;
  const single = ['Овдія', 'Филимона', '2 Івана', '3 Івана', 'Юди'].includes(BOOKS[book].name);
  let chapter = +m[3], verse = m[4] ? +m[4] : null, verseEnd = m[5] ? +m[5] : null;
  if (single && verse == null) { verse = chapter; chapter = 1; }
  if (chapter > bible.chapterCount(book)) return null;
  if (verse != null && verse > bible.verseCount(book, chapter)) return null;
  return { book, chapter, verse, verseEnd, confidence: 1 };
}

/* ======================= ВІКНО LIVE (для проєктора / OBS) ======================= */
export function Output() {
  const [live, setLive] = useState(() => getStore(LIVE_KEY, null));
  const textRef = useRef(null), boxRef = useRef(null);

  useEffect(() => {
    const bc = new BroadcastChannel(LIVE_KEY);
    bc.onmessage = (e) => setLive(e.data);
    const onStorage = (e) => { if (e.key === LIVE_KEY) setLive(getStore(LIVE_KEY, null)); };
    window.addEventListener('storage', onStorage);
    return () => { bc.close(); window.removeEventListener('storage', onStorage); };
  }, []);

  // підбираємо найбільший розмір шрифту, за якого вірш вміщається
  const fit = useCallback(() => {
    const t = textRef.current, box = boxRef.current;
    if (!t || !box) return;
    let lo = 16, hi = 140;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      t.style.fontSize = mid + 'px';
      if (t.scrollHeight <= box.clientHeight * 0.88 && t.scrollWidth <= box.clientWidth) lo = mid; else hi = mid;
    }
    t.style.fontSize = lo + 'px';
  }, []);
  useEffect(() => { fit(); }, [live, fit]);
  useEffect(() => { window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }, [fit]);

  return (
    <div className="screen" onDoubleClick={() => document.documentElement.requestFullscreen?.()}>
      {live ? (
        <div className="screen-inner" ref={boxRef}>
          <div className="screen-text" ref={textRef}>{live.text}</div>
          <div className="screen-ref">{live.label}</div>
        </div>
      ) : null}
    </div>
  );
}

/* ======================= ПАНЕЛЬ ОПЕРАТОРА ======================= */
export default function App() {
  const [bible, setBible] = useState(null);
  const searchRef = useRef(null);
  const [query, setQuery] = useState('');
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState([]);
  const [preview, setPreview] = useState(null);
  const [live, setLive] = useState(() => getStore(LIVE_KEY, null));
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('Завантажую Біблію…');
  const [keys, setKeys] = useState(() => ({ ...DEFAULT_KEYS, ...getStore(KEYS_KEY, {}) }));
  const [capture, setCapture] = useState(null);
  const [tab, setTab] = useState('search');
  const recognition = useRef(null);
  const listeningRef = useRef(false);
  const finalText = useRef('');
  const seen = useRef(new Map());
  const channel = useRef(null);
  const previewRef = useRef(null);
  previewRef.current = preview;

  useEffect(() => {
    channel.current = new BroadcastChannel(LIVE_KEY);
    loadBible('./ogienko.json')
      .then((b) => { setBible(b); searchRef.current = makeSearch(b); setStatus('Готово. Біблія Огієнка: 66 книг'); })
      .catch((e) => setStatus('Помилка: ' + e.message));
    return () => channel.current?.close();
  }, []);

  /** Новий знайдений вірш з мовлення — зверху списку, одразу в попередній перегляд. */
  const addDetected = useCallback((refs) => {
    if (!bible || !refs.length) return;
    // той самий вірш, почутий знову протягом хвилини, не дублюємо
    const now = Date.now();
    const fresh = refs.filter((r) => !(seen.current.get(r.label) > now - 60000));
    if (!fresh.length) return;
    fresh.forEach((r) => seen.current.set(r.label, now));
    const verses = fresh.map((r) => toVerse(bible, r));
    setResults((prev) => {
      const next = [...verses.reverse(), ...prev.filter((p) => !verses.some((v) => v.label === p.label))];
      return next.slice(0, 12);
    });
    setPreview(verses[0]);
    setStatus(`Почуто: ${verses.map((v) => v.label).join(', ')}`);
  }, [bible]);

  const runSearch = (text) => {
    if (!bible) return;
    const q = text.trim();
    if (!q) return;
    const manual = manualReference(q, bible);
    const refs = manual ? [manual] : findReferences(q, bible);
    let list = refs.map((r) => toVerse(bible, r));
    if (!list.length) list = searchRef.current(q).map((r) => toVerse(bible, r, r.confidence));
    setResults(list);
    setPreview(list[0] || null);
    setStatus(list.length ? `Знайдено: ${list.length}` : 'Нічого не знайдено. Спробуйте «Івана 3 16» або кілька слів з вірша.');
  };

  const stop = () => {
    if (!listeningRef.current) return;
    listeningRef.current = false;
    setListening(false);
    try { recognition.current?.stop(); } catch {}
    setStatus('Слухання завершено');
  };

  const start = () => {
    if (listeningRef.current || !bible) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setStatus('Тут немає розпізнавання мови. Відкрийте в Google Chrome.'); return; }
    finalText.current = '';
    seen.current = new Map();
    setTranscript('');
    const launch = () => {
      const r = new SR();
      recognition.current = r;
      r.lang = 'uk-UA';
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText.current += t + ' ';
          else interim += t;
        }
        finalText.current = finalText.current.slice(-1500);
        const all = (finalText.current + interim).trim();
        setTranscript(all.slice(-400));
        addDetected(findReferences(finalText.current.slice(-300), bible));   // лише остаточно розпізнаний текст
      };
      r.onerror = (e) => {
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        setStatus('Помилка мікрофона: ' + e.error + (e.error === 'not-allowed' ? ' — дозвольте доступ до мікрофона' : ''));
        listeningRef.current = false; setListening(false);
      };
      r.onend = () => { if (listeningRef.current) setTimeout(() => listeningRef.current && launch(), 150); };   // Chrome сам зупиняється — перезапускаємо
      r.start();
    };
    try {
      launch();
      listeningRef.current = true;
      setListening(true);
      setStatus('Слухаю. Знайдені вірші з’являтимуться в списку');
    } catch (e) { setStatus('Не вдалося ввімкнути мікрофон: ' + e.message); }
  };

  const publish = (v) => {
    if (!v) return;
    setLive(v);
    localStorage.setItem(LIVE_KEY, JSON.stringify(v));
    channel.current?.postMessage(v);
    setStatus(`У LIVE: ${v.label}`);
  };
  const clear = () => {
    setLive(null);
    localStorage.setItem(LIVE_KEY, 'null');
    channel.current?.postMessage(null);
    setStatus('LIVE очищено');
  };
  const openLive = () => window.open('?output=1', 'biblevoice_output', 'width=1280,height=720');

  // гарячі клавіші / пульт
  useEffect(() => {
    const handler = (e) => {
      if (capture) {
        e.preventDefault();
        const next = { ...keys, [capture]: e.code };
        setKeys(next); localStorage.setItem(KEYS_KEY, JSON.stringify(next)); setCapture(null);
        return;
      }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || e.repeat) return;
      const action = { [keys.start]: start, [keys.stop]: stop, [keys.publish]: () => publish(previewRef.current), [keys.clear]: clear }[e.code];
      if (action) { e.preventDefault(); action(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const total = bible ? bible.books.reduce((n, b) => n + b.chapters.reduce((m, c) => m + c.length, 0), 0) : 0;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><StarMark size={38} dark /><div><strong>BIBLE VOICE</strong><small>ПИСАННЯ У ПРЯМОМУ ЕФІРІ</small></div></div>
        <div className="side-label">РОБОЧИЙ ПРОСТІР</div>
        <button className={'nav ' + (tab === 'search' ? 'active' : '')} onClick={() => setTab('search')}>✦ <span>Пошук і керування</span></button>
        <button className={'nav ' + (tab === 'settings' ? 'active' : '')} onClick={() => setTab('settings')}>⌘ <span>Пульт і налаштування</span></button>
        <div className="sidebar-bottom"><div className="sidebar-star"><StarMark size={92} dark /></div>
          <div className="side-foot">СТВОРЕНО ДЛЯ СЛУЖІННЯ<br /><b>СВІТАНКОВА ЗОРЯ</b></div></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>ПАНЕЛЬ ОПЕРАТОРА <b>/ {tab === 'search' ? 'ПОШУК' : 'НАЛАШТУВАННЯ'}</b></span>
          <div className="top-actions"><span className="top-dot" /> {bible ? 'Біблія завантажена' : 'Завантаження…'}
            <button className="outline small" onClick={openLive}>↗ Відкрити LIVE</button></div>
        </header>

        <div className="content">
          <div className="eyebrow"><i /> BIBLE VOICE / {tab === 'search' ? '01 — ПОШУК ПИСАННЯ' : '02 — НАЛАШТУВАННЯ'}</div>
          <h1>{tab === 'search' ? 'СЛОВО.' : 'КЕРУВАННЯ.'}<br /><em>{tab === 'search' ? 'У ПОТРІБНИЙ МОМЕНТ.' : 'БЕЗ ЗАЙВОГО.'}</em></h1>
          <p className="intro">{tab === 'search'
            ? 'Увімкніть слухання — програма сама знайде вірші, які називає проповідник. Перевірте і покажіть у LIVE.'
            : 'Призначте кнопки пульта. Біблія Огієнка вже вбудована.'}</p>

          {tab === 'search' ? (
            <div className="workspace">
              <section className="panel search-panel">
                <div className="panel-head"><div><span className="step">01 / ВВЕДЕННЯ</span><h2>Голосовий пошук</h2></div>
                  <span className={'pill ' + (listening ? 'recording' : '')}>{listening ? '● СЛУХАЄ' : '● ОЧІКУЄ'}</span></div>
                <div className="mic-area"><div className={'mic-icon ' + (listening ? 'pulse' : '')}>◉</div>
                  <div><strong>{listening ? 'Слухаю проповідь' : 'Готовий до вашого голосу'}</strong>
                    <p>{transcript ? `…${transcript.slice(-160)}` : '«Івана три шістнадцять», «Римлян, восьмий розділ, двадцять восьмий вірш»'}</p></div></div>
                <div className="two-buttons">
                  <button className="primary" disabled={listening || !bible} onClick={start}>● Почати слухати <kbd>{keys.start}</kbd></button>
                  <button className="dark" disabled={!listening} onClick={stop}>■ Завершити <kbd>{keys.stop}</kbd></button>
                </div>
                <div className="divider-label">АБО ВВЕДІТЬ ВРУЧНУ</div>
                <form onSubmit={(e) => { e.preventDefault(); runSearch(query); }} className="search-form">
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ів 3 16 · 1 кор 13 4 · пс 23 · або слова з вірша" />
                  <button type="submit" disabled={!bible}>Знайти ↗</button>
                </form>
                <div className="status">↗ {status}</div>
                <div className="panel-head result-head"><div><span className="step">02 / РЕЗУЛЬТАТИ</span><h2>Знайдені вірші</h2></div>
                  <span className="count">{results.length.toString().padStart(2, '0')}</span></div>
                <div className="results">
                  {results.length ? results.map((v, i) => (
                    <button className={'result ' + (preview && preview.label === v.label ? 'selected' : '')} key={v.label + i} onClick={() => setPreview(v)}>
                      <div className="result-top"><strong>{v.label}</strong><span>{v.confidence >= 0.9 ? 'точно' : Math.round(v.confidence * 100) + '% збіг'}</span></div>
                      <p>{v.text}</p>
                    </button>)) :
                    <div className="empty-results">Результати з’являться тут.<br /><small>Біблія Огієнка: {total.toLocaleString('uk-UA')} віршів.</small></div>}
                </div>
              </section>

              <section className="panel preview-panel">
                <div className="panel-head"><div><span className="step">03 / ПЕРЕВІРКА</span><h2>Попередній перегляд</h2></div><span className="pill neutral">PREVIEW</span></div>
                <div className="verse-card">
                  <div className="verse-card-head"><StarMark size={25} dark /><span>СВЯТЕ ПИСЬМО</span></div>
                  {preview ? <><div className="verse-reference">{preview.label}</div><blockquote>«{preview.text}»</blockquote></>
                    : <div className="verse-placeholder">Оберіть вірш із результатів, щоб побачити його тут.</div>}
                  <div className="verse-card-bottom">ПЕРЕКЛАД ОГІЄНКА <span>✦</span></div>
                </div>
                <button className="publish" disabled={!preview} onClick={() => publish(preview)}>ПОКАЗАТИ У LIVE <span>↗ {keys.publish}</span></button>
                <div className="live-section">
                  <div className="panel-head"><div><span className="step">04 / ТРАНСЛЯЦІЯ</span><h2>Зараз в ефірі</h2></div><span className="live-dot">● LIVE</span></div>
                  <div className="live-card">{live ? <><strong>{live.label}</strong><p>{live.text}</p></> : <span>На екрані поки немає вірша</span>}</div>
                  <div className="live-controls">
                    <button className="outline" onClick={openLive}>↗ Вікно для проєктора / OBS</button>
                    <button className="outline" onClick={clear}>Очистити LIVE <kbd>{keys.clear}</kbd></button>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="settings-grid">
              <section className="panel"><span className="step">01 / ПУЛЬТ</span><h2>Кнопки</h2>
                <p className="settings-copy">Натисніть «Призначити», потім потрібну кнопку на пульті чи клавіатурі.</p>
                {Object.keys(KEY_LABELS).map((k) => (
                  <div className="key-line" key={k}><div><b>{KEY_LABELS[k]}</b><small>{keys[k]}</small></div>
                    <button className="outline" onClick={() => setCapture(k)}>{capture === k ? 'Натисніть кнопку…' : 'Призначити'}</button></div>))}
                <p className="hint">Кнопки працюють, коли активне вікно оператора і курсор не в полі введення.</p>
              </section>
              <section className="panel"><span className="step">02 / БІБЛІЯ</span><h2>Текст для пошуку</h2>
                <p className="settings-copy">Вбудовано повний переклад Івана Огієнка (суспільне надбання). Нумерація псалмів — як у виданнях Огієнка: «Господь — то мій Пастир» = Псалом 23.</p>
                <div className="db-number">{total.toLocaleString('uk-UA')} <span>віршів у базі</span></div>
                <div className="format"><b>Як відкрити екран для проєктора</b>
                  <code>«Відкрити LIVE» → перетягніть вікно на проєктор → подвійний клік = на весь екран</code></div>
              </section>
            </div>
          )}
          <footer>© BIBLE VOICE <span>ДИЗАЙН НАТХНЕННИЙ «СВІТАНКОВА ЗОРЯ»</span></footer>
        </div>
      </main>
    </div>
  );
}
