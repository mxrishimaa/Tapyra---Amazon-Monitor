import { useEffect, useState } from 'react'
import { pickSplashPhrase } from '../data/splashPhrases'
import { SPLASH_IMAGES, shuffleImages } from '../data/splashImages'
import './SplashScreen.css'

const MIN_DURATION = 3000

// Tela de abertura exibida enquanto a aplicação inicia sua experiência visual.
function SplashScreen({ onFinish }) {
  // Inicializadores lazy escolhem uma frase e embaralham imagens apenas na montagem.
  const [phrase] = useState(() => pickSplashPhrase())
  // Nova ordem a cada montagem (F5 / primeiro acesso)
  const [images] = useState(() => shuffleImages(SPLASH_IMAGES))
  const [imageIndex, setImageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)

  // Avança o índice do slide periodicamente; o módulo (%) faz a sequência voltar
  // ao primeiro item depois da última imagem.
  useEffect(() => {
    if (images.length <= 1) return undefined

    const id = setInterval(() => {
      setImageIndex((i) => (i + 1) % images.length)
    }, 1100)

    return () => clearInterval(id)
  }, [images.length])

  // Atualiza a barra de progresso a cada quadro e avisa o componente pai ao fim.
  useEffect(() => {
    const start = Date.now()
    let frameId

    // requestAnimationFrame agenda atualizações sincronizadas com a tela.
    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / MIN_DURATION) * 100)
      setProgress(pct)

      if (elapsed >= MIN_DURATION) {
        setLeaving(true)
        // Aguarda a animação de saída antes de remover a tela de abertura.
        setTimeout(() => onFinish?.(), 3000)
        return
      }
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    // Cancela o quadro pendente caso o componente saia antes do próximo tick.
    return () => cancelAnimationFrame(frameId)
  }, [onFinish])

  return (
    <div className={`splash ${leaving ? 'splash--out' : ''}`}>
      <div className="splash__slides" aria-hidden="true">
        {/* O array é percorrido para criar slides; apenas o índice atual fica ativo. */}
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`splash__slide ${i === imageIndex ? 'is-active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="splash__overlay" />
      </div>

      <div className="splash__content">
        <p className="splash__phrase">{phrase}</p>
        <div
          className="splash__bar"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="splash__bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="splash__hint">Carregando monitoramento…</span>
      </div>
    </div>
  )
}

// Exporta a tela para que App.jsx controle sua exibição e encerramento.
export default SplashScreen