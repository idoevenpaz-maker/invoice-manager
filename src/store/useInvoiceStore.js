import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_KEYS } from '../constants'
import { generateNumber } from '../utils/numbering'
import { useSettingsStore } from './useSettingsStore'

export const useInvoiceStore = create(
  persist(
    (set, get) => ({
      invoices: [],

      addInvoice: (data) => {
        const settings = useSettingsStore.getState()
        const num = settings.bumpInvoiceNumber()
        const number = generateNumber(settings.invoicePrefix, num)

        const today = new Date().toISOString().split('T')[0]
        const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const invoice = {
          id: uuidv4(),
          number,
          status: 'draft',
          clientId: null,
          issueDate: today,
          dueDate,
          lineItems: [],
          taxRate: settings.defaultTaxRate,
          discountType: 'none',
          discountValue: 0,
          notes: '',
          currency: settings.currency,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
        }
        set(s => ({ invoices: [...s.invoices, invoice] }))
        return invoice
      },

      updateInvoice: (id, patch) => {
        set(s => ({
          invoices: s.invoices.map(inv =>
            inv.id === id
              ? { ...inv, ...patch, updatedAt: new Date().toISOString() }
              : inv
          )
        }))
      },

      deleteInvoice: (id) => {
        set(s => ({ invoices: s.invoices.filter(inv => inv.id !== id) }))
      },

      setStatus: (id, status) => {
        get().updateInvoice(id, { status })
      },

      getById: (id) => get().invoices.find(inv => inv.id === id),

      getByClient: (clientId) => get().invoices.filter(inv => inv.clientId === clientId),
    }),
    { name: STORAGE_KEYS.INVOICES }
  )
)
