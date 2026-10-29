export const clampPeople = (value) => Math.min(Math.max(Math.round(Number(value) || 2), 2), 8);
export const clampTip = (value) => Math.min(Math.max(Math.round(Number(value) || 0), 0), 100);
export function receiptItems(receipt) {
  return (receipt.i || [])
    .map((row, id) => {
      const qty = String(row[2] || ''),
        count = /^\d+$/.test(qty.trim()) ? Number(qty) : 0;
      return {
        id,
        name: String(row[0] || ''),
        minor: Number(row[1]) || 0,
        qty,
        units: count > 1 && count <= 999 ? count : 0,
        fee: row[3] === 1,
      };
    })
    .filter((item) => item.minor > 0);
}
export function fraction(item, share) {
  if (!share) return 0;
  if (share.units) return item.units ? Math.min(share.units, item.units) / item.units : 1;
  return share.people ? Math.min(share.k || 1, share.people) / share.people : 0;
}
export function receiptPart(items, shares, total) {
  const sum = items.reduce((value, item) => value + item.minor, 0);
  if (!sum) return 0;
  const mine = items.reduce(
    (value, item) => value + item.minor * fraction(item, shares[item.id]),
    0
  );
  // Discounts belong to the payer; service above the item sum follows the selected share.
  return Math.round(mine * Math.max(total / sum, 1));
}
export function changeTable(shares, previous, next) {
  return Object.fromEntries(
    Object.entries(shares).map(([id, share]) => {
      if (share.people !== previous) return [id, share];
      const k = Math.min(share.k || 1, next - 1);
      return [id, k > 1 ? { people: next, k } : { people: next }];
    })
  );
}
export function changePortion(item, current, direction) {
  if (item.units) {
    const units = Math.min((current?.units || 0) + direction, item.units);
    return units > 0 ? { units } : null;
  }
  const k = (current?.k || 1) + direction;
  if (k >= current.people) return { people: 1 };
  return k > 1 ? { people: current.people, k } : { people: current.people };
}
export async function decodeReceipt(fragment) {
  let base64 = fragment.replace(/-/g, '+').replace(/_/g, '/');
  base64 += '='.repeat((4 - (base64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const receipt = JSON.parse(await new Response(stream).text());
  if (!receipt || receipt.v !== 1 || !Array.isArray(receipt.i)) throw Error('Invalid receipt');
  return receipt;
}
