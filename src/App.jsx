import React from 'react';
import Header from './components/Header';
import { Hero, InfoBar, Marquee } from './sections/Top';
import Stream from './sections/Stream';
import { Events, FirstVisit, Holidays, Schedule, SundaySchool } from './sections/Middle';
import Leaders from './sections/People';
import { Donate, Prayer } from './sections/Giving';
import { Footer, Social } from './sections/Bottom';
import { useServiceClock } from './hooks';
import { church } from './data';

export default function App() {
  const clock = useServiceClock(church.services);
  return (
    <div className="page">
      <a className="skip" href="#main">Перейти до змісту</a>
      <Header live={clock.live} />
      <main id="main">
        <Hero clock={clock} />
        <InfoBar />
        <Marquee />
        <Stream clock={clock} />
        <Schedule />
        <FirstVisit />
        <SundaySchool />
        <Events />
        <Holidays />
        <Leaders />
        <Donate />
        <Prayer />
        <Social />
      </main>
      <Footer />
    </div>
  );
}
