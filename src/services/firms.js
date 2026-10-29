const MAP_KEY = import.meta.env.VITE_FIRMS_MAP_KEY

export async function fetchFocosFIRMS(
  bounds,
  dayRange = 2, // 2 dias aumenta chance de ter dados
  source = 'VIIRS_SNPP_NRT',
  signal
) {
  if (!MAP_KEY) {
    throw new Error('VITE_FIRMS_MAP_KEY não configurada no arquivo .env')
  }

  const { west, south, east, north } = bounds
  const area = `${west},${south},${east},${north}`

  const base = import.meta.env.DEV
    ? '/api/firms'
    : 'https://firms.modaps.eosdis.nasa.gov'

  const url = `${base}/api/area/csv/${MAP_KEY}/${source}/${area}/${dayRange}`

  console.log('[FIRMS] URL:', url)

  const response = await fetch(url, { signal, cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`API FIRMS: HTTP ${response.status}`)
  }

  const csvText = await response.text()
  console.log('[FIRMS] Tamanho resposta:', csvText.length, 'chars')
  console.log('[FIRMS] Início da resposta:\n', csvText.slice(0, 300))

  if (
    csvText.startsWith('Invalid') ||
    csvText.toLowerCase().includes('map_key') ||
    csvText.toLowerCase().includes('error')
  ) {
    throw new Error('MAP_KEY inválida ou resposta de erro da NASA')
  }

  const focos = parseCSV(csvText)
  console.log('[FIRMS] Focos parseados:', focos.length)

  return focos
}

/**
 * Parse robusto do CSV do FIRMS
 * Formato típico VIIRS:
 * latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
 */
function parseCSV(csvText) {
  const raw = csvText.replace(/^\uFEFF/, '').trim() // remove BOM se houver
  if (!raw) return []

  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) {
    console.warn('[FIRMS] CSV sem linhas de dados. Linhas:', lines.length)
    return []
  }

  // Detecta se a 1ª linha é cabeçalho
  const first = lines[0].toLowerCase()
  const hasHeader = first.includes('latitude') && first.includes('longitude')

  let headers = []
  let dataLines = []

  if (hasHeader) {
    headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))
    dataLines = lines.slice(1)
    console.log('[FIRMS] Headers:', headers)
  } else {
    // Sem cabeçalho: usa ordem padrão VIIRS NRT
    headers = [
      'latitude',
      'longitude',
      'bright_ti4',
      'scan',
      'track',
      'acq_date',
      'acq_time',
      'satellite',
      'instrument',
      'confidence',
      'version',
      'bright_ti5',
      'frp',
      'daynight',
    ]
    dataLines = lines
    console.log('[FIRMS] Sem header — usando ordem padrão VIIRS')
  }

  const latIdx = headers.indexOf('latitude')
  const lngIdx = headers.indexOf('longitude')

  if (latIdx === -1 || lngIdx === -1) {
    console.error('[FIRMS] Colunas latitude/longitude não encontradas:', headers)
    // Fallback posicional: lat=0, lng=1
  }

  const focos = []

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim()
    if (!line) continue

    // split simples (FIRMS não usa vírgula dentro dos campos)
    const values = line.split(',').map((v) => v.trim().replace(/"/g, ''))

    const lat = parseFloat(values[latIdx >= 0 ? latIdx : 0])
    const lng = parseFloat(values[lngIdx >= 0 ? lngIdx : 1])

    if (isNaN(lat) || isNaN(lng)) {
      if (i < 3) console.warn('[FIRMS] Linha inválida:', line.slice(0, 80))
      continue
    }

    // Monta objeto por header quando possível
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = values[idx]
    })

    const rawConf = String(obj.confidence ?? values[9] ?? '').toLowerCase()
    let confianca = 50
    if (rawConf === 'h' || rawConf === 'high') confianca = 90
    else if (rawConf === 'n' || rawConf === 'nominal') confianca = 70
    else if (rawConf === 'l' || rawConf === 'low') confianca = 40
    else {
      const n = parseInt(rawConf, 10)
      if (!isNaN(n)) confianca = n
    }

    const acqTime = String(obj.acq_time || values[6] || '').padStart(4, '0')
    const hora =
      acqTime.length >= 4 ? `${acqTime.slice(0, 2)}:${acqTime.slice(2, 4)}` : ''

    focos.push({
      id: `${lat}-${lng}-${i}`,
      lat,
      lng,
      confianca,
      satelite: obj.satellite || obj.instrument || values[7] || 'VIIRS',
      data: `${obj.acq_date || values[5] || ''} ${hora}`.trim(),
      frp: obj.frp || values[12] || null,
    })
  }

  return focos
}