import type { Analysis, AudienceId, MatchedMeme } from '../types'

export const audiences = [
  { id: 'family', label: '家人群', hint: '优先把来历和语气说清楚' },
  { id: 'work', label: '工作群', hint: '优先保留任务、时间和责任人' },
  { id: 'public', label: '公开发布', hint: '优先避免圈层和误读风险' },
] as const

const memeLexicon: MatchedMeme[] = [
  {
    phrase: '烂梗',
    meaning: '被反复使用、听众可能已经厌烦的网络笑话。',
    rewrite: '反复使用的老笑话',
    heat: 88,
    risks: { family: 68, work: 72, public: 80 },
  },
  {
    phrase: '已读乱回',
    meaning: '看过消息却故意答非所问，常带调侃或不耐烦。',
    rewrite: '答非所问',
    heat: 75,
    risks: { family: 54, work: 82, public: 67 },
  },
  {
    phrase: '你人还怪好嘞',
    meaning: '带一点反讽地夸人，也可能只是轻松打趣。',
    rewrite: '谢谢你，这件事确实帮了忙',
    heat: 64,
    risks: { family: 42, work: 61, public: 58 },
  },
  {
    phrase: '我嘞个豆',
    meaning: '用夸张口吻表达惊讶。',
    rewrite: '这确实让我很意外',
    heat: 71,
    risks: { family: 45, work: 58, public: 53 },
  },
  {
    phrase: '你小子',
    meaning: '熟人之间半夸半损的称呼，关系不够近时容易冒犯。',
    rewrite: '你这次做得很不错',
    heat: 56,
    risks: { family: 39, work: 69, public: 64 },
  },
  {
    phrase: '栓Q',
    meaning: '谐音式的无奈或夸张感谢。',
    rewrite: '谢谢，不过这件事也让我有点无奈',
    heat: 79,
    risks: { family: 62, work: 76, public: 74 },
  },
  {
    phrase: '人类猫条',
    meaning: '把能迅速安抚或讨好人的东西比作猫条。',
    rewrite: '能马上让人开心的小奖励',
    heat: 73,
    risks: { family: 50, work: 70, public: 63 },
  },
  {
    phrase: '绝绝子',
    meaning: '非常好、非常厉害的夸张评价。',
    rewrite: '效果很出色',
    heat: 69,
    risks: { family: 47, work: 64, public: 59 },
  },
]

const plainFallback = '这句话含有较强的网络语气，补充具体对象和事情会更容易被所有人理解。'

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function riskLabel(risk: number) {
  if (risk >= 75) return '容易误伤'
  if (risk >= 55) return '需要补一句'
  return '可以直接说'
}

export function analyzeMessage(source: string, audience: AudienceId): Analysis {
  const trimmed = source.trim()
  const matched = memeLexicon.filter((item) => trimmed.includes(item.phrase))
  const punctuationHeat = (trimmed.match(/[!！?？]/g)?.length ?? 0) * 4
  const heat = matched.length
    ? clamp(matched.reduce((sum, item) => sum + item.heat, 0) / matched.length + punctuationHeat)
    : clamp(24 + punctuationHeat + Math.min(trimmed.length, 18))
  const risk = matched.length
    ? clamp(matched.reduce((sum, item) => sum + item.risks[audience], 0) / matched.length + (matched.length - 1) * 6)
    : clamp(32 + (audience === 'work' ? 13 : 4) + punctuationHeat)

  let plainText = trimmed || '先输入一句想分享的话。'
  for (const item of matched) {
    plainText = plainText.replaceAll(item.phrase, item.rewrite)
  }
  plainText = plainText.replace(/([。！？])(?:[，,。！？\s])+/g, '$1')
  if (!matched.length && trimmed) plainText = `${plainText}\n\n建议补充：这句话具体在说什么、希望对方做什么。`

  const guidance = matched.length
    ? `识别到 ${matched.length} 个高语境表达。${audiences.find((item) => item.id === audience)?.hint ?? plainFallback}`
    : plainFallback

  return {
    source: trimmed,
    plainText,
    matched,
    heat,
    risk,
    riskLabel: riskLabel(risk),
    selectedAudience: audience,
    guidance,
  }
}

export function toShareText(analysis: Analysis) {
  const terms = analysis.matched.length
    ? analysis.matched.map((item) => `- ${item.phrase}：${item.meaning}`).join('\n')
    : '- 未匹配到词库表达，仍建议补充上下文。'

  return `# 语境说明卡\n\n原话：${analysis.source}\n\n人话版：${analysis.plainText}\n\n语境热度：${analysis.heat}/100\n${analysis.riskLabel}：${analysis.risk}/100\n\n识别到的表达：\n${terms}\n\n由 Meme Firebreak 离线生成`
}
