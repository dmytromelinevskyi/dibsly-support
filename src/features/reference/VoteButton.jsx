import { useEffect, useState } from 'react';
let voter;
let initialVotes;
function loadVotes() {
  return (initialVotes ||= fetch('/api/roadmap')
    .then((response) => (response.ok ? response.json() : {}))
    .catch(() => ({})));
}
function identity() {
  try {
    voter = localStorage.getItem('dibsly.site.voter');
    if (!voter) {
      voter = crypto.randomUUID();
      localStorage.setItem('dibsly.site.voter', voter);
    }
  } catch {
    voter = crypto.randomUUID();
  }
  return voter;
}
export default function VoteButton({ node, lang }) {
  const item = node.attrs['data-item'],
    [on, setOn] = useState(false),
    [count, setCount] = useState(0),
    [pending, setPending] = useState(false);
  useEffect(() => {
    let cancelled = false;
    loadVotes().then((body) => {
      if (!cancelled) setCount(body.votes?.[item] || 0);
    });
    try {
      setOn(Boolean(JSON.parse(localStorage.getItem('dibsly.site.voted') || '{}')[item]));
    } catch {}
    return () => {
      cancelled = true;
    };
  }, [item]);
  async function vote() {
    if (pending) return;
    setPending(true);
    const next = !on;
    try {
      const response = await fetch('/api/roadmap/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, voter: identity(), on: next }),
      });
      if (!response.ok) throw Error();
      const body = await response.json();
      setOn(next);
      setCount(body.votes?.[item] || 0);
      try {
        const all = JSON.parse(localStorage.getItem('dibsly.site.voted') || '{}');
        all[item] = next;
        localStorage.setItem('dibsly.site.voted', JSON.stringify(all));
      } catch {}
    } catch {
    } finally {
      setPending(false);
    }
  }
  return (
    <button
      type="button"
      className={`want${on ? ' on' : ''}`}
      aria-pressed={on}
      disabled={pending}
      onClick={vote}
    >
      {lang === 'uk' ? 'Хочу це' : 'I want this'} <b>{count || ''}</b>
    </button>
  );
}
