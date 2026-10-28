import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  LayersControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import { fetchFocosFIRMS } from '../services/firms'
import 'leaflet/dist/leaflet.css'

const { BaseLayer } = LayersControl

const centerInicial = [-5.5, -58.0] // centro da Amazônia
const zoomInicial = 5

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

function MapEvents({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target
      onBoundsChange(map.getBounds(), map.getZoom())
    },
    zoomend: (e) => {
      const map = e.target
      onBoundsChange(map.getBounds(), map.getZoom())
    },
  })
  return null
}

function MapView() {
  const [focos, setFocos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const debounceRef = useRef(null)

  const buscarFocos = async (bounds) => {
    if (!bounds) return

    // Debounce: espera 600ms após o usuário parar de mover o mapa
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        setCarregando(true)
        setErro(null)

        const west = bounds.getWest()
        const south = bounds.getSouth()
        const east = bounds.getEast()
        const north = bounds.getNorth()

        const dados = await fetchFocosFIRMS(
          { west, south, east, north },
          1, // últimos 1 dia
          'VIIRS_SNPP_NRT'
        )

        setFocos(dados)
      } catch (err) {
        console.error(err)
        setErro(err.message)
        setFocos([])
      } finally {
        setCarregando(false)
      }
    }, 600)
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Indicador de carregamento */}
      {carregando && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(13, 59, 46, 0.9)',
          color: 'white',
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 500,
        }}>
          Atualizando focos de calor...
        </div>
      )}

      {/* Mensagem de erro */}
      {erro && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: '#c0392b',
          color: 'white',
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 13,
        }}>
          Erro: {erro}
        </div>
      )}

      <MapContainer
        center={centerInicial}
        zoom={zoomInicial}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Ruas">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          <BaseLayer name="Satélite">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            {/* Labels (nomes de cidades/estados) */}
            <TileLayer
              attribution='Labels &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              opacity={0.9}
            />
          </BaseLayer>
        </LayersControl>

        <MapController center={centerInicial} zoom={zoomInicial} />
        <MapEvents onBoundsChange={buscarFocos} />

        {focos.map((foco) => (
          <CircleMarker
            key={foco.id}
            center={[foco.lat, foco.lng]}
            radius={6 + (foco.confianca / 30)}
            pathOptions={{
              color: '#c0392b',
              fillColor: '#e74c3c',
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup>
              <strong>🔥 Foco de calor detectado</strong>
              <br />
              Confiança: {foco.confianca}%
              <br />
              Satélite: {foco.satelite}
              <br />
              Data: {foco.data}
              {foco.frp && (
                <>
                  <br />
                  Potência (FRP): {foco.frp}
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