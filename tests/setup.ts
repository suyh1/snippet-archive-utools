import { beforeAll, beforeEach } from 'vitest'

beforeAll(() => {
  if (typeof Range !== 'undefined') {
    if (!Range.prototype.getBoundingClientRect) {
      Range.prototype.getBoundingClientRect = () => DOMRect.fromRect()
    }

    if (!Range.prototype.getClientRects) {
      Range.prototype.getClientRects = () => ({
        item: () => null,
        length: 0,
        [Symbol.iterator]: function* iterator() {
          yield* []
        },
      }) as DOMRectList
    }
  }
})

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.style.colorScheme = ''
})
