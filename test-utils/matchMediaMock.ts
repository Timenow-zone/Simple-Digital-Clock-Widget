// test-utils/matchMediaMock.ts
// Minimal MediaQueryList mock compatible with DOM typings
export function createMatchMediaMock(matches: boolean) {
  return (query: string): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {
      /* deprecated in spec, noop */
    },
    removeListener: () => {
      /* deprecated in spec, noop */
    },
    addEventListener: () => {
      /* noop */
    },
    removeEventListener: () => {
      /* noop */
    },
    dispatchEvent: () => false,
  });
}
