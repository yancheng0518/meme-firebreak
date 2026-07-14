import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Flame,
  History,
  Info,
  Languages,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react'
import { analyzeMessage, audiences, toShareText } from './lib/analyze'
import type { AudienceId, HistoryItem } from './types'

const examples = [
  '我嘞个豆，你人还怪好嘞！',
  '别已读乱回，项目进度发一下。',
  '这个烂梗不要再说啦。',
]

const storageKey = 'meme-firebreak-history'

function loadHistory(): HistoryItem[] {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) as HistoryItem[] : []
  } catch {
    return []
  }
}

function App() {
  const [source, setSource] = useState(examples[0])
  const [audience, setAudience] = useState<AudienceId>('work')
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory)
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState('')
  const analysis = useMemo(() => analyzeMessage(source, audience), [source, audience])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 6)))
  }, [history])

  function runAnalysis() {
    if (!source.trim()) {
      setNotice('先写下一句话，再开始拆解。')
      return
    }

    const item: HistoryItem = {
      ...analysis,
      id: crypto.randomUUID(),
      createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setHistory((current) => [item, ...current.filter((entry) => entry.source !== item.source)].slice(0, 6))
    setNotice('已生成新的语境说明卡。')
  }

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(toShareText(analysis))
      setCopied(true)
      setNotice('说明卡已复制，可以直接发到群里。')
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setNotice('复制失败，请从说明卡手动复制。')
    }
  }

  function downloadCard() {
    const blob = new Blob([toShareText(analysis)], { type: 'text/markdown;charset=utf-8' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = 'meme-firebreak-card.md'
    link.click()
    URL.revokeObjectURL(href)
    setNotice('已导出 Markdown 说明卡。')
  }

  function restore(item: HistoryItem) {
    setSource(item.source)
    setAudience(item.selectedAudience)
    setNotice('已恢复这次拆解。')
  }

  function resetHistory() {
    if (!window.confirm('清空这台设备上的最近拆解记录？此操作无法撤销。')) return
    setHistory([])
    setNotice('最近拆解已清空。')
  }

  return (
    <main className="app-shell">
      <a className="skip-link" href="#workspace">跳到语境拆解工具</a>
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="Meme Firebreak 首页">
          <span className="brand-mark"><Flame size={19} aria-hidden="true" /></span>
          <span>Meme Firebreak</span>
        </a>
        <p className="topbar-note"><span className="pulse" />离线语境翻译器</p>
      </header>

      <section className="workspace" id="workspace" aria-label="热梗语境拆解工作区">
        <div className="workspace-heading">
          <div>
            <p className="kicker">把梗接住，再把话说清楚</p>
            <h1>别让一句玩笑，<br />变成一场误会。</h1>
          </div>
          <p className="heading-note">从当天热梗出发，为群聊、工作协作和公开表达留一道清晰的“防火线”。</p>
        </div>

        <div className="tool-grid">
          <section className="composer panel" aria-labelledby="composer-title">
            <div className="panel-heading">
              <div>
                <span className="eyebrow"><Languages size={14} aria-hidden="true" />原话</span>
                <h2 id="composer-title">这句准备发给谁？</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setSource('')} aria-label="清空输入" title="清空输入">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <label className="visually-hidden" htmlFor="source-message">输入要拆解的表达</label>
            <textarea
              id="source-message"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              name="source-message"
              autoComplete="off"
              placeholder="例如：我嘞个豆，你人还怪好嘞…"
              maxLength={160}
            />
            <div className="composer-footer">
              <span>{source.length}/160</span>
              <span>内容只留在这台设备</span>
            </div>

            <div className="example-row" aria-label="示例表达">
              {examples.map((example) => (
                <button key={example} type="button" onClick={() => setSource(example)}>{example}</button>
              ))}
            </div>

            <fieldset className="audience-fieldset">
              <legend>接收场景</legend>
              <div className="audience-grid">
                {audiences.map((item) => (
                  <button
                    aria-pressed={audience === item.id}
                    className={audience === item.id ? 'audience selected' : 'audience'}
                    key={item.id}
                    type="button"
                    onClick={() => setAudience(item.id)}
                  >
                    <strong>{item.label}</strong>
                    <small>{item.hint}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <button className="primary-button" type="button" onClick={runAnalysis}>
              <Sparkles size={18} aria-hidden="true" />生成说明卡<ArrowRight size={18} aria-hidden="true" />
            </button>
          </section>

          <section className="result panel" aria-labelledby="result-title">
            <div className="result-header">
              <div>
                <span className="eyebrow"><Info size={14} aria-hidden="true" />语境说明卡</span>
                <h2 id="result-title">先看语气，再决定要不要发。</h2>
              </div>
              <div className="heat-ring" style={{ '--heat': `${analysis.heat * 3.6}deg` } as React.CSSProperties} aria-label={`语境热度 ${analysis.heat} / 100`}>
                <div><Flame size={16} aria-hidden="true" /><strong>{analysis.heat}</strong><span>热度</span></div>
              </div>
            </div>

            <div className="risk-strip">
              <span className={analysis.risk >= 75 ? 'risk-dot high' : analysis.risk >= 55 ? 'risk-dot medium' : 'risk-dot low'} />
              <strong>{analysis.riskLabel}</strong>
              <span>{analysis.risk}/100 · {audiences.find((item) => item.id === audience)?.label}</span>
            </div>

            <div className="rewrite-block">
              <span>人话版</span>
              <p>{analysis.plainText}</p>
            </div>

            <div className="term-list">
              <span className="list-label">识别到的表达</span>
              {analysis.matched.length ? analysis.matched.map((item) => (
                <article key={item.phrase}>
                  <strong>{item.phrase}</strong>
                  <p>{item.meaning}</p>
                </article>
              )) : <p className="empty-terms">暂未匹配词库表达，但仍建议补充对象、动作和时间。</p>}
            </div>

            <p className="guidance"><Info size={16} aria-hidden="true" />{analysis.guidance}</p>

            <div className="result-actions">
              <button className="secondary-button" type="button" onClick={copyCard}>
                {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
                {copied ? '已复制' : '复制说明卡'}
              </button>
              <button className="icon-button bordered" type="button" onClick={downloadCard} aria-label="导出 Markdown" title="导出 Markdown">
                <Download size={18} aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>

        <section className="history-section" aria-labelledby="history-title">
          <div className="history-heading">
            <div>
              <span className="eyebrow"><History size={14} aria-hidden="true" />最近拆解</span>
              <h2 id="history-title">防火线留在本地</h2>
            </div>
            {history.length > 0 && (
              <button className="text-button" type="button" onClick={resetHistory}><RefreshCw size={15} aria-hidden="true" />清空记录</button>
            )}
          </div>
          {history.length ? (
            <div className="history-list">
              {history.map((item) => (
                <button className="history-item" type="button" key={item.id} onClick={() => restore(item)}>
                  <span className="history-time">{item.createdAt}</span>
                  <strong>{item.source}</strong>
                  <span>{item.riskLabel} · {item.risk}/100</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-history">生成第一张说明卡后，它会只保存在这个浏览器里。</div>
          )}
        </section>
      </section>

      <div className={notice ? 'toast visible' : 'toast'} role="status" aria-live="polite">{notice}</div>
    </main>
  )
}

export default App
