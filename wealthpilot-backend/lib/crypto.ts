import crypto from 'crypto'

const ALGO = 'aes-256-gcm'
const IV_LEN = 12

function keyFromEnv() {
  const secret = process.env.PLAID_TOKEN_ENCRYPTION_KEY
  if (!secret) throw new Error('PLAID_TOKEN_ENCRYPTION_KEY is not set')
  return crypto.createHash('sha256').update(secret).digest()
}

export function encryptPlaidToken(plainText: string): string {
  const iv = crypto.randomBytes(IV_LEN)
  const key = keyFromEnv()
  const cipher = crypto.createCipheriv(ALGO, key, iv)

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decryptPlaidToken(cipherText: string): string {
  const [ivB64, tagB64, dataB64] = cipherText.split(':')
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Invalid encrypted token format')

  const key = keyFromEnv()
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}
