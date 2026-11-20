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

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      throw new Error('É necessário estar logado para alterar a senha.')
    }

    const res = await fetch(`${API_URL}/usuarios/me/senha`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senhaAtual: currentPassword,
        novaSenha: newPassword,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.erro || 'Não foi possível alterar a senha.')
    }

    return data.mensagem || 'Senha alterada com sucesso.'
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

  const fetchRegions = useCallback(async () => {
    const res = await fetch(`${API_URL}/regioes`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.erro || 'Não foi possível carregar as regiões.')
    }
    return data.regioes || []
  }, [])

  const fetchMyRegions = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return []

    const res = await fetch(`${API_URL}/regioes/minhas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.erro || 'Não foi possível carregar suas regiões.')
    }
    return data.inscricoes || []
  }, [])

  const subscribeRegion = useCallback(async (regiaoId, nivelMinimo = 'atencao') => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      throw new Error('Entre na sua conta para acompanhar uma região.')
    }

    const res = await fetch(`${API_URL}/regioes/inscricao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        regiaoId: Number(regiaoId),
        nivelMinimo,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.erro || 'Não foi possível adicionar a região.')
    }
    return data.inscricao
  }, [])

  const unsubscribeRegion = useCallback(async (regiaoId) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      throw new Error('Entre na sua conta para remover uma região.')
    }

    const res = await fetch(`${API_URL}/regioes/inscricao/${regiaoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.erro || 'Não foi possível remover a região.')
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
      changePassword,
      updateProfile,
      currentUser,
      loginUser,
      registerUser,
      registerPreviewUser,
      logoutPreviewUser,
      communityAlerts,
      addCommunityAlert,
      fetchRegions,
      fetchMyRegions,
      subscribeRegion,
      unsubscribeRegion,
    }),
    [
      profile,
      changePassword,
      updateProfile,
      currentUser,
      loginUser,
      registerUser,
      registerPreviewUser,
      logoutPreviewUser,
      communityAlerts,
      addCommunityAlert,
      fetchRegions,
      fetchMyRegions,
      subscribeRegion,
      unsubscribeRegion,
    ]
  )

  return (
    <UserFeaturesContext.Provider value={value}>
      {children}
    </UserFeaturesContext.Provider>
  )
}