// URLs das imagens do splash (pode ser /splash/... ou link externo)
export const SPLASH_IMAGES = [
  'https://exemplo.com/amazonia-1.webp',
  'https://exemplo.com/amazonia-2.webp',
  'https://exemplo.com/amazonia-3.webp',
  'https://exemplo.com/amazonia-4.webp',
  'https://exemplo.com/amazonia-5.webp',
  'https://exemplo.com/amazonia-6.webp',
  'https://exemplo.com/amazonia-7.webp',
  'https://exemplo.com/amazonia-8.webp',
]

/** Embaralha uma cópia do array (Fisher–Yates) */
export function shuffleImages(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}