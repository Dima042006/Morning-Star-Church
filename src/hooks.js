import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** true, коли елемент уперше з'явився в полі зору */
export function useInView(options = { threshold: 0.25 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

/** Найближче з недільних служінь та стан «наживо» */
export function useServiceClock(services, intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  let live = false, liveAt = null, next = null;
  for (const { weekday, hour, minute, durationMin } of services) {
    const start = new Date(now);
    start.setHours(hour, minute, 0, 0);
    start.setDate(now.getDate() + ((weekday - now.getDay() + 7) % 7));
    const end = new Date(start.getTime() + durationMin * 60000);
    if (now >= start && now < end) { live = true; liveAt = start; }
    if (now >= start) start.setDate(start.getDate() + 7);
    if (!next || start < next) next = start;
  }

  const s = Math.floor(Math.max(0, next - now) / 1000);
  return {
    live,
    liveAt,
    next,
    parts: { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 },
  };
}

/** Поточний час, що оновлюється щосекунди */
export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** «Легкий режим»: телефони та планшети, або коли в системі вимкнено анімації */
const LITE_QUERY = '(max-width: 760px), (hover: none) and (pointer: coarse), (prefers-reduced-motion: reduce)';
export function useLiteMode() {
  const get = () => typeof window !== 'undefined' && window.matchMedia(LITE_QUERY).matches;
  const [lite, setLite] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(LITE_QUERY);
    const on = () => setLite(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return lite;
}
