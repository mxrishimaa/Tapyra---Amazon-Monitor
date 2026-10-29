import { useState, useEffect, useCallback } from 'react'

export function useFireData(apiKey, area = '-75,-15,-45,5', days = '1') {
  const [fires, setFires] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFires = useCallback(async () => {
    if (!apiKey || apiKey === 'SUA_NASA_FIRMS_MAP_KEY') {
      setError('MAP_KEY não configurada')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Área padrão ≈ Amazônia (west,south,east,north)
      // Formato sem data final: retorna os últimos N dias
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/${area}/${days}`

      const response = await fetch(url, { cache: 'no-store' })

      if (!response.ok) {
        throw new Error(`Falha na API FIRMS (${response.status})`)
      }

      const csvData = await response.text()

      if (csvData.startsWith('Invalid') || csvData.includes('MAP_KEY')) {
        throw new Error('MAP_KEY inválida')
      }

      const parsedFires = parseCSV(csvData)
      setFires(parsedFires)
    } catch (err) {
      setError(err.message)
      setFires([])
    } finally {
      setLoading(false)
    }
  }, [apiKey, area, days])

  useEffect(() => {
    fetchFires()
  }, [fetchFires])

  return { fires, loading, error, refetch: fetchFires }
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n')
  if (lines.length <= 1) return []

  const headers = lines[0].split(',').map((h) => h.trim())

  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(',')
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index]?.trim()
        return obj
      }, {})
    })
    .filter((f) => f.latitude && f.longitude)
}