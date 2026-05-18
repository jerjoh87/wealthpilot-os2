const bytesPerMb = 1024 * 1024

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

export const AI_USAGE_LIMITS = {
  maxPdfMb: parsePositiveInt(process.env.AI_MAX_PDF_MB, 10),
  maxReportChars: parsePositiveInt(process.env.AI_MAX_REPORT_CHARS, 60_000),
  maxChatChars: parsePositiveInt(process.env.AI_MAX_CHAT_CHARS, 4_000),
}

export const maxPdfBytes = () => AI_USAGE_LIMITS.maxPdfMb * bytesPerMb

export function validateChatMessageLength(message: string) {
  if (message.length > AI_USAGE_LIMITS.maxChatChars) {
    return `Your message is too long. Maximum is ${AI_USAGE_LIMITS.maxChatChars.toLocaleString()} characters.`
  }
  return null
}

export function validatePdfFileSize(sizeBytes: number) {
  if (sizeBytes > maxPdfBytes()) {
    return `PDF is too large. Maximum upload size is ${AI_USAGE_LIMITS.maxPdfMb}MB.`
  }
  return null
}

export function validateCreditReportTextLength(text: string) {
  if (text.length > AI_USAGE_LIMITS.maxReportChars) {
    return `Credit report text is too long to scan safely. Maximum is ${AI_USAGE_LIMITS.maxReportChars.toLocaleString()} characters.`
  }
  return null
}
