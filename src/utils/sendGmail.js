import { useAuthStore } from '../store/useAuthStore'

function buildRawEmail({ toEmail, toName, subject, html }) {
  const to = toName ? `"${toName}" <${toEmail}>` : toEmail

  // Encode subject as UTF-8 base64 (RFC 2047) for Hebrew support
  const encodedSubject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`

  // Encode HTML body as base64
  const encodedBody = btoa(unescape(encodeURIComponent(html)))

  const message = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodedBody,
  ].join('\r\n')

  // Base64url encode the full message
  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function sendGmailEmail({ toEmail, toName, subject, html }) {
  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    throw new Error('NO_TOKEN')
  }

  const raw = buildRawEmail({ toEmail, toName, subject, html })

  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    if (response.status === 401) throw new Error('NO_TOKEN')
    throw new Error(err.error?.message || 'שגיאה בשליחת האימייל')
  }
}
