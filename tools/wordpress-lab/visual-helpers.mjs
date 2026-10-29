const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)])) : value;

// Keep real navigation/performance entries available to WordPress Interactivity.
export async function freezeDate(page, iso) {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) throw new Error('Invalid acceptance time');
  await page.addInitScript(time => {
    const OriginalDate = Date;
    globalThis.Date = new Proxy(OriginalDate, {
      construct(target, args, newTarget) { return Reflect.construct(target, args.length ? args : [time], newTarget); },
      apply() { return new OriginalDate(time).toString(); },
      get(target, key, receiver) { return key === 'now' ? () => time : Reflect.get(target, key, receiver); },
    });
  }, time);
}

// DOMRect subtraction can vary below one thousandth of a CSS pixel at large Y offsets.
// Attribute values, text and computed styles must still match exactly.
export function compareClockRenders(expected, actual) {
  if (expected.length !== actual.length) return { equal: false, maxGeometryDelta: null };
  let maxGeometryDelta = 0;
  let metadataEqual = true;
  for (const [index, before] of expected.entries()) {
    const { width, height, ...beforeMetadata } = before;
    const { width: afterWidth, height: afterHeight, ...afterMetadata } = actual[index];
    maxGeometryDelta = Math.max(maxGeometryDelta, Math.abs(width - afterWidth), Math.abs(height - afterHeight));
    if (JSON.stringify(canonical(beforeMetadata)) !== JSON.stringify(canonical(afterMetadata))) metadataEqual = false;
  }
  return { equal: metadataEqual && maxGeometryDelta <= 0.001, metadataEqual, maxGeometryDelta, toleranceCssPixels: 0.001 };
}
