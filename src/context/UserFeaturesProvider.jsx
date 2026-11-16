import { useCallback, useMemo, useState } from 'react'
import { UserFeaturesContext } from './UserFeaturesContext'

const initialProfile = {
  name: '',
  email: '',
  phone: '',
  notifications: {
    email: false,
    whatsapp: false,
    browser: false,
  },
  regions: [],
}

export function UserFeaturesProvider({ children }) {
  const [profile, setProfile] = useState(initialProfile)
  const [currentUser, setCurrentUser] = useState(null)
  const [communityAlerts, setCommunityAlerts] = useState([])

  const registerPreviewUser = useCallback((user) => {
    const account = { name: user.name, email: user.email }
    setCurrentUser(account)
    setProfile((currentProfile) => ({
      ...currentProfile,
      name: account.name,
      email: account.email,
    }))
  }, [])

  const logoutPreviewUser = useCallback(() => {
    setCurrentUser(null)
    setProfile(initialProfile)
  }, [])

  const updateProfile = useCallback((nextProfile) => {
    setProfile(nextProfile)
  }, [])

  const addCommunityAlert = useCallback((alert) => {
    if (!currentUser) {
      throw new Error('É necessário entrar na conta para criar um alerta.')
    }

    const newAlert = {
      ...alert,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      author: currentUser.name,
    }

    setCommunityAlerts((currentAlerts) => [newAlert, ...currentAlerts])
  }, [currentUser])

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      currentUser,
      registerPreviewUser,
      logoutPreviewUser,
      communityAlerts,
      addCommunityAlert,
    }),
    [
      profile,
      updateProfile,
      currentUser,
      registerPreviewUser,
      logoutPreviewUser,
      communityAlerts,
      addCommunityAlert,
    ]
  )

  return (
    <UserFeaturesContext.Provider value={value}>
      {children}
    </UserFeaturesContext.Provider>
  )
}
