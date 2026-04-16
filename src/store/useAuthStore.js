import { create } from 'zustand'

// Holds the Google OAuth access token in memory.
// Lost on page refresh — user needs to sign out and back in to get a new one.
export const useAuthStore = create((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAccessToken: () => set({ accessToken: null }),
}))
