type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

const has = (v?: string) => Boolean(v && v.trim())

const chatProvider = () =>
  (process.env.AI_CHAT_PROVIDER || process.env.AI_PROVIDER || 'groq').toLowerCase()
const creditProvider = () =>
  (process.env.AI_CREDIT_SCAN_PROVIDER || process.env.AI_PROVIDER || 'gemini').toLowerCase()

const providerReady = (provider: string) => {
  if (provider === 'gemini') return has(process.env.GEMINI_API_KEY)
  if (provider === 'groq') return has(process.env.GROQ_API_KEY)
  if (provider === 'openrouter') return has(process.env.OPENROUTER_API_KEY)
  if (provider === 'openai') return has(process.env.OPENAI_API_KEY)
  return false
}

async function callJson(url: string, apiKeyHeader: Record<string, string>, body: unknown) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...apiKeyHeader }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error('Provider request failed')
  return res.json()
}

export async function runAiChat(messages: ChatMessage[]) {
  const primary = chatProvider()
  const fallback = providerReady('openrouter') ? 'openrouter' : ''
  const provider = providerReady(primary) ? primary : fallback
  if (!provider) return { error: 'AI Coach is not configured yet.', notConfigured: true as const }

  if (provider === 'groq') {
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
    const data: any = await callJson('https://api.groq.com/openai/v1/chat/completions', { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, { model, messages, temperature: 0.3 })
    return { text: data?.choices?.[0]?.message?.content || '' }
  }
  if (provider === 'openrouter') {
    const model = process.env.OPENROUTER_MODEL || 'openrouter/free'
    const data: any = await callJson('https://openrouter.ai/api/v1/chat/completions', { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }, { model, messages, temperature: 0.3 })
    return { text: data?.choices?.[0]?.message?.content || '' }
  }
  if (provider === 'openai') {
    const data: any = await callJson('https://api.openai.com/v1/chat/completions', { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, { model: 'gpt-4.1-mini', messages, temperature: 0.3 })
    return { text: data?.choices?.[0]?.message?.content || '' }
  }
  return { error: 'AI Coach is not configured yet.', notConfigured: true as const }
}

export async function scanCreditReportText(reportText: string) {
  const primary = creditProvider()
  const fallback = providerReady('openrouter') ? 'openrouter' : ''
  const provider = providerReady(primary) ? primary : fallback
  if (!provider) return { error: 'AI credit scan is not configured yet.', notConfigured: true as const }

  const schema = { type: 'object', additionalProperties: false, properties: { consumer: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, reportDate: { type: 'string' }, bureau: { type: 'string' }, source: { type: 'string' } }, required: ['name', 'reportDate', 'bureau', 'source'] }, scores: { type: 'object', additionalProperties: false, properties: { ficoScore: { type: ['number', 'null'] }, vantageScore: { type: ['number', 'null'] }, scoreSource: { type: 'string' } }, required: ['ficoScore', 'vantageScore', 'scoreSource'] }, summary: { type: 'object', additionalProperties: false, properties: { totalAccounts: { type: 'number' }, openAccounts: { type: 'number' }, closedAccounts: { type: 'number' }, totalDebt: { type: 'number' }, creditCardDebt: { type: 'number' }, totalCreditLimit: { type: 'number' }, creditUtilization: { type: 'number' }, monthlyPayments: { type: 'number' }, derogatoryCount: { type: 'number' }, inquiryCount: { type: 'number' } }, required: ['totalAccounts', 'openAccounts', 'closedAccounts', 'totalDebt', 'creditCardDebt', 'totalCreditLimit', 'creditUtilization', 'monthlyPayments', 'derogatoryCount', 'inquiryCount'] }, accounts: { type: 'array', items: { type: 'object' } }, collections: { type: 'array', items: { type: 'object' } }, inquiries: { type: 'array', items: { type: 'object' } }, publicRecords: { type: 'array', items: { type: 'object' } }, alerts: { type: 'array', items: { type: 'string' } }, fundingReadiness: { type: 'object', additionalProperties: false, properties: { score: { type: 'number' }, approvalTier: { type: 'string' }, reasons: { type: 'array', items: { type: 'string' } }, nextSteps: { type: 'array', items: { type: 'string' } } }, required: ['score', 'approvalTier', 'reasons', 'nextSteps'] } }, required: ['consumer', 'scores', 'summary', 'accounts', 'collections', 'inquiries', 'publicRecords', 'alerts', 'fundingReadiness'] }
  const prompt = `Extract only explicit facts from this credit report. Do not guess.\n\n${reportText.slice(0, 35000)}`

  if (provider === 'gemini') {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const data: any = await callJson(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {}, { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } })
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    return { data: JSON.parse(raw) }
  }
  if (provider === 'openrouter') {
    const model = process.env.OPENROUTER_MODEL || 'openrouter/free'
    const data: any = await callJson('https://openrouter.ai/api/v1/chat/completions', { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }, { model, messages: [{ role: 'user', content: `${prompt}\nReturn JSON only.` }], response_format: { type: 'json_schema', json_schema: { name: 'credit_report', schema, strict: true } } })
    return { data: JSON.parse(data?.choices?.[0]?.message?.content || '{}') }
  }
  if (provider === 'openai') {
    const data: any = await callJson('https://api.openai.com/v1/responses', { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, { model: process.env.OPENAI_CREDIT_SCAN_MODEL || 'gpt-5-mini', input: prompt, text: { format: { type: 'json_schema', name: 'credit_report', schema, strict: true } } })
    const raw = data?.output_text || data?.output?.[0]?.content?.[0]?.text || '{}'
    return { data: JSON.parse(raw) }
  }

  return { error: 'AI credit scan is not configured yet.', notConfigured: true as const }
}
