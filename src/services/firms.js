// Chave de acesso à API FIRMS, lida da variável de ambiente do Vite.
const MAP_KEY = import.meta.env.VITE_FIRMS_MAP_KEY

// Consulta a API de focos de calor e converte a resposta CSV em objetos JavaScript.
export async function fetchFocosFIRMS(
  bounds,
  dayRange = 2, // 2 dias aumenta chance de ter dados
  source = 'VIIRS_SNPP_NRT',
  signal
) {
  // Sem chave não é possível autenticar a consulta; informa a configuração necessária.
  if (!MAP_KEY) {
    throw new Error('VITE_FIRMS_MAP_KEY não configurada no arquivo .env')
  }

  // Bounds define os limites do retângulo geográfico pedido à API.
  const { west, south, east, north } = bounds
  const area = `${west},${south},${east},${north}`

  // Em desenvolvimento, o Vite encaminha a chamada pelo proxy local para evitar
  // problemas de origem; em produção, a aplicação consulta o servidor FIRMS.
  const base = import.meta.env.DEV
    ? '/api/firms'
    : 'https://firms.modaps.eosdis.nasa.gov'

  const url = `${base}/api/area/csv/${MAP_KEY}/${source}/${area}/${dayRange}`

  console.log('[FIRMS] URL:', url)

  // fetch realiza a chamada de rede; signal permite cancelar uma requisição antiga.
  const response = await fetch(url, { signal, cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`API FIRMS: HTTP ${response.status}`)
  }

  // A resposta chega como texto CSV e é validada antes de ser interpretada.
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

  // Converte cada linha do CSV em um objeto com coordenadas, data e confiança.
  const focos = parseCSV(csvText)
  console.log('[FIRMS] Focos parseados:', focos.length)

  return focos
}

/**
 * Interpreta o CSV do FIRMS, com ou sem cabeçalho.
 * Formato típico VIIRS:
 * latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
 */
function parseCSV(csvText) {
  // BOM é um caractere invisível que alguns arquivos acrescentam no início.
  const raw = csvText.replace(/^\uFEFF/, '').trim() // remove BOM se houver
  if (!raw) return []

  // Separa as linhas e descarta linhas vazias antes de identificar colunas.
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) {
    console.warn('[FIRMS] CSV sem linhas de dados. Linhas:', lines.length)
    return []
  }

  // Detecta se a 1ª linha é cabeçalho
  // Escolhe os nomes de coluna do arquivo ou a ordem padrão do formato VIIRS.
  const first = lines[0].toLowerCase()
  const hasHeader = first.includes('latitude') && first.includes('longitude')

  let headers
  let dataLines

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

  // Localiza as colunas de latitude e longitude pelo nome para tolerar
  // mudanças na ordem das colunas.
  const latIdx = headers.indexOf('latitude')
  const lngIdx = headers.indexOf('longitude')

  if (latIdx === -1 || lngIdx === -1) {
    console.error('[FIRMS] Colunas latitude/longitude não encontradas:', headers)
    // Fallback posicional: lat=0, lng=1
  }

  // Cada item de focos será um objeto normalizado, pronto para usar na interface.
  const focos = []

  // Processa uma linha por vez; registros sem coordenadas válidas são ignorados.
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
    // Constrói um objeto cujas propriedades usam os nomes das colunas do CSV.
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = values[idx]
    })

    // FIRMS pode expressar confiança como letra ou número; converte ambos
    // para uma escala numérica usada por mapas e regras de alerta.
    const rawConf = String(obj.confidence ?? values[9] ?? '').toLowerCase()
    let confianca = 60
    if (rawConf === 'h' || rawConf === 'high') confianca = 90
    else if (rawConf === 'n' || rawConf === 'nominal') confianca = 70
    else if (rawConf === 'l' || rawConf === 'low') confianca = 40
    else {
      const n = parseInt(rawConf, 10)
      if (!isNaN(n)) confianca = n
    }

    // Ajusta a hora para quatro dígitos e a apresenta como HH:MM.
    const acqTime = String(obj.acq_time || values[6] || '').padStart(4, '0')
    const hora =
      acqTime.length >= 4 ? `${acqTime.slice(0, 2)}:${acqTime.slice(2, 4)}` : ''

    // Mantém apenas os campos necessários no restante da aplicação.
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