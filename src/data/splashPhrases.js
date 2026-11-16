// Frases possíveis para a tela inicial; os índices ajudam a registrar o histórico.
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

// Escolhe uma frase aleatória, evitando repetir as quatro últimas guardadas
// no navegador do usuário.
export function pickSplashPhrase() {
  let history = []
  // localStorage persiste no navegador; try/catch protege contra conteúdo inválido
  // ou indisponibilidade desse armazenamento.
  try {
    history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    history = []
  }

  // Separa os índices recentes e prepara opções que não estão nesse histórico.
  const recent = history.slice(-4)
  let pool = SPLASH_PHRASES.map((text, index) => ({ text, index })).filter(
    (item) => !recent.includes(item.index)
  )

  // Se todas as opções foram excluídas, permite novamente qualquer frase.
  if (pool.length === 0) {
    pool = SPLASH_PHRASES.map((text, index) => ({ text, index }))
  }

  // Escolhe uma opção, salva somente os quatro índices mais recentes e retorna o texto.
  const chosen = pool[Math.floor(Math.random() * pool.length)]

  const nextHistory = [...history, chosen.index].slice(-4)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory))

  return chosen.text
}