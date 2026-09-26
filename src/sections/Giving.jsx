import React, { useState } from 'react';
import { Button, Eyebrow, SplitTitle } from '../components/ui';
import { church, donate } from '../data';

export function Donate() {
  const [mode, setMode] = useState('monthly');
  const [amount, setAmount] = useState(200);
  const [custom, setCustom] = useState('');
  const [purpose, setPurpose] = useState(donate.purposes[0]);
  const [copied, setCopied] = useState(false);

  const value = custom ? Number(custom) : amount;
  const label = mode === 'monthly' ? `Підписатися · ${value || 0} ₴/міс` : `Пожертвувати ${value || 0} ₴`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(church.iban.replace(/\s/g, '')); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section section--dark donate" id="donate">
      <div className="wrap donate__grid">
        <div>
          <Eyebrow dark>Пожертви</Eyebrow>
          <SplitTitle className="h2 h2--light h2--xl" text={'Підтримати\nслужіння'} />
          <blockquote className="verse">
            «Кожен як серце йому призволяє, не в смутку й не з примусу, бо Бог любить того, хто з охотою дає!»
            <cite>2 Коринтян 9:7</cite>
          </blockquote>
          <ul className="purposes">
            {donate.purposes.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <div className="iban">
            <div><small>IBAN для переказу</small><strong>{church.iban}</strong></div>
            <button className="btn btn--light" onClick={copy} aria-live="polite">{copied ? 'Скопійовано' : 'Копіювати'}</button>
          </div>
        </div>

        <form className="give" onSubmit={(e) => { e.preventDefault(); window.open(donate.paymentUrl, '_blank'); }}>
          <h3>Оберіть тип пожертви</h3>
          <div className="seg" role="radiogroup" aria-label="Тип пожертви">
            {[['once', 'Разово'], ['monthly', 'Щомісяця']].map(([k, l]) => (
              <button type="button" key={k} role="radio" aria-checked={mode === k} className={mode === k ? 'is-on' : ''} onClick={() => setMode(k)}>{l}</button>
            ))}
          </div>
          <fieldset className="amounts">
            <legend>Сума</legend>
            {donate.amounts.map((a) => (
              <button type="button" key={a} aria-pressed={!custom && amount === a} className={!custom && amount === a ? 'is-on' : ''} onClick={() => { setAmount(a); setCustom(''); }}>{a} ₴</button>
            ))}
          </fieldset>
          <label className="field">
            <span className="sr-only">Інша сума, ₴</span>
            <input inputMode="numeric" placeholder="Інша сума, ₴" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))} />
          </label>
          <label className="field field--select">
            <span className="sr-only">Призначення</span>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {donate.purposes.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <Button type="submit" className="give__submit">{label}</Button>
          <p className="give__note">
            {mode === 'monthly'
              ? 'Кошти списуватимуться щомісяця. Скасувати підписку можна будь-коли за посиланням у листі.'
              : 'Картка, Apple Pay або Google Pay.'}
          </p>
        </form>
      </div>
    </section>
  );
}

export function Prayer() {
  const [sent, setSent] = useState(false);
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    // TODO: надсилати в Telegram-бот або на пошту церкви
    setSent(true);
  };

  return (
    <section className="section" id="prayer">
      <div className="wrap prayer">
        <div>
          <Eyebrow>Молитовні потреби</Eyebrow>
          <SplitTitle className="h2" text={'Ми помолимося\nза вас'} />
          <p className="lead">Напишіть, за що помолитися. Щосереди о 19:00 на молитовному служінні ми згадуємо кожне прохання. Якщо побажаєте, його прочитає лише пастор.</p>
          <div className="pray-ways">
            <p>Або передайте прохання інакше:</p>
            <ul>
              <li><a href={`mailto:${church.email}?subject=${encodeURIComponent('Молитовна потреба')}`}><strong>Email</strong><span>{church.email}</span></a></li>
              <li><a href={church.facebook} target="_blank" rel="noreferrer"><strong>Facebook</strong><span>Написати повідомлення сторінці церкви</span></a></li>
              <li><a href={`tel:${church.phone.replace(/[^+\d]/g, '')}`}><strong>Телефон</strong><span>{church.phone}</span></a></li>
              <li><div><strong>Особисто</strong><span>Записка в скриньку біля входу або розмова з пастором</span></div></li>
            </ul>
          </div>
        </div>
        {sent ? (
          <div className="prayer__done" role="status">
            <strong>Прохання надіслано</strong>
            <p>Дякуємо, що довірилися. Ми молимося за вас.</p>
            <Button variant="outline" arrow={false} onClick={() => { setSent(false); setText(''); }}>Надіслати ще одне</Button>
          </div>
        ) : (
          <form className="prayer__form" onSubmit={submit}>
            <label className="field"><span>Ваше ім’я (необов’язково)</span><input autoComplete="given-name" /></label>
            <label className="field"><span>За що помолитися</span><textarea rows={5} required value={text} onChange={(e) => setText(e.target.value)} /></label>
            <label className="check"><input type="checkbox" /> <span>Показати лише пастору</span></label>
            <Button type="submit">Надіслати прохання</Button>
          </form>
        )}
      </div>
    </section>
  );
}
