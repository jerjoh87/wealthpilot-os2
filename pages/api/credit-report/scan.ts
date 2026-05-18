import type { NextApiRequest, NextApiResponse } from 'next'
import { err, methodNotAllowed, ok, requireUser } from '../../../lib/api'
import { sendBadRequest, sendNotConfigured } from '../../../lib/api-errors'
import { maxPdfBytes, validateCreditReportTextLength, validatePdfFileSize } from '../../../lib/ai-usage-guard'
import { scanCreditReportText } from '../../../lib/ai-provider'

export const config = { api: { bodyParser: false } }
const MAX_FILE_SIZE_BYTES = maxPdfBytes()

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
    const uploadError = validatePdfFileSize(size)
    if (uploadError) throw new Error(uploadError)
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  const user = await requireUser(req, res)
  if (!user) return
  try {
    const pdfBuffer = await readMultipartPdf(req)
    const text = extractPdfText(pdfBuffer)
    const textLengthError = validateCreditReportTextLength(text)
    if (textLengthError) return sendBadRequest(res, textLengthError)
    const result = await scanCreditReportText(text)
    if ((result as any)?.notConfigured) return sendNotConfigured(res, 'AI credit scan is not configured yet.')
    const data = (result as any)?.data || result
    return ok(res, data)
  } catch (e: any) {
    const msg = String(e?.message || 'Failed to scan credit report.')
    if (msg.includes('File too large')) return err(res, msg, 413)
    if (msg.includes('Wrong file type')) return err(res, msg, 415)
    if (msg.includes('OCR')) return err(res, msg, 422)
    if (msg.includes('AI temporarily unavailable')) return err(res, msg, 503)
    return err(res, msg, 400)
  }
}
