import { create } from 'zustand'
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../firebase'

export const useClientStore = create((set, get) => ({
  clients: [],
  loading: true,
  uid: null,
  _unsubscribe: null,

  init: (uid) => {
    const prev = get()._unsubscribe
    if (prev) prev()

    if (!uid) {
      set({ clients: [], uid: null, loading: false, _unsubscribe: null })
      return
    }

    set({ uid, loading: true })
    const q = collection(db, `users/${uid}/clients`)

    const unsubscribe = onSnapshot(q, (snap) => {
      const clients = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      set({ clients, loading: false })
    })

    set({ _unsubscribe: unsubscribe })
  },

  addClient: (data) => {
    const { uid } = get()
    if (!uid) return null

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

    setDoc(doc(db, `users/${uid}/clients/${client.id}`), client).catch(console.error)
    return client
  },

  updateClient: (id, patch) => {
    const { uid } = get()
    if (!uid) return
    updateDoc(doc(db, `users/${uid}/clients/${id}`), patch).catch(console.error)
  },

  deleteClient: (id) => {
    const { uid } = get()
    if (!uid) return
    deleteDoc(doc(db, `users/${uid}/clients/${id}`)).catch(console.error)
  },

  getById: (id) => get().clients.find(c => c.id === id),
}))
