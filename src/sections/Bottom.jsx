import React, { useState } from 'react';
import { Eyebrow, Photo, SplitTitle } from '../components/ui';
import { church, instagram, nav, socials } from '../data';

export function Social() {
  return (
    <section className="section section--rule" id="social">
      <div className="wrap">
        <div className="center-head">
          <Eyebrow>Соцмережі</Eyebrow>
          <SplitTitle className="h2" text="Будьмо на зв’язку" />
          <p className="muted">Трансляції та записи богослужінь, новини церкви і життя молоді.</p>
        </div>
        <ul className="socials">
          {socials.map((s) => (
            <li key={s.name}>
              <a href={s.url} target="_blank" rel="noreferrer">
                <span className="socials__ic" aria-hidden="true">{s.short}</span>
                <strong>{s.name}</strong>
                <span className="muted">{s.text}</span>
                <span className="socials__handle">{s.handle}</span>
                <span className="socials__cta">Підписатися →</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="insta">
          {instagram.map((src, i) => (
            <a key={i} href="https://www.instagram.com/svitankova_youth/" target="_blank" rel="noreferrer" aria-label="Instagram молоді церкви">
              <Photo src={src} label="Пост Instagram" className="insta__item" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const [done, setDone] = useState(false);
  return (
    <footer className="footer" id="contacts">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__news">
            <h3>Отримуйте новини церкви</h3>
            <p className="muted">Анонси подій і трансляцій — раз на тиждень на вашу пошту.</p>
            {done ? <p className="footer__ok" role="status">Готово! Перший лист прийде в неділю.</p> : (
              <form className="subscribe" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
                <label className="sr-only" htmlFor="email">Email</label>
                <input id="email" type="email" required placeholder="Ваш email" />
                <button className="btn btn--dark" type="submit">Підписатися</button>
              </form>
            )}
          </div>
          <div><h4>Зібрання</h4><ul><li>Неділя — 10:00 і 18:00</li><li>Середа — 19:00, молитва</li><li>Субота — 19:00, молодь</li></ul></div>
          <div><h4>Розділи</h4><ul>{nav.slice(1, 7).map((n) => <li key={n.id}><a href={`#${n.id}`}>{n.label}</a></li>)}</ul></div>
          <div><h4>Контакти</h4><ul><li><a href={church.mapUrl} target="_blank" rel="noreferrer">{church.address}, {church.postal}</a></li><li><a href={`tel:${church.phone.replace(/[^+\d]/g, '')}`}>{church.phone}</a></li><li><a href={`mailto:${church.email}`}>{church.email}</a></li></ul></div>
        </div>
        <p className="footer__giant" aria-hidden="true">{church.name}</p>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Церква ХВЄ «{church.name}», м. {church.city} · Входить в {church.union}</span>
          <a href="#top">Нагору ↑</a>
        </div>
      </div>
    </footer>
  );
}
