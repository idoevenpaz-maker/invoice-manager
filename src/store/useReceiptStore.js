import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_KEYS } from '../constants'
import { generateNumber } from '../utils/numbering'
import { useSettingsStore } from './useSettingsStore'

export const useReceiptStore = create(
  persist(
    (set, get) => ({
      receipts: [],

      addReceipt: (data) => {
        const settings = useSettingsStore.getState()
        const num = settings.bumpReceiptNumber()
        const number = generateNumber(settings.receiptPrefix, num)

        const today = new Date().toISOString().split('T')[0]

        const receipt = {
          id: uuidv4(),
          number,
          invoiceId: null,
          clientId: null,
          date: today,
          items: [],
          paymentMethod: 'cash',
          paymentReference: '',
          notes: '',
          currency: settings.currency,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
        }
        set(s => ({ receipts: [...s.receipts, receipt] }))
        return receipt
      },

      updateReceipt: (id, patch) => {
        set(s => ({
          receipts: s.receipts.map(r =>
            r.id === id
              ? { ...r, ...patch, updatedAt: new Date().toISOString() }
              : r
          )
        }))
      },

      deleteReceipt: (id) => {
        set(s => ({ receipts: s.receipts.filter(r => r.id !== id) }))
      },

      getById: (id) => get().receipts.find(r => r.id === id),

      getByInvoice: (invoiceId) => get().receipts.filter(r => r.invoiceId === invoiceId),
    }),
    { name: STORAGE_KEYS.RECEIPTS }
  )
)
