import { useState, useEffect, useCallback } from 'react'
import { fetchFocosFIRMS } from '../services/firms'

// Limites geográficos aproximados da Amazônia Legal, usados na consulta à API.
const AREA_AMAZONIA = {
  west: -74,
  south: -15,
  east: -44,
  north: 5,
}

// Hook que consulta os focos e prepara os números exibidos na página inicial.
export function useHomeStats() {
  // Estado inicial também descreve o que a interface mostra antes da resposta.
  const [stats, setStats] = useState({
    focos24h: null,
    qualidadeAr: '—',
    alertasAtivos: null,
    alertasDetalhe: 'Carregando…',
    sensoresOnline: '0 / 3',
    loading: true,
    error: null,
    atualizadoEm: null,
  })

  // Busca dados FIRMS e atualiza indicadores; useCallback estabiliza a função
  // para que o efeito abaixo não precise ser reiniciado a cada renderização.
  const carregar = useCallback(async () => {
    setStats((s) => ({ ...s, loading: true, error: null }))

    try {
      const focos = await fetchFocosFIRMS(AREA_AMAZONIA, 1, 'VIIRS_SNPP_NRT')

      const total = focos.length
      const altaConfianca = focos.filter((f) => f.confianca >= 80).length

      // Regras simples de alerta (podem ser refinadas depois)
      let alertas = 0
      let detalhe = 'Nenhum alerta crítico'
      if (total >= 500) {
        alertas = 3
        detalhe = '2 Atenção · 1 Crítico'
      } else if (total >= 200) {
        alertas = 2
        detalhe = '1 Atenção · 1 Alerta'
      } else if (total >= 50) {
        alertas = 1
        detalhe = '1 Atenção'
      }

      setStats({
        focos24h: total,
        qualidadeAr: '—', // sem sensores ainda
        alertasAtivos: alertas,
        alertasDetalhe: detalhe,
        sensoresOnline: '0 / 3',
        loading: false,
        error: null,
        atualizadoEm: new Date(),
        altaConfianca,
      })
    } catch (err) {
      console.error(err)
      setStats((s) => ({
        ...s,
        loading: false,
        error: err.message || 'Falha ao atualizar estatísticas',
      }))
    }
  }, [])

  // Executa a primeira consulta ao montar e repete a cada cinco minutos.
  useEffect(() => {
    carregar()

    // Atualiza a cada 5 minutos
    const id = setInterval(carregar, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [carregar])

  // Retorna os indicadores e a função que permite solicitar uma nova consulta.
  return { ...stats, refetch: carregar }
}

// Formata números de acordo com convenções brasileiras; valores ausentes viram traço.
function formatNumber(n) {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('pt-BR')
}

export { formatNumber }