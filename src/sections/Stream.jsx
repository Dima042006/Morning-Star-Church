import React from 'react';
import { Button, Eyebrow, Photo, SplitTitle } from '../components/ui';
import { church, recordings, stream } from '../data';
import { useServiceClock } from '../hooks';

const pad = (n) => String(n).padStart(2, '0');
const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default function Stream() {
  const clock = useServiceClock(church.services, 1000);
  const { live, parts } = clock;
  return (
    <section className="section section--dark" id="stream">
      <div className="wrap">
        <div className="section__head">
          <div>
            <Eyebrow dark>Трансляції</Eyebrow>
            <SplitTitle className="h2 h2--light" text={'Прямий ефір\nщонеділі'} />
          </div>
          {live ? (
            <div className="live-now" role="status">
              <span className="live-now__dot" aria-hidden="true" />
              Богослужіння йде наживо
            </div>
          ) : (
            <div className="countdown" aria-live="off">
              <p>До наступної трансляції</p>
              <div className="countdown__boxes">
                {[['днів', parts.days], ['год', parts.hours], ['хв', parts.minutes], ['сек', parts.seconds]].map(([l, v]) => (
                  <div key={l}><strong>{pad(v)}</strong><small>{l}</small></div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="stream">
          <a className="stream__player" href={church.youtube} target="_blank" rel="noreferrer" aria-label="Відкрити трансляцію на YouTube">
            <Photo src={stream.image} label="Недільне богослужіння" reveal={false} className="stream__cover" />
            <span className={`badge ${live ? 'badge--live' : ''}`}>{live ? '● Наживо' : `Неділя · ${hhmm(clock.next)}`}</span>
            <span className="play" aria-hidden="true" />
            <span className="stream__caption">
              <strong>Недільне богослужіння</strong>
              <small>{(live ? clock.liveAt : clock.next).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })} · {hhmm(live ? clock.liveAt : clock.next)}</small>
            </span>
          </a>
          <div className="playlist">
            <h3>Попередні записи</h3>
            <ul>
              {recordings.map((r, i) => (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    <Photo src={r.image} label="Обкладинка" reveal={false} className="playlist__thumb" />
                    <span><small>{r.date}</small><strong>{r.title}</strong></span>
                  </a>
                </li>
              ))}
            </ul>
            <Button href={church.youtube} variant="outline-light" target="_blank" rel="noreferrer">Усі записи на YouTube</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
