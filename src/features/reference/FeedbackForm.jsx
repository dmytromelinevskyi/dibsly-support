import { useState } from 'react';
import { RenderNode, reactAttributes } from '../../components/site/Prose.jsx';
export default function FeedbackForm({ node, lang }) {
  const [state, setState] = useState({ pending: false, message: '', ok: false });
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget,
      values = new FormData(form),
      text = String(values.get('text') || '').trim();
    if (!text) {
      form.elements.text.focus();
      return;
    }
    setState({ pending: true, message: '', ok: false });
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          email: String(values.get('email') || '').trim(),
          company: values.get('company') || '',
          language: lang,
          page: location.pathname,
        }),
      });
      const message = response.ok
        ? node.attrs['data-thanks']
        : response.status === 429
          ? node.attrs['data-later']
          : response.status === 400 && values.get('email')
            ? node.attrs['data-email']
            : node.attrs['data-failed'];
      setState({ pending: false, message, ok: response.ok });
      if (response.ok) form.reset();
    } catch {
      setState({ pending: false, message: node.attrs['data-failed'], ok: false });
    }
  }
  return (
    <form {...reactAttributes(node.attrs)} onSubmit={submit} aria-busy={state.pending}>
      {node.children.map((child, index) => (
        <RenderNode key={index} node={child} lang={lang} context={{ feedback: state }} />
      ))}
    </form>
  );
}
