import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Verify a GitHub-style HMAC-SHA256 webhook signature.
 * Header format: "sha256=<hex_digest>"
 */
export function verifyGithubSignature(secret, rawBody, signatureHeader) {
  if (!signatureHeader) return false

  const digest = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  const sigBuffer = Buffer.from(signatureHeader, 'utf8')
  const digestBuffer = Buffer.from(digest, 'utf8')

  if (sigBuffer.length !== digestBuffer.length) return false
  return timingSafeEqual(sigBuffer, digestBuffer)
}

/**
 * Verify a Slack-style HMAC-SHA256 request signature.
 * Slack format: "v0=<hex_digest>" over "v0:<timestamp>:<body>"
 */
export function verifySlackSignature(secret, rawBody, timestamp, signatureHeader) {
  if (!signatureHeader || !timestamp) return false

  // Reject requests older than 5 minutes
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - Number(timestamp)) > 300) return false

  const baseString = `v0:${timestamp}:${rawBody}`
  const digest = `v0=${createHmac('sha256', secret).update(baseString).digest('hex')}`

  const sigBuffer = Buffer.from(signatureHeader, 'utf8')
  const digestBuffer = Buffer.from(digest, 'utf8')

  if (sigBuffer.length !== digestBuffer.length) return false
  return timingSafeEqual(sigBuffer, digestBuffer)
}

/**
 * Verify a generic bearer token for the /run endpoint.
 * Compares WEBHOOK_SECRET against Authorization: Bearer <token>
 */
export function verifyBearerToken(secret, authHeader) {
  if (!authHeader) return false
  if (!authHeader.startsWith('Bearer ')) return false

  const token = authHeader.slice('Bearer '.length)
  const tokenBuffer = Buffer.from(token, 'utf8')
  const secretBuffer = Buffer.from(secret, 'utf8')

  if (tokenBuffer.length !== secretBuffer.length) return false
  return timingSafeEqual(tokenBuffer, secretBuffer)
}
