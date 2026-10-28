import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useFireData } from '../hooks/useFireData'
import { Button, Spinner } from 'react-bootstrap'
import 'leaflet/dist/leaflet.css'

function MapView() {
  // Insira sua API Key do NASA FIRMS
  const MAP_KEY = "SUA_NASA_FIRMS_MAP_KEY"; 
  const { fires, loading, error, refetch } = useFireData(MAP_KEY, 'world', '1');

  return (
    <div style={{ position: 'relative' }}>
      <div className="p-2 d-flex justify-content-between align-items-center bg-light">
        <span>Focos detectados: <strong>{fires.length}</strong></span>
        <Button variant="primary" size="sm" onClick={refetch} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Atualizar Dados'}
        </Button>
      </div>

      <MapContainer center={[-3.119, -60.021]} zoom={6} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {fires.map((fire, idx) => {
          const lat = parseFloat(fire.latitude);
          const lng = parseFloat(fire.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <CircleMarker
              key={idx}
              center={[lat, lng]}
              radius={6}
              pathOptions={{ color: 'red', fillColor: 'orange', fillOpacity: 0.8 }}
            >
              <Popup>
                <strong>Foco de Calor</strong><br />
                Latitude: {lat}<br />
                Longitude: {lng}<br />
                Data/Hora: {fire.acq_date} {fire.acq_time}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
export default MapView