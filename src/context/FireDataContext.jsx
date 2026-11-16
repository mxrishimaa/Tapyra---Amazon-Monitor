import { useState, useMemo, useCallback } from 'react'
import { FireDataContext } from '../hooks/useFireDataContext'

// Coordenadas de referência e raio usados para contar focos próximos de Manaus.
const MANAUS = { lat: -3.119, lng: -60.0217 }
const RAIO_KM = 700

// Calcula a distância em quilômetros entre dois pontos da superfície terrestre
// pela fórmula de Haversine; entradas e saídas usam graus e quilômetros.
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

// Mantém os dados de fogo e os indicadores disponíveis para toda a aplicação.
export function FireDataProvider({ children }) {
  // useState guarda valores que, quando atualizados, fazem a interface renderizar novamente.
  const [focos, setFocos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [atualizadoEm, setAtualizadoEm] = useState(null)

  // Publica uma lista recebida do mapa e registra o horário da atualização.
  const publicarFocos = useCallback((lista) => {
    setFocos(Array.isArray(lista) ? lista : [])
    setLoading(false)
    setError(null)
    setAtualizadoEm(new Date())
  }, [])

  // Informa às telas que uma consulta de dados começou.
  const publicarLoading = useCallback(() => {
    setLoading(true)
    setError(null)
  }, [])

  // Guarda a mensagem de falha e encerra o estado de carregamento.
  const publicarErro = useCallback((msg) => {
    setLoading(false)
    setError(msg || 'Erro ao carregar focos')
  }, [])

  // useMemo recalcula a lista filtrada somente quando os focos mudam.
  const focosManaus = useMemo(() => {
    return focos.filter((f) => {
      const d = distanciaKm(MANAUS.lat, MANAUS.lng, f.lat, f.lng)
      return d <= RAIO_KM
    })
  }, [focos])

  // Estima o número e o nível dos alertas usando limites sobre os focos locais.
  const alertas = useMemo(() => {
    const total = focosManaus.length
    const alta = focosManaus.filter((f) => f.confianca >= 80).length

    if (total >= 80 || alta >= 30) {
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

  // Objeto value é o conjunto de dados e operações que os consumidores do
  // contexto podem acessar.
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
    // Tudo que estiver dentro do Provider poderá ler e atualizar esses dados.
    <FireDataContext.Provider value={value}>
      {children}
    </FireDataContext.Provider>
  )
}
