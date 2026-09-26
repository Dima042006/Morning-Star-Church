import React, { useEffect, useRef, useState } from 'react';
import StarMark from './StarMark';
import { Button } from './ui';
import { church, nav, socials } from '../data';

export default function Header({ live }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeRef = useRef(null);
  const burgerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('no-scroll', open);
    if (open) closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // підсвічування поточного розділу в меню
  const [current, setCurrent] = useState('top');
  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id));
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const close = () => { setOpen(false); burgerRef.current?.focus(); };

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="wrap header__row">
          <a className="logo" href="#top" aria-label={`${church.name} — на головну`}>
            <StarMark size={38} />
            <span className="logo__name">{church.name}</span>
          </a>
          <div className="header__actions">
            <Button href="#stream" variant="outline" arrow={false} dot className={`header__live ${live ? 'is-live' : ''}`}>
              {live ? 'Наживо зараз' : 'Трансляції'}
            </Button>
            <button ref={burgerRef} className="burger" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>
              <span>Меню</span>
              <span className="burger__icon" aria-hidden="true"><i /><i /><i /></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`menu-dim ${open ? 'is-open' : ''}`} onClick={close} aria-hidden="true" />
      <aside id="menu" className={`menu ${open ? 'is-open' : ''}`} aria-label="Меню сайту" aria-hidden={!open} inert={open ? undefined : ''}>
        <div className="menu__top">
          <span className="logo logo--light"><StarMark size={34} dark /><span className="logo__name">{church.name}</span></span>
          <button ref={closeRef} className="menu__close" onClick={close}>✕ Закрити</button>
        </div>
        <nav>
          <ol className="menu__list">
            {nav.map((n, i) => (
              <li key={n.id} style={{ '--i': i }}>
                <a href={`#${n.id}`} onClick={() => setOpen(false)} className={current === n.id ? 'is-current' : ''} aria-current={current === n.id ? 'location' : undefined}>
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  <span>{n.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="menu__bottom">
          <dl className="menu__info">
            <div><dt>Богослужіння</dt><dd>Неділя, 10:00 і 18:00</dd></div>
            <div><dt>Адреса</dt><dd>{church.address}</dd></div>
          </dl>
          <div className="menu__btns">
            <Button href="#stream" variant="outline-light" arrow={false} dot onClick={() => setOpen(false)}>Наживо</Button>
            <Button href="#donate" variant="light" onClick={() => setOpen(false)}>Пожертвувати</Button>
          </div>
          <ul className="menu__socials">
            {socials.map((s) => <li key={s.name}><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a></li>)}
          </ul>
        </div>
      </aside>
    </>
  );
}
