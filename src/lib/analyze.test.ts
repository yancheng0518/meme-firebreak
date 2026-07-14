import { describe, expect, it } from 'vitest'
import { analyzeMessage, toShareText } from './analyze'

describe('analyzeMessage', () => {
  it('recognizes a meme and rewrites it', () => {
    const result = analyzeMessage('我嘞个豆，你人还怪好嘞！', 'work')

    expect(result.matched.map((item) => item.phrase)).toEqual(['你人还怪好嘞', '我嘞个豆'])
    expect(result.plainText).toContain('这确实让我很意外')
    expect(result.risk).toBeGreaterThan(50)
  })

  it('gives higher risk to workplace use for a deflecting phrase', () => {
    const family = analyzeMessage('别已读乱回', 'family')
    const work = analyzeMessage('别已读乱回', 'work')

    expect(work.risk).toBeGreaterThan(family.risk)
    expect(work.riskLabel).toBe('容易误伤')
  })

  it('exports a portable context card', () => {
    const result = analyzeMessage('这个烂梗不要再说啦', 'public')

    expect(toShareText(result)).toContain('# 语境说明卡')
    expect(toShareText(result)).toContain('烂梗')
  })
})
