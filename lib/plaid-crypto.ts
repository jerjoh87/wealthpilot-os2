import crypto from 'crypto'

const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getEncryptionKey() {
  const rawKey = process.env.PLAID_TOKEN_ENCRYPTION_KEY
  if (!rawKey) throw new Error('PLAID_TOKEN_ENCRYPTION_KEY is required')

  const asBuffer = Buffer.from(rawKey, 'utf8')
  if (asBuffer.length === 32) return asBuffer

  return crypto.createHash('sha256').update(rawKey).digest()
}

export function encryptPlaidToken(token: string) {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext.toString('hex')}`
}

export function decryptPlaidToken(encrypted: string) {
  const [ivHex, authTagHex, ciphertextHex] = encrypted.split(':')
  if (!ivHex || !authTagHex || !ciphertextHex) throw new Error('Invalid encrypted token format')

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const ciphertext = Buffer.from(ciphertextHex, 'hex')

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Invalid encrypted token payload')
  }

  const key = getEncryptionKey()
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return plaintext.toString('utf8')
}
