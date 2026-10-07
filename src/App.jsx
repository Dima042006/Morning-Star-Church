import React, { useEffect } from 'react';
import Lenis from 'lenis';
import Header from './components/Header';
import { Hero, InfoBar, Marquee } from './sections/Top';
import Stream from './sections/Stream';
import { FirstVisit, Holidays, Schedule, SundaySchool } from './sections/Middle';
import { Prayer } from './sections/Giving';
import { Footer, Social } from './sections/Bottom';
import { useLiteMode, useServiceClock } from './hooks';
import { church } from './data';

export default function App() {
  // оновлення раз на 30 с: вистачає для шапки й першого екрана (щосекундний таймер живе лише в блоці трансляції)
  const clock = useServiceClock(church.services, 30000);
  const lite = useLiteMode();

  // Плавна прокрутка Lenis — лише на комп'ютері з мишею
  useEffect(() => {
    if (lite) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -84 } });
    window.lenis = lenis;
    let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
    return () => { cancelAnimationFrame(raf); lenis.destroy(); window.lenis = undefined; };
  }, [lite]);
  return (
    <div className="page">
      <a className="skip" href="#main">Перейти до змісту</a>
      <Header live={clock.live} />
      <main id="main">
        <Hero clock={clock} />
        <InfoBar />
        <Marquee />
        <Stream />
        <Schedule />
        <FirstVisit />
        <SundaySchool />
        <Holidays />
        <Prayer />
        <Social />
      </main>
      <Footer />
    </div>
  );
}
