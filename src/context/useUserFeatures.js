import { useContext } from 'react'
import { UserFeaturesContext } from './UserFeaturesContext.js'

export function useUserFeatures() {
  const context = useContext(UserFeaturesContext)
  if (!context) {
    throw new Error('useUserFeatures deve ser usado dentro de UserFeaturesProvider')
  }
  return context
}
