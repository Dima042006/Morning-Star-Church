import React from 'react';
import { Button, Eyebrow, Photo, SplitTitle } from '../components/ui';
import { events, firstVisit, holidays, schedule, sundaySchool } from '../data';

export function Schedule() {
  return (
    <section className="section" id="schedule">
      <div className="wrap">
        <div className="section__head">
          <div><Eyebrow>Розклад</Eyebrow><SplitTitle className="h2" text="Щотижня в церкві" /></div>
          <p className="muted section__aside">Двері відкриті для всіх. Приходьте на будь-яке служіння — вас щиро чекають.</p>
        </div>
        <ul className="schedule">
          {schedule.map((s) => (
            <li key={s.day + s.time} className="schedule__row">
              <span className="schedule__day">{s.day}</span>
              <span className="schedule__time">{s.time}</span>
              <span className="schedule__body"><strong>{s.title}</strong><span>{s.text}</span></span>
              <span className="schedule__place">Дім молитви</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FirstVisit() {
  return (
    <section className="section section--rule" id="first-visit">
      <div className="wrap first">
        <div>
          <Eyebrow>Вперше у нас</Eyebrow>
          <SplitTitle className="h2" text={'Як проходить\nнеділя'} />
          <ol className="steps">
            {firstVisit.steps.map((s, i) => (
              <li key={s.title}>
                <span className="steps__n">{i + 1}</span>
                <div><strong>{s.title}</strong><p>{s.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
        <div className="faq">
          <h3>Часті запитання</h3>
          {firstVisit.faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}<span aria-hidden="true" /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SundaySchool() {
  return (
    <section className="section section--light" id="sunday-school">
      <div className="wrap school">
        <div className="school__text">
          <Eyebrow>Для дітей і батьків</Eyebrow>
          <SplitTitle className="h2 h2--xl" text={'Недільна\nшкола'} />
          <p className="lead">Поки дорослі на богослужінні, діти в безпечному й радісному місці вивчають Біблію, співають, моляться і знаходять друзів.</p>
          <ul className="school__points">
            {sundaySchool.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <Button href="#contacts">Записати дитину</Button>
        </div>
        <div className="school__media">
          <Photo src={sundaySchool.image} label="Діти на недільній школі" className="school__big" />
          <div className="school__col">
            <blockquote className="school__verse">
              «Пустіть дітей, щоб до Мене приходили»
              <cite>Марка 10:14</cite>
            </blockquote>
            <div className="school__time"><small>Щонеділі</small><strong>10:00</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Events() {
  return (
    <section className="section" id="events">
      <div className="wrap">
        <div className="section__head">
          <div><Eyebrow>Не пропустіть</Eyebrow><SplitTitle className="h2" text="Найближчі події" /></div>
          <Button href="#events">Усі події</Button>
        </div>
        <ul className="events">
          {events.map((e) => (
            <li key={e.title} className="event">
              <p className="event__date"><strong>{e.day}</strong><span>{e.month}</span></p>
              <Photo src={e.image} label="Фото події" className="event__img" />
              <div className="event__body">
                <span className="tag">{e.tag}</span>
                <h3>{e.title}</h3>
                <p className="muted">{e.meta}</p>
              </div>
              <a className="round-arrow" href="#events" aria-label={`Детальніше: ${e.title}`}>→</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
const plural = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'день' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'дні' : 'днів');

export function Holidays() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const list = holidays.items.map((h) => {
    const [y, m, d] = h.date.split('-').map(Number);
    return { ...h, when: new Date(y, m - 1, d), day: d, month: MONTHS[m - 1] };
  });
  const next = list.find((h) => h.when >= today);
  const days = next ? Math.round((next.when - today) / 864e5) : 0;
  return (
    <section className="section section--rule" id="holidays">
      <div className="wrap">
        <div className="section__head">
          <div><Eyebrow>Календар {holidays.year}</Eyebrow><SplitTitle className="h2" text="Свята церкви" /></div>
          {next && (
            <p className="holidays__next">
              <small>Наступне свято</small>
              <strong>{next.name}</strong>
              <span>{next.day} {next.month} · {days === 0 ? 'сьогодні' : `через ${days} ${plural(days)}`}</span>
            </p>
          )}
        </div>
        <ol className="holidays">
          {list.map((h) => (
            <li key={h.date} className={`holidays__item ${h === next ? 'is-next' : h.when < today ? 'is-past' : ''}`}>
              <span className="holidays__date"><strong>{h.day}</strong>{h.month}</span>
              <span className="holidays__name">{h.name}</span>
              {h === next && <span className="holidays__badge">Наступне</span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
