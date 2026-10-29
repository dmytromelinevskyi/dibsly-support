import { useState } from 'react';
import { RenderNode, reactAttributes } from '../../components/site/Prose.jsx';
export default function IdeaWidget({ node, lang }) {
  const initial = JSON.parse(node.attrs['data-start'] || '{}'),
    kind = node.attrs.class || '';
  const [selected, setSelected] = useState(new Set()),
    [enabled, setEnabled] = useState(false),
    [growth, setGrowth] = useState(initial);
  const totals = { ...initial };
  const visit = (children) =>
    children.forEach((child) => {
      if (typeof child === 'string') return;
      if (child.attrs?.['data-effect'] && selected.has(child.attrs['data-effect'])) {
        const effect = JSON.parse(child.attrs['data-effect']);
        Object.keys(effect).forEach((key) => (totals[key] = (totals[key] || 0) + effect[key]));
      }
      visit(child.children || []);
    });
  if (kind.includes('live-ledger')) visit(node.children);
  if (kind.includes('live-switch'))
    totals.hand = initial.hand + (enabled ? Number(node.attrs['data-account']) : 0);
  if (kind.includes('live-growth'))
    Object.assign(totals, growth, { growth: growth.value - growth.deposits });
  const context = {
    totals,
    selected,
    enabled,
    onToggle: (key) =>
      setSelected((previous) => {
        const next = new Set(previous);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      }),
    onSwitch: setEnabled,
    onGrowth: (action) =>
      setGrowth((previous) =>
        action === 'reset'
          ? initial
          : action === 'deposit'
            ? { ...previous, deposits: previous.deposits + 1000, value: previous.value + 1000 }
            : { ...previous, value: Math.round(previous.value * 1.05) }
      ),
  };
  return (
    <div {...reactAttributes(node.attrs)}>
      {node.children.map((child, index) => (
        <RenderNode key={index} node={child} lang={lang} context={context} />
      ))}
    </div>
  );
}
