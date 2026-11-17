import { useCallback, useEffect, useMemo, useState } from 'react'
import { UserFeaturesContext } from './UserFeaturesContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const TOKEN_KEY = 'tapyra_token'
const USER_KEY = 'tapyra_user'

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

function mapUsuarioParaEstado(usuario) {
  return {
    id: usuario.id,
    name: usuario.nome || usuario.name || '',
    email: usuario.email || '',
    phone: usuario.telefone || '',
    whatsappOptIn: Boolean(usuario.whatsapp_opt_in),
  }
}

export function UserFeaturesProvider({ children }) {
  const [profile, setProfile] = useState(initialProfile)
  const [currentUser, setCurrentUser] = useState(null)
  const [communityAlerts, setCommunityAlerts] = useState([])

  const aplicarSessao = useCallback((usuario, token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    }
    const mapped = mapUsuarioParaEstado(usuario)
    if (mapped.email || mapped.name) {
      localStorage.setItem(USER_KEY, JSON.stringify(mapped))
    }
    setCurrentUser({ id: mapped.id, name: mapped.name, email: mapped.email })
    setProfile((prev) => ({
      ...prev,
      name: mapped.name,
      email: mapped.email,
      phone: mapped.phone || prev.phone,
      notifications: {
        ...prev.notifications,
        whatsapp: mapped.whatsappOptIn,
      },
    }))
  }, [])

  // Restaura sessão ao atualizar a página (F5)
  // Restaura sessão ao atualizar a página (F5)
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    const savedUserRaw = localStorage.getItem(USER_KEY)
    const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : {}

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const apiUser = data.usuario || data.user || data.dados || data || {}
        aplicarSessao({
          id: apiUser.id || savedUser.id,
          nome: apiUser.nome || apiUser.name || savedUser.name,
          email: apiUser.email || savedUser.email,
          telefone: apiUser.telefone || savedUser.phone,
          whatsapp_opt_in: apiUser.whatsapp_opt_in ?? savedUser.whatsappOptIn,
        })
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      })
  }, [aplicarSessao])

  const loginUser = useCallback(
    async ({ email, password }) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.erro || 'E-mail ou senha inválidos.')
      }
      aplicarSessao(data.usuario, data.token)
      return data.usuario
    },
    [aplicarSessao]
  )

  const registerUser = useCallback(
    async ({ name, email, password, phone, acceptWhatsapp }) => {
      const res = await fetch(`${API_URL}/auth/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: name,
          email,
          senha: password,
          telefone: phone || undefined,
          aceitaWhatsapp: Boolean(acceptWhatsapp && phone),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.erro || 'Não foi possível criar a conta.')
      }
      aplicarSessao(data.usuario, data.token)
      return data.usuario
    },
    [aplicarSessao]
  )

  // Mantém compatibilidade caso algum componente ainda chame registerPreviewUser
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
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setCurrentUser(null)
    setProfile(initialProfile)
  }, [])

  const updateProfile = useCallback(async (nextProfile) => {
    setProfile(nextProfile)

    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    const aceita = Boolean(nextProfile?.notifications?.whatsapp)
    const telefone = (nextProfile?.phone || '').trim()

    if (aceita && !telefone) {
      throw new Error('Informe um número de telefone para ativar alertas por WhatsApp.')
    }

    const res = await fetch(`${API_URL}/usuarios/me/whatsapp`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        aceita,
        telefone: telefone || undefined,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao salvar preferências de WhatsApp.')
    }

    if (data.usuario) {
      const mapped = mapUsuarioParaEstado(data.usuario)
      setProfile((prev) => ({
        ...prev,
        phone: mapped.phone || prev.phone,
        notifications: {
          ...prev.notifications,
          whatsapp: mapped.whatsappOptIn,
        },
      }))
    }
  }, [])

  const addCommunityAlert = useCallback(
    async (alert) => {
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

      // Dispara notificação real via WhatsApp para os usuários inscritos no backend
      const token = localStorage.getItem(TOKEN_KEY)
      const res = await fetch(`${API_URL}/notificacoes/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nivel: alert.severity || 'Atenção',
          regiao: alert.location,
          mensagem:
            alert.description ||
            `Relato de foco/queimada registrado por ${currentUser.name} em ${alert.location}.`,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.erro || 'Alerta salvo na tela, mas houve falha no envio pelo WhatsApp.')
      }
    },
    [currentUser]
  )

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      currentUser,
      loginUser,
      registerUser,
      registerPreviewUser,
      logoutPreviewUser,
      communityAlerts,
      addCommunityAlert,
    }),
    [
      profile,
      updateProfile,
      currentUser,
      loginUser,
      registerUser,
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