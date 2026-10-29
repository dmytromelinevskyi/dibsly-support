import { useEffect, useRef, useState } from 'react';
import {
  receiptItems,
  receiptPart,
  fraction,
  changeTable,
  changePortion,
  clampPeople,
  clampTip,
} from './model.js';
import { fill } from './strings.js';
const presets = [0, 5, 10, 15, 20];
function stored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return typeof fallback === 'string' ? value : fallback;
    }
  } catch {
    return fallback;
  }
}
function Portion({ item = {}, value, onChange, money, t }) {
  const parts = !item.units && value.people > 1;
  return (
    <div className="partline">
      <span className="mine">
        {item.units
          ? `${value.units}/${item.units} · `
          : parts
            ? `${value.k || 1}/${value.people} · `
            : ''}
        {money(Math.round((item.minor || 0) * fraction(item, value)))}
      </span>
      {item.units || (parts && value.k > 1) ? (
        <button
          type="button"
          className="share"
          aria-label="−"
          onClick={() => onChange(changePortion(item, value, -1))}
        >
          −
        </button>
      ) : null}
      {!item.units ? (
        <select
          className="share"
          aria-label={t.yours}
          value={value.people || 1}
          onChange={(event) => onChange({ people: Number(event.target.value) })}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <option key={index} value={index + 1}>
              {index === 0 ? t.whole : `1/${index + 1}`}
            </option>
          ))}
        </select>
      ) : null}
      {item.units || parts ? (
        <button
          type="button"
          className="share"
          aria-label="+"
          disabled={Boolean(item.units && value.units >= item.units)}
          onClick={() => onChange(changePortion(item, value, 1))}
        >
          +
        </button>
      ) : null}
    </div>
  );
}
export default function ReceiptView({ receipt, t, lang }) {
  const key = 'dibsly-split-' + (window.DIBSLY_SPLIT_CODE || location.hash.slice(1, 40));
  const items = receiptItems(receipt),
    sum = items.reduce((value, item) => value + item.minor, 0),
    total = Number(receipt.t) || sum,
    paidTips = receipt.a === 1;
  const initialPeople = clampPeople(stored(key + '-people', receipt.n));
  const initialShares = Object.fromEntries(
    items.filter((item) => item.fee).map((item) => [item.id, { people: initialPeople }])
  );
  const [people, setPeople] = useState(initialPeople),
    [shares, setShares] = useState(() => stored(key + '-v2', initialShares));
  const [tip, setTip] = useState(() => (paidTips ? 0 : clampTip(stored(key + '-tip', receipt.p)))),
    [ownTip, setOwnTip] = useState(
      () => !presets.includes(clampTip(stored(key + '-tip', receipt.p)))
    );
  const [tipMode, setTipMode] = useState(() =>
      paidTips ? 'percent' : stored(key + '-tipmode', 'percent')
    ),
    [tipMinor, setTipMinor] = useState(() => Math.max(0, Math.round(stored(key + '-tipminor', 0))));
  const [tipShare, setTipShare] = useState(() => stored(key + '-tipshare', null)),
    [copied, setCopied] = useState(false),
    [copyFailed, setCopyFailed] = useState(false);
  const customPercent = useRef(null),
    customAmount = useRef(null),
    timer = useRef(null);
  const formatter = new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: /^[A-Z]{3}$/.test(receipt.c) ? receipt.c : 'UAH',
    }),
    money = (minor) => formatter.format(minor / 100);
  const base = receiptPart(items, shares, total),
    tipPart = tipShare || { people },
    tips = paidTips
      ? 0
      : tipMode === 'amount'
        ? Math.round(tipMinor * fraction({}, tipPart))
        : Math.round((base * tip) / 100);
  useEffect(() => {
    try {
      for (const [suffix, value] of Object.entries({
        v2: shares,
        people,
        tip,
        tipmode: tipMode,
        tipminor: tipMinor,
        tipshare: tipShare,
      }))
        localStorage.setItem(key + '-' + suffix, JSON.stringify(value));
    } catch {}
  }, [key, shares, people, tip, tipMode, tipMinor, tipShare]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const table = (value) => {
    const next = clampPeople(value);
    setShares((previous) => changeTable(previous, people, next));
    setPeople(next);
  };
  const share = (id, value) =>
    setShares((previous) => {
      const next = { ...previous };
      if (value) next[id] = value;
      else delete next[id];
      return next;
    });
  const clear = () =>
    setShares(
      Object.fromEntries(items.filter((item) => item.fee).map((item) => [item.id, { people }]))
    );
  async function copy() {
    const names = items
      .filter((item) => shares[item.id])
      .map((item) => {
        const part = shares[item.id];
        return part.units
          ? `${item.name} ×${part.units}`
          : part.people > 1
            ? `${item.name} (${part.k || 1}/${part.people})`
            : item.name;
      })
      .join(', ');
    const text =
      tips > 0 && tipMode === 'amount'
        ? fill(t.mineTipAmount, money(base + tips), money(tips), names)
        : tips > 0
          ? fill(t.mineTip, money(base + tips), tip, names)
          : fill(t.mine, money(base), names);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyFailed(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyFailed(true);
    }
  }
  const itemRow = (item) => {
    const part = shares[item.id];
    return (
      <div className="row" key={item.id}>
        <button
          type="button"
          className={`item${part ? ' mine' : ''}`}
          aria-pressed={Boolean(part)}
          onClick={() =>
            share(
              item.id,
              part ? null : item.units ? { units: 1 } : { people: item.fee ? people : 1 }
            )
          }
        >
          <span className="check" aria-hidden="true">
            {part ? '✓' : ''}
          </span>
          <span className="name">
            {item.name}
            {item.qty && item.qty !== '1' ? <span className="qty">× {item.qty}</span> : null}
          </span>
          <span className="amount">{money(item.minor)}</span>
        </button>
        {part ? (
          <Portion
            item={item}
            value={part}
            onChange={(value) => share(item.id, value)}
            money={money}
            t={t}
          />
        ) : null}
      </div>
    );
  };
  return (
    <>
      <section className="card head">
        <div className="merchant">{receipt.m || t.title}</div>
        <div className="muted">{t.yours}</div>
        <div className="part" aria-live="polite">
          {money(base + tips)}
        </div>
        <div className="tipline">
          {tips > 0
            ? tipMode === 'amount'
              ? fill(t.tiplineAmount, money(base), money(tips))
              : fill(t.tipline, money(base), tip, money(tips))
            : ''}
        </div>
        <div className="muted of">{fill(t.of, money(total))}</div>
        {sum > total * 1.02 ? (
          <div className="muted">{fill(t.bonus, money(sum - total), money(total))}</div>
        ) : null}
      </section>
      <section className="card table">
        <strong>{t.table}</strong>
        <button
          className="round"
          type="button"
          disabled={people <= 2}
          onClick={() => table(people - 1)}
          aria-label="−"
        >
          −
        </button>
        <output>{people}</output>
        <button
          className="round"
          type="button"
          disabled={people >= 8}
          onClick={() => table(people + 1)}
          aria-label="+"
        >
          +
        </button>
      </section>
      <p className="hint">{t.hint}</p>
      <section className="card list">{items.filter((item) => !item.fee).map(itemRow)}</section>
      {items.some((item) => item.fee) ? (
        <section className="card list fees">
          <div className="feehead">{t.fees}</div>
          {paidTips ? <p className="muted note">{t.paidTips}</p> : null}
          {items.filter((item) => item.fee).map(itemRow)}
        </section>
      ) : null}
      {!paidTips ? (
        <section className="card">
          <div className="tiphead">
            <strong>{t.tips}</strong>
            <span className="tipamount">{tips > 0 ? '+' + money(tips) : ''}</span>
          </div>
          <div className="tipmode" role="tablist" aria-label={t.tips}>
            {['percent', 'amount'].map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={tipMode === mode}
                className={tipMode === mode ? 'on' : ''}
                onClick={() => {
                  setTipMode(mode);
                  if (mode === 'amount') requestAnimationFrame(() => customAmount.current?.focus());
                }}
              >
                {mode === 'amount' ? t.amount : t.percent}
              </button>
            ))}
          </div>
          {tipMode === 'percent' ? (
            <>
              <div className="chips">
                {[...presets, 'other'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`chip${value === 'other' ? (ownTip ? ' on' : '') : !ownTip && value === tip ? ' on' : ''}`}
                    aria-pressed={value === 'other' ? ownTip : !ownTip && value === tip}
                    onClick={() => {
                      setOwnTip(value === 'other');
                      setTip(value === 'other' ? 0 : value);
                      if (value === 'other')
                        requestAnimationFrame(() => customPercent.current?.focus());
                    }}
                  >
                    {value === 'other' ? t.other : value + '%'}
                  </button>
                ))}
              </div>
              {ownTip ? (
                <label className="tipown">
                  <input
                    ref={customPercent}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="100"
                    value={tip || ''}
                    placeholder={t.own}
                    aria-label={t.own}
                    onChange={(event) => setTip(clampTip(event.target.value))}
                  />
                  <span className="muted">%</span>
                </label>
              ) : null}
            </>
          ) : (
            <>
              <label className="tipown tipmoney">
                <input
                  ref={customAmount}
                  type="text"
                  inputMode="decimal"
                  aria-label={t.ownAmount}
                  placeholder={t.ownAmount}
                  defaultValue={tipMinor ? String(tipMinor / 100) : ''}
                  onChange={(event) => {
                    const value = Number(
                      event.target.value.replace(',', '.').replace(/[^0-9.]/g, '')
                    );
                    setTipMinor(
                      Number.isFinite(value) ? Math.min(Math.round(value * 100), 100000000) : 0
                    );
                  }}
                />
                <span className="muted currency">{receipt.c || ''}</span>
              </label>
              <Portion
                item={{ minor: tipMinor }}
                value={tipPart}
                onChange={setTipShare}
                money={money}
                t={t}
              />
            </>
          )}
          <p className="muted note">{tipMode === 'amount' ? t.amountnote : t.tipnote}</p>
          {sum && total > sum * 1.02 ? (
            <p className="muted note">{fill(t.inReceipt, money(total - sum))}</p>
          ) : null}
        </section>
      ) : null}
      <p className="muted footer">
        {t.made} <a href="https://dibslyapp.com/">Dibsly</a>
      </p>
      <div className="bar" id="bar">
        <div className="bar-part">
          <span>{t.yours}</span>
          <strong>{money(base + tips)}</strong>
        </div>
        <div className="bar-inner">
          <button className="secondary" type="button" onClick={clear}>
            {t.clear}
          </button>
          <button className="primary" type="button" onClick={copy}>
            {copied ? t.copied : t.copy}
          </button>
        </div>
        {copyFailed ? (
          <p role="status">
            {lang === 'uk'
              ? 'Дозволь копіювання в браузері й спробуй ще раз.'
              : 'Allow clipboard access in your browser and try again.'}
          </p>
        ) : null}
      </div>
    </>
  );
}
