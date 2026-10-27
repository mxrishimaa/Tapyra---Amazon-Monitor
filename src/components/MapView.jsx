import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

const focosSimulados = [
  { id: 1, lat: -3.1190, lng: -60.0217, confianca: 80, satelite: 'VIIRS', data: '2026-10-26 14:30' },
  { id: 2, lat: -3.2500, lng: -59.9800, confianca: 95, satelite: 'MODIS', data: '2026-10-26 15:10' },
  { id: 3, lat: -2.9800, lng: -60.1500, confianca: 70, satelite: 'VIIRS', data: '2026-10-26 13:45' },
  { id: 4, lat: -3.4000, lng: -60.3000, confianca: 85, satelite: 'VIIRS', data: '2026-10-26 16:00' },
  { id: 5, lat: -3.0500, lng: -59.8500, confianca: 90, satelite: 'MODIS', data: '2026-10-26 14:55' },
  { id: 6, lat: -2.8500, lng: -60.0500, confianca: 65, satelite: 'VIIRS', data: '2026-10-26 12:20' },
]

const center = [-3.1190, -60.0217]

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 9)
  }, [map, center])
  return null
}

function MapView() {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} />
        {focosSimulados.map((foco) => (
          <CircleMarker
            key={foco.id}
            center={[foco.lat, foco.lng]}
            radius={8 + (foco.confianca / 20)}
            pathOptions={{ color: '#c0392b', fillColor: '#e74c3c', fillOpacity: 0.7, weight: 2 }}
          >
            <Popup>
              <strong>Foco de calor detectado</strong><br />
              Confiança: {foco.confianca}%<br />
              Satélite: {foco.satelite}<br />
              Data: {foco.data}<br />
              <small>Coordenadas: {foco.lat.toFixed(4)}, {foco.lng.toFixed(4)}</small>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapView