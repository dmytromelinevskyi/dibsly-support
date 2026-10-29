import { createElement } from 'react';
import ScreenshotDeck from '../../features/reference/ScreenshotDeck.jsx';
import IdeaWidget from '../../features/reference/IdeaWidget.jsx';
import FeedbackForm from '../../features/reference/FeedbackForm.jsx';
import VoteButton from '../../features/reference/VoteButton.jsx';
import { capturePath } from '../../features/reference/capture-path.js';
const boolean = new Set([
  'open',
  'disabled',
  'required',
  'multiple',
  'readOnly',
  'autofocus',
  'hidden',
  'checked',
]);
const aliases = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  viewbox: 'viewBox',
  fillrule: 'fillRule',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  maxlength: 'maxLength',
  inputmode: 'inputMode',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  'aria-labelledby': 'aria-labelledby',
};
export function reactAttributes(attrs = {}) {
  const output = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on') || key === 'srcdoc') continue;
    if (key === 'style') {
      output.style = Object.fromEntries(
        (value || '')
          .split(';')
          .filter((part) => part.includes(':'))
          .map((part) => {
            const index = part.indexOf(':');
            let property = part.slice(0, index).trim();
            if (!property.startsWith('--'))
              property = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            return [property, part.slice(index + 1).trim()];
          })
      );
      continue;
    }
    if (key === 'checked') {
      output.defaultChecked = value !== null;
      continue;
    }
    const alias = aliases[key] || key;
    output[alias] = boolean.has(key) ? value !== null : value === null ? '' : value;
  }
  return output;
}
function findImages(node, result = []) {
  if (typeof node === 'string') return result;
  if (node.tag === 'img') result.push(node.attrs);
  node.children?.forEach((child) => findImages(child, result));
  return result;
}
function money(value, currency, lang) {
  const text = Math.round(Math.abs(value)).toLocaleString(lang === 'uk' ? 'uk-UA' : 'en-US'),
    sign = value < 0 ? '−' : '';
  return lang === 'uk' ? `${sign}${text} ${currency || '₴'}` : `${sign}${currency || '₴'}${text}`;
}
export function RenderNode({ node, lang = 'uk', context }) {
  if (typeof node === 'string') return node;
  if (!node || ['script', 'style'].includes(node.tag)) return null;
  const attrs = node.attrs || {},
    classes = attrs.class || '';
  if (classes.split(' ').includes('phone')) {
    const shots = findImages(node);
    if (shots.length) return <ScreenshotDeck shots={shots} lang={lang} />;
  }
  if (/\blive-(ledger|switch|growth)\b/.test(classes))
    return <IdeaWidget node={node} lang={lang} />;
  if (node.tag === 'form' && classes.includes('missing-form'))
    return <FeedbackForm node={node} lang={lang} />;
  if (node.tag === 'button' && classes.split(' ').includes('want'))
    return <VoteButton node={node} lang={lang} />;
  const props = reactAttributes(attrs);
  let children = node.children?.map((child, index) => (
    <RenderNode key={index} node={child} lang={lang} context={context} />
  ));
  if (context?.totals && attrs['data-total'])
    children = money(context.totals[attrs['data-total']] || 0, attrs['data-currency'], lang);
  if (context && attrs['data-effect']) {
    const selected = context.selected.has(attrs['data-effect']);
    props.className = `${classes.replace(/\bon\b/g, '')} ${selected ? 'on' : ''}`;
    props['aria-pressed'] = selected;
    props.onClick = () => context.onToggle(attrs['data-effect']);
  }
  if (context && node.tag === 'input' && attrs.type === 'checkbox') {
    delete props.defaultChecked;
    props.checked = context.enabled;
    props.onChange = (event) => context.onSwitch(event.target.checked);
  }
  if (context && attrs['data-act']) props.onClick = () => context.onGrowth(attrs['data-act']);
  if (context?.feedback) {
    if (node.tag === 'button') props.disabled = context.feedback.pending;
    if (classes.includes('form-status')) {
      props.role = 'status';
      props.className = `form-status ${context.feedback.ok ? 'ok' : 'down'}`;
      children = context.feedback.message;
    }
  }
  if (node.tag === 'input' && props.value !== undefined) {
    props.defaultValue = props.value;
    delete props.value;
  }
  if (node.tag === 'img') props.src = capturePath(props.src);
  if (['img', 'input', 'hr', 'br', 'source', 'wbr'].includes(node.tag))
    return createElement(node.tag, props);
  return createElement(node.tag, props, children);
}
export default function Prose({ nodes, lang }) {
  return nodes.map((node, index) => <RenderNode key={index} node={node} lang={lang} />);
}
