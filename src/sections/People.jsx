import React from 'react';
import { Button, Eyebrow, Photo, SplitTitle } from '../components/ui';
import { deacons, pastor } from '../data';

export default function Leaders() {
  return (
    <section className="section section--top-tight" id="leaders">
      <div className="wrap">
        <div className="center-head">
          <Eyebrow>Служителі церкви</Eyebrow>
          <SplitTitle className="h2" text="Пастор і диякони" />
        </div>
        <article className="pastor">
          <Photo src={pastor.image} label="Портрет пастора" className="pastor__photo" />
          <div className="pastor__body">
            <Eyebrow dark>Пастор церкви</Eyebrow>
            <h3>{pastor.name}</h3>
            {pastor.quote && <blockquote>{pastor.quote}</blockquote>}
            <p>{pastor.bio}</p>
            <div className="btn-row">
              <Button href="#contacts" variant="light">Записатися на розмову</Button>
              <Button href="#contacts" variant="outline-light">Написати</Button>
            </div>
          </div>
        </article>
        <div className="council__head">
          <h3>Диякони</h3>
          <p className="muted">Допомагають пастору служити церкві</p>
        </div>
        <ul className="council">
          {deacons.map((m, i) => (
            <li key={i}>
              <Photo src={m.image} label="Портрет" className="council__photo" />
              <strong>{m.name}</strong>
              <span>{m.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
