import { describe, expect, it } from 'vitest'
import { en, zh } from './i18n'

describe('bilingual dictionary', () => {
  it('has exactly the same UI keys in Chinese and English', () => {
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort())
  })

  it('does not contain blank UI labels', () => {
    expect(Object.values(zh).every((value) => value.trim().length > 0)).toBe(true)
    expect(Object.values(en).every((value) => value.trim().length > 0)).toBe(true)
  })
})
