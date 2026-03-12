import { describe, expect, it } from 'vitest'
import { loadLanguageExtension } from '@/utils/codemirror'
import { loadThemeExtension } from '@/utils/themes'

describe('editor asset loaders', () => {
  it('loads language extensions lazily', async () => {
    const extension = await loadLanguageExtension('typescript')
    expect(extension).toBeTruthy()
  })

  it('loads editor themes lazily', async () => {
    const extension = await loadThemeExtension('clouds')
    expect(extension).toBeTruthy()
  })
})
