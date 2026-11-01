import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../server/worker.js';
test('www redirects with its path and query preserved', async () => {
  const response = await worker.fetch(
    new Request('https://www.dibslyapp.com/help.html?from=app'),
    {}
  );
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://dibslyapp.com/help.html?from=app');
});
test('ordinary pages continue to use the static asset binding', async () => {
  let path;
  const response = await worker.fetch(new Request('https://dibslyapp.com/privacy.html'), {
    ASSETS: {
      fetch: async (request) => {
        path = request.url;
        return new Response('policy');
      },
    },
  });
  assert.equal(path, 'https://dibslyapp.com/privacy.html');
  assert.equal(await response.text(), 'policy');
});
test('shared receipts retain the server payload and root base URL', async () => {
  const env = {
    ASSETS: { fetch: async () => new Response('<html><head><title>Split</title></head></html>') },
    SYNC: {
      fetch: async () =>
        Response.json({
          payload: { items: [{ name: 'Coffee', price: 85 }] },
          merchant: 'Cafe & Friends',
        }),
    },
  };
  const response = await worker.fetch(new Request('https://dibslyapp.com/s/abc123'), env),
    html = await response.text();
  assert.equal(response.status, 200);
  assert.ok(html.includes('<base href="/">'));
  assert.ok(html.includes('DIBSLY_SPLIT_CODE="abc123"'));
  assert.ok(html.includes('Cafe &#38; Friends'));
});
test('expired receipts retain their 404 and noindex behavior', async () => {
  const env = {
    ASSETS: { fetch: async () => new Response('<head></head>') },
    SYNC: { fetch: async () => new Response('', { status: 404 }) },
  };
  const response = await worker.fetch(new Request('https://dibslyapp.com/s/abc123'), env);
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
  assert.ok((await response.text()).includes('DIBSLY_SPLIT_EXPIRED=true'));
});
test('feedback and roadmap still forward through the existing service binding', async () => {
  let forwarded;
  const response = await worker.fetch(
    new Request('https://dibslyapp.com/api/feedback', { method: 'POST', body: '{"text":"Test"}' }),
    {
      SYNC: {
        fetch: async (url, options) => {
          forwarded = { url, ...options };
          return Response.json({ ok: true });
        },
      },
    }
  );
  assert.equal(response.status, 200);
  assert.equal(forwarded.url, 'https://dibsly-sync/v1/site/feedback');
  assert.equal(forwarded.body, '{"text":"Test"}');
});
test('statement videos answer byte ranges for the iPhone player', async () => {
  const env = {
    ASSETS: {
      fetch: async () =>
        new Response(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), {
          headers: { 'Content-Type': 'video/mp4' },
        }),
    },
  };
  const ranged = await worker.fetch(
    new Request('https://dibslyapp.com/assets/statements/kredo.mp4', {
      headers: { Range: 'bytes=2-5' },
    }),
    env
  );
  assert.equal(ranged.status, 206);
  assert.equal(ranged.headers.get('content-range'), 'bytes 2-5/10');
  assert.deepEqual([...new Uint8Array(await ranged.arrayBuffer())], [2, 3, 4, 5]);
  const tail = await worker.fetch(
    new Request('https://dibslyapp.com/assets/statements/kredo.mp4', {
      headers: { Range: 'bytes=-3' },
    }),
    env
  );
  assert.deepEqual([...new Uint8Array(await tail.arrayBuffer())], [7, 8, 9]);
  const whole = await worker.fetch(
    new Request('https://dibslyapp.com/assets/statements/kredo.mp4'),
    env
  );
  assert.equal(whole.status, 200);
  assert.equal(whole.headers.get('accept-ranges'), 'bytes');
  const outside = await worker.fetch(
    new Request('https://dibslyapp.com/assets/statements/kredo.mp4', {
      headers: { Range: 'bytes=20-' },
    }),
    env
  );
  assert.equal(outside.status, 416);
});
