import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  LayersControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useEffect, useState, useRef } from 'react'
import { fetchFocosFIRMS } from '../services/firms'
import 'leaflet/dist/leaflet.css'

const { BaseLayer } = LayersControl

const centerInicial = [-5.5, -58.0]
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

// Cor baseada na confiança do foco
function getCorFoco(confianca) {
  if (confianca >= 85) return '#c0392b' // vermelho forte
  if (confianca >= 70) return '#e67e22' // laranja
  return '#f1c40f' // amarelo
}

function MapView() {
  const [focos, setFocos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const debounceRef = useRef(null)

  const buscarFocos = async (bounds) => {
    if (!bounds) return

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
          1,
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
      {carregando && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(13, 59, 46, 0.92)',
          color: 'white',
          padding: '6px 16px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}>
          Atualizando focos de calor...
        </div>
      )}

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
            <TileLayer
              attribution='Labels &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              opacity={0.85}
            />
          </BaseLayer>
        </LayersControl>

        <MapController center={centerInicial} zoom={zoomInicial} />
        <MapEvents onBoundsChange={buscarFocos} />

        {/* ===== CLUSTER ===== */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={80}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          disableClusteringAtZoom={10}
        >
          {focos.map((foco) => {
            const cor = getCorFoco(foco.confianca)

            return (
              <CircleMarker
                key={foco.id}
                center={[foco.lat, foco.lng]}
                radius={5 + (foco.confianca / 40)}
                pathOptions={{
                  color: cor,
                  fillColor: cor,
                  fillOpacity: 0.75,
                  weight: 1.5,
                }}
              >
                <Popup>
                  <strong>Foco de calor 🌡️</strong>
                  <br />
                  Confiança: {foco.confianca}%
                  <br />
                  Satélite: {foco.satelite}
                  <br />
                  Data: {foco.data}
                  {foco.frp && (
                    <>
                      <br />
                      Potência (FRP): {Number(foco.frp).toFixed(1)}
                    </>
                  )}
                  <br />
                  <small>
                    {foco.lat.toFixed(4)}, {foco.lng.toFixed(4)}
                  </small>
                </Popup>
              </CircleMarker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}

export default MapView