const MAP_KEY = import.meta.env.VITE_FIRMS_MAP_KEY

/**
 * Busca focos de calor do NASA FIRMS para uma área (bounding box)
 * @param {Object} bounds - objeto com west, south, east, north
 * @param {number} dayRange - quantos dias para trás (1 = últimas 24h)
 * @param {string} source - sensor (VIIRS_SNPP_NRT é o mais usado)
 */
export async function fetchFocosFIRMS(bounds, dayRange = 1, source = 'VIIRS_SNPP_NRT') {
  if (!MAP_KEY) {
    throw new Error('VITE_FIRMS_MAP_KEY não configurada no arquivo .env')
  }

  const { west, south, east, north } = bounds
  const area = `${west},${south},${east},${north}`

  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/${source}/${area}/${dayRange}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erro na API FIRMS: ${response.status}`)
  }

  const csvText = await response.text()
  return parseCSV(csvText)
}

/**
 * Converte o CSV retornado pela API em um array de objetos
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',')

  return lines.slice(1).map((line, index) => {
    const values = line.split(',')
    const obj = {}

    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim()
    })

    return {
      id: `${obj.latitude}-${obj.longitude}-${index}`,
      lat: parseFloat(obj.latitude),
      lng: parseFloat(obj.longitude),
      confianca: obj.confidence === 'high' ? 90 : obj.confidence === 'nominal' ? 70 : 50,
      satelite: obj.satellite || obj.instrument || sourceLabel(obj),
      data: `${obj.acq_date || ''} ${obj.acq_time || ''}`.trim(),
      brilho: obj.bright_ti4 || obj.brightness || null,
      frp: obj.frp || null, // Fire Radiative Power
    }
  }).filter(f => !isNaN(f.lat) && !isNaN(f.lng))
}

function sourceLabel(obj) {
  if (obj.instrument) return obj.instrument
  return 'VIIRS'
}