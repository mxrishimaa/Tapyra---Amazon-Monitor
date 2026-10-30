import { createContext, useContext, useState, useMemo, useCallback } from 'react'

const FireDataContext = createContext(null)

// Manaus
const MANAUS = { lat: -3.119, lng: -60.0217 }
const RAIO_KM = 300

function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function FireDataProvider({ children }) {
  const [focos, setFocos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [atualizadoEm, setAtualizadoEm] = useState(null)

  const publicarFocos = useCallback((lista) => {
    setFocos(Array.isArray(lista) ? lista : [])
    setLoading(false)
    setError(null)
    setAtualizadoEm(new Date())
  }, [])

  const publicarLoading = useCallback(() => {
    setLoading(true)
    setError(null)
  }, [])

  const publicarErro = useCallback((msg) => {
    setLoading(false)
    setError(msg || 'Erro ao carregar focos')
  }, [])

  // Focos dentro de 300 km de Manaus
  const focosManaus = useMemo(() => {
    return focos.filter((f) => {
      const d = distanciaKm(MANAUS.lat, MANAUS.lng, f.lat, f.lng)
      return d <= RAIO_KM
    })
  }, [focos])

  // Alertas simples com base nos focos próximos de Manaus
  const alertas = useMemo(() => {
    const total = focosManaus.length
    const alta = focosManaus.filter((f) => f.confianca >= 90).length

    if (total >= 90 || alta >= 30) {
      return { ativos: 3, detalhe: '2 Atenção · 1 Crítico' }
    }
    if (total >= 30 || alta >= 10) {
      return { ativos: 2, detalhe: '1 Atenção · 1 Alerta' }
    }
    if (total >= 10) {
      return { ativos: 1, detalhe: '1 Atenção' }
    }
    return { ativos: 0, detalhe: 'Nenhum alerta' }
  }, [focosManaus])

  const value = {
    focos,
    focosManaus,
    totalVisivel: focos.length,
    totalManauskm: focosManaus.length,
    alertas,
    loading,
    error,
    atualizadoEm,
    publicarFocos,
    publicarLoading,
    publicarErro,
  }

  return (
    <FireDataContext.Provider value={value}>
      {children}
    </FireDataContext.Provider>
  )
}

export function useFireDataContext() {
  const ctx = useContext(FireDataContext)
  if (!ctx) {
    throw new Error('useFireDataContext deve ser usado dentro de FireDataProvider')
  }
  return ctx
}