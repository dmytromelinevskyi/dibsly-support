import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import {
  receiptItems,
  fraction,
  receiptPart,
  changeTable,
  changePortion,
  decodeReceipt,
} from '../src/features/receipts/model.js';
test('a counted item and multiple shares preserve the original fraction rules', () => {
  assert.equal(fraction({ units: 3 }, { units: 1 }), 1 / 3);
  assert.equal(fraction({}, { people: 5, k: 2 }), 2 / 5);
  assert.deepEqual(changePortion({}, { people: 5, k: 4 }, 1), { people: 1 });
  assert.equal(changePortion({ units: 3 }, { units: 1 }, -1), null);
});
test('discounts stay with the payer while added service follows the selected part', () => {
  const items = receiptItems({
    i: [
      ['Pasta', 1000, '1'],
      ['Lemonade', 900, '3'],
    ],
  });
  const shares = { 0: { people: 2 }, 1: { units: 1 } };
  assert.equal(receiptPart(items, shares, 1900), 800);
  assert.equal(receiptPart(items, shares, 1500), 800);
  assert.equal(receiptPart(items, shares, 2090), 880);
});
test('table changes update shared fees and clamp multi-part selections', () => {
  const shares = { 0: { people: 5, k: 4 }, 1: { people: 5 }, 2: { units: 1 }, 3: { people: 2 } };
  assert.deepEqual(changeTable(shares, 5, 3), {
    0: { people: 3, k: 2 },
    1: { people: 3 },
    2: { units: 1 },
    3: { people: 2 },
  });
  assert.equal(shares[0].people, 5);
});
test('existing v1 deflated receipt links decode without network access', async () => {
  const receipt = {
    v: 1,
    c: 'UAH',
    m: 'Demo',
    t: 2100,
    n: 4,
    a: 1,
    i: [
      ['Dinner', 2000, '1'],
      ['Paid tips', 100, '1', 1],
    ],
  };
  const fragment = deflateRawSync(JSON.stringify(receipt)).toString('base64url');
  assert.deepEqual(await decodeReceipt(fragment), receipt);
  const items = receiptItems(receipt);
  assert.equal(receiptPart(items, { 0: { people: 4 }, 1: { people: 4 } }, 2100), 525);
  await assert.rejects(() =>
    decodeReceipt(deflateRawSync(JSON.stringify({ v: 2, i: [] })).toString('base64url'))
  );
});
