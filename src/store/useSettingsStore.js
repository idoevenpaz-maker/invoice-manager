import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../constants'

const defaultSettings = {
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  address: { line1: '', line2: '', city: '', postalCode: '', country: 'ישראל' },
  taxId: '',
  logo: null,
  currency: 'ILS',
  defaultTaxRate: 17,
  invoicePrefix: 'חשב-',
  receiptPrefix: 'קבלה-',
  nextInvoiceNumber: 1,
  nextReceiptNumber: 1,
  paymentInfo: '',
  invoiceFooter: '',
  dateFormat: 'dd/MM/yyyy',
}

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      ...defaultSettings,

      updateSettings: (patch) => set(patch),

      bumpInvoiceNumber: () => {
        const current = get().nextInvoiceNumber
        set({ nextInvoiceNumber: current + 1 })
        return current
      },

      bumpReceiptNumber: () => {
        const current = get().nextReceiptNumber
        set({ nextReceiptNumber: current + 1 })
        return current
      },
    }),
    { name: STORAGE_KEYS.SETTINGS }
  )
)
