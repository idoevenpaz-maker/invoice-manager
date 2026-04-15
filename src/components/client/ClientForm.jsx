import { useState } from 'react'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

export function ClientForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: { line1: '', city: '', postalCode: '', country: 'ישראל' },
    taxId: '',
    notes: '',
    ...initial,
  })

  const set = (patch) => setForm(f => ({ ...f, ...patch }))
  const setAddr = (patch) => setForm(f => ({ ...f, address: { ...f.address, ...patch } }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="שם" value={form.name} onChange={e => set({ name: e.target.value })} />
        <Input label="חברה" value={form.company} onChange={e => set({ company: e.target.value })} />
        <Input type="email" label="אימייל" value={form.email} onChange={e => set({ email: e.target.value })} />
        <Input label="טלפון" value={form.phone} onChange={e => set({ phone: e.target.value })} />
        <Input label="מס' עוסק / ח.פ." value={form.taxId} onChange={e => set({ taxId: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="כתובת"
          value={form.address.line1}
          onChange={e => setAddr({ line1: e.target.value })}
        />
        <Input
          label="עיר"
          value={form.address.city}
          onChange={e => setAddr({ city: e.target.value })}
        />
        <Input
          label="מיקוד"
          value={form.address.postalCode}
          onChange={e => setAddr({ postalCode: e.target.value })}
        />
      </div>

      <Textarea
        label="הערות"
        value={form.notes}
        onChange={e => set({ notes: e.target.value })}
      />

      <div className="flex justify-start gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>ביטול</Button>
        <Button onClick={() => onSave(form)}>שמור לקוח</Button>
      </div>
    </div>
  )
}
