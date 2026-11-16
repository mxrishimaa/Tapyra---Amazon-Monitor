import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  LayersControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { useEffect, useState, useRef, useCallback } from 'react'
import { fetchFocosFIRMS } from '../services/firms'
import 'leaflet/dist/leaflet.css'
import { useFireDataContext } from '../hooks/useFireDataContext'

const { BaseLayer } = LayersControl

// Centro inicial do mapa (latitude e longitude) e nível inicial de aproximação.
const CENTER = [-3.119, -60.022]
const ZOOM = 8

// Traduz a confiança numérica de um foco para uma cor usada no marcador.
function getCorFoco(confianca) {
  if (confianca >= 85) return '#7e0808'
  if (confianca >= 65) return '#cc800e'
  return '#d6a51d'
}

// Componente auxiliar dentro do mapa Leaflet: observa o mapa e avisa quando
// ele estiver pronto ou quando a área visível mudar.
function MapLoader({ onLoad }) {
  // useMap só pode ser usado por um componente que esteja dentro de MapContainer.
  const map = useMap()

  // Aguarda o primeiro cálculo do mapa e limpa o temporizador ao desmontar.
  useEffect(() => {
    // pequena espera para o mapa calcular bounds corretos
    const t = setTimeout(() => onLoad(map), 500)
    return () => clearTimeout(t)
  }, [map, onLoad])

  // Reage ao fim de movimentos e mudanças de zoom para atualizar os dados.
  useMapEvents({
    moveend: () => onLoad(map),
    zoomend: () => onLoad(map),
  })

  return null
}

// Desenha o mapa interativo, busca focos para a área exibida e sincroniza o contexto.
function MapView() {
  // Estado local controla os marcadores e mensagens mostrados neste mapa.
  const [focos, setFocos] = useState([])
  const [status, setStatus] = useState('idle')
  const [erroMsg, setErroMsg] = useState('')
  const [total, setTotal] = useState(0)

  // A página inicial usa estas funções para refletir o estado da consulta do mapa.
  const { publicarFocos, publicarLoading, publicarErro } = useFireDataContext()

  // Refs guardam temporizadores e identificadores entre renderizações sem
  // provocar uma nova renderização quando seus valores mudam.
  const timerRef = useRef(null)
  const abortRef = useRef(null)
  const lastKeyRef = useRef('')

  // Busca focos para a área geográfica atual. O debounce evita várias consultas
  // durante o arraste; a chave impede repetir uma consulta para a mesma posição.
  const carregarFocos = useCallback((map) => {
    if (!map) return

    // Bounds são as coordenadas dos limites visíveis; o zoom também integra a
    // chave porque altera o nível de detalhe necessário no mapa.
    const bounds = map.getBounds()
    const zoom = map.getZoom()
    const key = [
      bounds.getWest().toFixed(1),
      bounds.getSouth().toFixed(1),
      bounds.getEast().toFixed(1),
      bounds.getNorth().toFixed(1),
      zoom,
    ].join('|')

    if (key === lastKeyRef.current) return

    // Cancela a espera anterior e agenda a consulta após uma pausa no movimento.
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      lastKeyRef.current = key

      // Aborta uma requisição anterior para evitar que uma resposta velha
      // substitua os dados da área que o usuário está vendo agora.
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()

      try {
        // Atualiza o indicador na página e pede à NASA os focos dentro dos limites.
        setStatus('loading')
        setErroMsg('')
        publicarLoading()

        const dados = await fetchFocosFIRMS(
          {
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth(),
          },
          2,
          'VIIRS_SNPP_NRT',
          abortRef.current.signal
        )

        // Limita os marcadores desenhados para manter o mapa responsivo.
        const limite = zoom <= 5 ? 500 : zoom <= 7 ? 600 : 1000
        const lista = dados.slice(0, limite)

        console.log('[MapView] Renderizando', lista.length, 'de', dados.length)

        setFocos(lista)
        setTotal(dados.length)
        setStatus('idle')
        // O contexto recebe todos os registros, mesmo que o mapa desenhe uma amostra.
        publicarFocos(dados) // cards usam a lista completa da área
      } catch (err) {
        // Uma requisição abortada é esperada ao navegar o mapa e não deve virar erro.
        if (err.name === 'AbortError') return
        console.error(err)
        setErroMsg(err.message || 'Falha ao carregar focos')
        setStatus('error')
        setFocos([])
        setTotal(0)
        publicarErro(err.message)
      }
    }, 400)
  }, [publicarErro, publicarFocos, publicarLoading])

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {status === 'loading' && (
        <div className="map-status map-status--loading">Carregando focos...</div>
      )}
      {status === 'error' && (
        <div className="map-status map-status--error">{erroMsg}</div>
      )}
      {status === 'idle' && total > 0 && (
        <div className="map-status map-status--info">
          {focos.length} focos na tela · {total} na área
        </div>
      )}
      {status === 'idle' && total === 0 && (
        <div className="map-status map-status--info">
          Nenhum foco retornado para esta área
        </div>
      )}

      {/* MapContainer é o mapa Leaflet; camadas base e marcadores são seus filhos. */}
      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        style={{ height: '100%', width: '100%', minHeight: 400 }}
        scrollWheelZoom={true}
      >
        {/* O seletor permite alternar entre mapa de ruas e imagens de satélite. */}
        <LayersControl position="topright">
          <BaseLayer checked name="Ruas">
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </BaseLayer>

          <BaseLayer name="Satélite">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </BaseLayer>
        </LayersControl>

        <MapLoader onLoad={carregarFocos} />

        {/* Um marcador é criado para cada foco e o Popup mostra detalhes ao clicar. */}
        {focos.map((foco) => (
          <CircleMarker
            key={foco.id}
            center={[foco.lat, foco.lng]}
            radius={6}
            pathOptions={{
              color: getCorFoco(foco.confianca),
              fillColor: getCorFoco(foco.confianca),
              fillOpacity: 0.85,
              weight: 1,
            }}
          >
            <Popup>
              <strong>Foco de calor</strong>
              <br />
              Confiança: {foco.confianca}%
              <br />
              Satélite: {foco.satelite}
              <br />
              Data: {foco.data}
              {foco.frp && (
                <>
                  <br />
                  FRP: {Number(foco.frp).toFixed(1)}
                </>
              )}
              <br />
              <small>
                {foco.lat.toFixed(4)}, {foco.lng.toFixed(4)}
              </small>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapView