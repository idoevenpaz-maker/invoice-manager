import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_KEYS } from '../constants'

export const useClientStore = create(
  persist(
    (set, get) => ({
      clients: [],

      addClient: (data) => {
        const client = {
          id: uuidv4(),
          name: '',
          company: '',
          email: '',
          phone: '',
          address: { line1: '', line2: '', city: '', postalCode: '', country: 'ישראל' },
          taxId: '',
          notes: '',
          createdAt: new Date().toISOString(),
          ...data,
        }
        set(s => ({ clients: [...s.clients, client] }))
        return client
      },

      updateClient: (id, patch) => {
        set(s => ({
          clients: s.clients.map(c =>
            c.id === id ? { ...c, ...patch } : c
          )
        }))
      },

      deleteClient: (id) => {
        set(s => ({ clients: s.clients.filter(c => c.id !== id) }))
      },

      getById: (id) => get().clients.find(c => c.id === id),
    }),
    { name: STORAGE_KEYS.CLIENTS }
  )
)
