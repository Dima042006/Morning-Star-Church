import React from 'react';
import Star3D from '../components/Star3D';
import StarMark from '../components/StarMark';
import { Button, Eyebrow, Photo, SplitTitle } from '../components/ui';
import { church, hero } from '../data';

const hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export function Hero({ clock }) {
  const d = clock.next;
  const days = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця', 'Субота'];
  const dateStr = `${days[d.getDay()]}, ${d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}`;
  return (
    <section className="hero wrap" id="top">
      <div className="hero__meta">
        <Eyebrow>{church.full} · {church.city}</Eyebrow>
        <span className="hero__when">Неділя · 10:00 і 18:00</span>
      </div>
      <SplitTitle as="h1" className="hero__title" text={church.name} immediate step={45} />
      <div className="hero__grid">
        <div className="hero__side">
          <div className="hero__star"><Star3D /></div>
          <div className="hero__text">
            <p className="lead">{hero.lead}</p>
            <div className="btn-stack">
              <Button href="#stream" dot>Дивитись трансляцію</Button>
              <Button href={church.mapUrl} variant="outline" target="_blank" rel="noreferrer">Як нас знайти</Button>
            </div>
          </div>
        </div>
        <Photo src={hero.image} label="Зал церкви під час богослужіння" className="hero__photo">
          <div className="hero__card">
            <span>{clock.live ? 'Зараз триває' : 'Найближче богослужіння'}</span>
            <strong>{clock.live ? 'Богослужіння наживо' : `${dateStr}, ${hhmm(d)}`}</strong>
            <small>Дім молитви · {church.address}</small>
          </div>
        </Photo>
      </div>
    </section>
  );
}

export function Marquee() {
  const items = ['Віра', 'Надія', 'Любов', 'Світанкова Зоря', 'Рівне'];
  const row = items.flatMap((t, i) => [
    <span key={`t${i}`}>{t}</span>,
    <StarMark key={`s${i}`} size={27} className="marquee__star" />,
  ]);
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">{row}{row}{row}</div>
    </div>
  );
}

export function InfoBar() {
  const cells = [
    ['Богослужіння', 'Неділя, 10:00 і 18:00'],
    ['Молитва', 'Середа, 19:00'],
    ['Молодь', 'Субота, 19:00'],
    ['Адреса', 'вул. Плужника, 3'],
  ];
  return (
    <div className="wrap">
      <ul className="infobar">
        {cells.map(([a, b]) => (
          <li key={a}><Eyebrow>{a}</Eyebrow><strong>{b}</strong></li>
        ))}
      </ul>
    </div>
  );
}
