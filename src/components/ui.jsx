import React from 'react';
import { useInView } from '../hooks';

export function Eyebrow({ children, dark }) {
  return (
    <p className={'eyebrow' + (dark ? ' eyebrow--dark' : '')}>
      <span className="eyebrow__mark" aria-hidden="true" />
      {children}
    </p>
  );
}

// короткі слова (до 3 літер) зливаються з наступним словом, щоб не висіти в кінці рядка
const glue = (words) => words.reduce((acc, w) => {
  const prev = acc[acc.length - 1];
  if (prev !== undefined && /^[A-Za-zА-Яа-яҐґЄєІіЇї'’]{1,3}$/.test(prev.split('\u00A0').pop())) acc[acc.length - 1] = prev + '\u00A0' + w;
  else acc.push(w);
  return acc;
}, []);

/** Заголовок, що з'являється по літерах (як у темі Spirixa) */
export function SplitTitle({ text, as: Tag = 'h2', className = '', immediate = false, step = 28 }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  let i = 0;
  return (
    <Tag ref={ref} className={`split ${className} ${immediate || inView ? 'is-in' : ''}`} aria-label={text.replace(/\n/g, ' ')}>
      {text.split('\n').map((line, li) => (
        <span className="split__line" key={li} aria-hidden="true">
          {glue(line.split(' ')).map((word, wi) => (
            <React.Fragment key={wi}>
              <span className="split__word">
                {[...word].map((ch, ci) => (
                  <span className="split__ch" style={{ animationDelay: `${(i++) * step}ms` }} key={ci}>{ch}</span>
                ))}
              </span>
              {' '}
            </React.Fragment>
          ))}
        </span>
      ))}
    </Tag>
  );
}

/** Фото із заглушкою, якщо файлу ще немає */
export function Photo({ src, label, className = '', reveal = true, children }) {
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <div ref={ref} className={`photo ${reveal ? 'photo--reveal' : ''} ${inView ? 'is-in' : ''} ${className}`}>
      <div className="photo__inner">
        {src ? (
          <img src={src} alt={label} loading="lazy" />
        ) : (
          <div className="photo__ph" role="img" aria-label={`Місце для фото: ${label}`}>
            <span>Фото</span>
            <small>{label}</small>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export function Button({ href, children, variant = 'dark', arrow = true, dot, onClick, type, className = '', ...rest }) {
  const cls = `btn btn--${variant} ${className}`;
  const inner = (
    <>
      {dot && <span className="btn__dot" aria-hidden="true" />}
      <span>{children}</span>
      {arrow && <span className="btn__arrow" aria-hidden="true">→</span>}
    </>
  );
  return href ? (
    <a className={cls} href={href} onClick={onClick} {...rest}>{inner}</a>
  ) : (
    <button className={cls} type={type || 'button'} onClick={onClick} {...rest}>{inner}</button>
  );
}
