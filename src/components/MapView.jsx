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
import { useFireDataContext } from '../context/FireDataContext'

const { BaseLayer } = LayersControl

const CENTER = [-3.119, -60.022]
const ZOOM = 8

function getCorFoco(confianca) {
  if (confianca >= 85) return '#7e0808'
  if (confianca >= 65) return '#cc800e'
  return '#d6a51d'
}

function MapLoader({ onLoad }) {
  const map = useMap()

  useEffect(() => {
    // pequena espera para o mapa calcular bounds corretos
    const t = setTimeout(() => onLoad(map), 500)
    return () => clearTimeout(t)
  }, [map, onLoad])

  useMapEvents({
    moveend: () => onLoad(map),
    zoomend: () => onLoad(map),
  })

  return null
}

function MapView() {
  const [focos, setFocos] = useState([])
  const [status, setStatus] = useState('idle')
  const [erroMsg, setErroMsg] = useState('')
  const [total, setTotal] = useState(0)

  // Funcionalidade para atualização dos cards com base nos dados do mapa
  const { publicarFocos, publicarLoading, publicarErro } = useFireDataContext()

  const timerRef = useRef(null)
  const abortRef = useRef(null)
  const lastKeyRef = useRef('')

  const carregarFocos = useCallback((map) => {
    if (!map) return

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

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      lastKeyRef.current = key

      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()

      try {
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

        // Limita só para não travar o navegador
        const limite = zoom <= 5 ? 500 : zoom <= 7 ? 600 : 1000
        const lista = dados.slice(0, limite)

        console.log('[MapView] Renderizando', lista.length, 'de', dados.length)

        setFocos(lista)
        setTotal(dados.length)
        setStatus('idle')
        publicarFocos(dados) // cards usam a lista completa da área
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error(err)
        setErroMsg(err.message || 'Falha ao carregar focos')
        setStatus('error')
        setFocos([])
        setTotal(0)
        publicarErro(err.message)
      }
    }, 400)
  }, [])

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {status === 'loading' && (
        <div className="map-status map-status--loading">Consultando NASA FIRMS</div>
      )}
      {status === 'error' && (
        <div className="map-status map-status--error">{erroMsg}</div>
      )}
      {status === 'idle' && total > 0 && (
        <div className="map-status map-status--info">
          {focos.length} focos na tela
        </div>
      )}
      {status === 'idle' && total === 0 && (
        <div className="map-status map-status--info">
          Nenhum foco nas ultimas leituras
        </div>
      )}

      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        style={{ height: '100%', width: '100%', minHeight: 400 }}
        scrollWheelZoom={true}
      >
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