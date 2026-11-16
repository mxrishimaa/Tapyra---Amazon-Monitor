import { createContext, useContext } from 'react'

export const FireDataContext = createContext(null)

export function useFireDataContext() {
  const ctx = useContext(FireDataContext)
  if (!ctx) {
    throw new Error('useFireDataContext deve ser usado dentro de FireDataProvider')
  }
  return ctx
}
