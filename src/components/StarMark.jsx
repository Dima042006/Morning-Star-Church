import React, { useMemo } from 'react';

/** Плоска «гранована» зірка (SVG) — для логотипа та стрічки */
export default function StarMark({ size = 40, className = '', dark = false }) {
  const faces = useMemo(() => {
    const c = 50, R = 48, r = 9.6, N = 8, light = (-125 * Math.PI) / 180;
    const P = (a, d) => [c + d * Math.cos(a), c + d * Math.sin(a)];
    const lo = dark ? [199, 189, 179] : [42, 35, 28];
    const hi = dark ? [255, 255, 255] : [240, 234, 227];
    const out = [];
    for (let i = 0; i < N; i++) {
      const a = ((-90 + i * 45) * Math.PI) / 180;
      const Ri = i % 2 ? R * 0.58 : R;
      const T = P(a, Ri), Pp = P(a - Math.PI / N, r), Qp = P(a + Math.PI / N, r);
      for (const [tri, na] of [[[[c, c], Pp, T], a - Math.PI / 2], [[[c, c], T, Qp], a + Math.PI / 2]]) {
        const b = 0.5 + 0.5 * Math.cos(na - light);
        const col = lo.map((v, k) => Math.round(v + (hi[k] - v) * b));
        out.push({ d: `M${tri.map((p) => p.map((n) => n.toFixed(2)).join(' ')).join('L')}Z`, fill: `rgb(${col})` });
      }
    }
    return out;
  }, [dark]);
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {faces.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth="0.4" strokeLinejoin="round" />)}
    </svg>
  );
}
