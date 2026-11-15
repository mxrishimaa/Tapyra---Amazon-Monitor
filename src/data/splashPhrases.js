export const SPLASH_PHRASES = [
  'A Amazônia regula o clima do Brasil e influencia o planeta.',
  'A maior floresta tropical do mundo abriga uma biodiversidade única.',
  'Rios, florest e povos da Amazônia sustentam equilíbrio ambiental global.',
  'Proteger a Amazônia é cuidar do futuro das próximas gerações.',
  'A floresta armazena carbono e ajuda a conter o aquecimento global.',
  'Fauna e flora amazônicas formam um patrimônio natural insubstituível.',
  'Monitorar queimadas é um passo para preservar a vida na Amazônia.',
  'A Amazônia conecta água, ar e solo em um sistema vital para todos.',
]

const STORAGE_KEY = 'tapyra_splash_phrases_history'

export function pickSplashPhrase() {
  let history = []
  try {
    history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    history = []
  }

  // Evita as 4 últimas usadas
  const recent = history.slice(-4)
  let pool = SPLASH_PHRASES.map((text, index) => ({ text, index })).filter(
    (item) => !recent.includes(item.index)
  )

  // Se por algum motivo o pool ficou vazio, libera todas
  if (pool.length === 0) {
    pool = SPLASH_PHRASES.map((text, index) => ({ text, index }))
  }

  const chosen = pool[Math.floor(Math.random() * pool.length)]

  const nextHistory = [...history, chosen.index].slice(-4)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory))

  return chosen.text
}