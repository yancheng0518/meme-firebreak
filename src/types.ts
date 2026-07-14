export type AudienceId = 'family' | 'work' | 'public'

export type Audience = {
  id: AudienceId
  label: string
  hint: string
}

export type MatchedMeme = {
  phrase: string
  meaning: string
  rewrite: string
  heat: number
  risks: Record<AudienceId, number>
}

export type Analysis = {
  source: string
  plainText: string
  matched: MatchedMeme[]
  heat: number
  risk: number
  riskLabel: string
  selectedAudience: AudienceId
  guidance: string
}

export type HistoryItem = Analysis & {
  id: string
  createdAt: string
}
