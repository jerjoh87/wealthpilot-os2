import type { NextApiRequest, NextApiResponse } from 'next'
import { err, methodNotAllowed, ok, requireUser } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'

export const config = { api: { bodyParser: false } }
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const asNumber = (value: unknown, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback)

// Parse multipart upload manually to avoid extra runtime dependencies.
async function readMultipartPdf(req: NextApiRequest) {
  const contentType = req.headers['content-type'] || ''
  const match = contentType.match(/boundary=(.+)$/)
  if (!match) throw new Error('Invalid upload request.')
  const boundary = `--${match[1]}`
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += b.length
    if (size > MAX_FILE_SIZE_BYTES + 1024 * 1024) throw new Error('File too large. Maximum size is 10MB.')
    chunks.push(b)
  }
  const body = Buffer.concat(chunks)
  const parts = body.toString('binary').split(boundary)
  const filePart = parts.find((p) => p.includes('name="file"'))
  if (!filePart) throw new Error('No file uploaded. Please select a PDF file.')
  if (!/application\/pdf/i.test(filePart)) throw new Error('Wrong file type. Please upload a PDF credit report.')
  const sep = filePart.indexOf('\r\n\r\n')
  if (sep < 0) throw new Error('Invalid file payload.')
  const bin = filePart.slice(sep + 4, filePart.lastIndexOf('\r\n'))
  return Buffer.from(bin, 'binary')
}

// Lightweight text extraction for text-based PDFs; scanned PDFs will fail and prompt OCR guidance.
function extractPdfText(pdfBuffer: Buffer) {
  const text = pdfBuffer.toString('latin1').match(/\(([^\)]{2,})\)/g)?.map((s) => s.slice(1, -1)).join(' ').replace(/\\[nrt]/g, ' ').trim() || ''
  if (!text) throw new Error('PDF extraction failed. OCR may be required for scanned/image-based reports.')
  return text
}

function fallbackExtract(text: string) {
  const score = text.match(/credit\s*score\D{0,20}(\d{3})/i)?.[1]
  return { creditScore: score ? Number(score) : null, reportDate: null, bureaus: [], totalOpenAccounts: 0, totalClosedAccounts: 0, totalDebt: 0, revolvingUtilization: 0, hardInquiries: 0, collections: 0, chargeOffs: 0, latePayments: 0, bankruptcies: 0, negativeItems: 0, accountSummary: [], fundingReadinessScore: 0, recommendedNextActions: ['Upload a text-based report or configure AI extraction for full parsing.'] }
}

async function extractStructured(text: string) {
  if (!process.env.OPENAI_API_KEY) return { data: fallbackExtract(text), aiUnavailable: true }
  const fields = 'creditScore, reportDate, bureaus, totalOpenAccounts, totalClosedAccounts, totalDebt, revolvingUtilization, hardInquiries, collections, chargeOffs, latePayments, bankruptcies, negativeItems, accountSummary, fundingReadinessScore, recommendedNextActions'
  const prompt = `Extract structured credit report JSON from the text below. Return JSON only (no markdown) with fields: ${fields}.\n\nReport text:\n${text.slice(0, 15000)}`
  const res = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: 'gpt-4.1-mini', input: prompt }) })
  if (!res.ok) throw new Error('AI temporarily unavailable. Please try again in a moment.')
  const payload: any = await res.json()
  const raw = payload?.output_text || payload?.output?.[0]?.content?.[0]?.text || '{}'
  return { data: JSON.parse(String(raw).trim().replace(/^```json/i, '').replace(/```$/i, '').trim()), aiUnavailable: false }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  const user = await requireUser(req, res)
  if (!user) return
  try {
    const pdfBuffer = await readMultipartPdf(req)
    const text = extractPdfText(pdfBuffer)
    const { data, aiUnavailable } = await extractStructured(text)
    let databaseSaved = false
    let databaseMessage = 'Backend/database not configured.'
    try {
      const db = supabaseAdmin() as any
      const { data: report, error } = await db.from('credit_reports').insert({ user_id: user.id, credit_score: asNumber(data.creditScore, 0), report_date: data.reportDate || null, bureaus: data.bureaus || [], total_open_accounts: asNumber(data.totalOpenAccounts, 0), total_closed_accounts: asNumber(data.totalClosedAccounts, 0), total_debt: asNumber(data.totalDebt, 0), revolving_utilization: asNumber(data.revolvingUtilization, 0), hard_inquiries: asNumber(data.hardInquiries, 0), collections: asNumber(data.collections, 0), charge_offs: asNumber(data.chargeOffs, 0), late_payments: asNumber(data.latePayments, 0), bankruptcies: asNumber(data.bankruptcies, 0), negative_items: asNumber(data.negativeItems, 0), funding_readiness_score: asNumber(data.fundingReadinessScore, 0), recommended_next_actions: data.recommendedNextActions || [], raw_text_excerpt: text.slice(0, 4000) }).select('id').single()
      if (error) throw error
      if (Array.isArray(data.accountSummary) && data.accountSummary.length) await db.from('credit_report_accounts').insert(data.accountSummary.map((a: any) => ({ report_id: report.id, user_id: user.id, account_name: a.accountName || a.name || 'Account' })))
      databaseSaved = true
      databaseMessage = 'Saved to Supabase.'
    } catch (dbError: any) {
      databaseMessage = dbError?.message || databaseMessage
    }
    return ok(res, { ...data, aiUnavailable, databaseSaved, databaseMessage })
  } catch (e: any) {
    const msg = String(e?.message || 'Failed to scan credit report.')
    if (msg.includes('File too large')) return err(res, msg, 413)
    if (msg.includes('Wrong file type')) return err(res, msg, 415)
    if (msg.includes('OCR')) return err(res, msg, 422)
    if (msg.includes('AI temporarily unavailable')) return err(res, msg, 503)
    return err(res, msg, 400)
  }
}
