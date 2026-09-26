// Типографіка: короткі слова (та, і, в, з, на, не, до…) не лишаються в кінці рядка —
// їх «прив'язує» до наступного слова нерозривний пробіл. Так само тире не переноситься на початок рядка.
const NBSP = '\u00A0';
const SHORT = /(^|[\s\u00A0(«"„—–])([A-Za-zА-Яа-яҐґЄєІіЇї'’]{1,3})[ \t\n]+(?=\S)/g;
const DASH = /[ \t\n]+([—–])/g;

export function typo(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text.replace(DASH, NBSP + '$1');
  // двічі — щоб ланцюжки на кшталт «і в місті» теж склеїлись
  for (let i = 0; i < 2; i++) out = out.replace(SHORT, '$1$2' + NBSP);
  return out;
}

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE']);

function fixTree(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p || SKIP.has(p.tagName) || p.closest('.split')) return NodeFilter.FILTER_REJECT;
      return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const v = typo(n.nodeValue);
    if (v !== n.nodeValue) n.nodeValue = v;
  }
}

/** Обробляє весь текст на сторінці й стежить за змінами (React оновлює текст) */
export function watchTypography(root) {
  fixTree(root);
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fixTree(root); });
  }).observe(root, { subtree: true, childList: true, characterData: true });
}
