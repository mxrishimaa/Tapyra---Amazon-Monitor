import { useEffect, useState } from 'react'
import { pickSplashPhrase } from '../data/splashPhrases'
import { SPLASH_IMAGES, shuffleImages } from '../data/splashImages'
import './SplashScreen.css'

const MIN_DURATION = 3200

function SplashScreen({ onFinish }) {
  const [phrase] = useState(() => pickSplashPhrase())
  // Nova ordem a cada montagem (F5 / primeiro acesso)
  const [images] = useState(() => shuffleImages(SPLASH_IMAGES))
  const [imageIndex, setImageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)

  // Troca de slide
  useEffect(() => {
    if (images.length <= 1) return undefined

    const id = setInterval(() => {
      setImageIndex((i) => (i + 1) % images.length)
    }, 1100)

    return () => clearInterval(id)
  }, [images.length])

  // Barra + fim
  useEffect(() => {
    const start = Date.now()
    let frameId

    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / MIN_DURATION) * 100)
      setProgress(pct)

      if (elapsed >= MIN_DURATION) {
        setLeaving(true)
        setTimeout(() => onFinish?.(), 500)
        return
      }
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [onFinish])

  return (
    <div className={`splash ${leaving ? 'splash--out' : ''}`}>
      <div className="splash__slides" aria-hidden="true">
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

export default SplashScreen