import { useState } from 'react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'
import { sendDocumentEmail } from '../../utils/sendEmail'

export function SendEmailModal({ isOpen, onClose, emailData }) {
  const [toEmail, setToEmail] = useState(emailData?.toEmail || '')
  const [status, setStatus]   = useState(null) // null | 'sending' | 'ok' | 'error'
  const [error, setError]     = useState('')

  // Reset when modal opens with new data
  const handleOpen = () => {
    setToEmail(emailData?.toEmail || '')
    setStatus(null)
    setError('')
  }

  const handleSend = async () => {
    if (!toEmail) {
      setError('נא להזין כתובת אימייל')
      return
    }
    setStatus('sending')
    setError('')
    try {
      await sendDocumentEmail({ ...emailData, toEmail })
      setStatus('ok')
    } catch (e) {
      setStatus('error')
      setError(e.message || 'שגיאה בשליחת האימייל')
    }
  }

  const handleClose = () => {
    setStatus(null)
    setError('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="שליחה באימייל"
      size="sm"
    >
      {status === 'ok' ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold text-gray-800 mb-1">האימייל נשלח בהצלחה!</p>
          <p className="text-sm text-gray-500 mb-6">{toEmail}</p>
          <Button onClick={handleClose}>סגור</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="שלח אל"
            type="email"
            placeholder="email@example.com"
            value={toEmail}
            onChange={e => { setToEmail(e.target.value); setError('') }}
            error={error}
          />

          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <span className="font-medium text-gray-700">נושא: </span>
            {emailData?.subject}
          </div>

          <p className="text-xs text-gray-400">
            האימייל יכלול את כל פרטי המסמך כ-HTML מעוצב.
          </p>

          <div className="flex justify-start gap-3 pt-1">
            <Button variant="secondary" onClick={handleClose}>ביטול</Button>
            <Button onClick={handleSend} disabled={status === 'sending'}>
              {status === 'sending' ? 'שולח...' : '📧 שלח'}
            </Button>
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </Modal>
  )
}
