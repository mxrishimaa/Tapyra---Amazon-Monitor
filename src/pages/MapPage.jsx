import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import MapView from '../components/MapView'

function MapPage() {
  return (
    <div className="map-page py-4">
      <Container fluid>
        <Row className="mb-3">
          <Col>
            <h1 className="h3 text-verde mb-1">Mapa de Focos de Calor</h1>
            <p className="text-muted mb-0">Visualização em tempo real (dados de demonstração). Clique nos pontos para ver detalhes.</p>
          </Col>
        </Row>
        <Row className="g-3">
          <Col lg={9}>
            <div className="map-wrapper">
              <MapView />
            </div>
          </Col>
          <Col lg={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h5 className="mb-3">Legenda</h5>
                <div className="mb-3">
                  <span className="d-inline-block rounded-circle me-2" style={{ width: 12, height: 12, backgroundColor: '#e74c3c' }} />
                  Foco de calor (satélite)
                </div>
                <div className="mb-3">
                  <span className="d-inline-block rounded-circle me-2" style={{ width: 12, height: 12, backgroundColor: '#2d8a6a' }} />
                  Sensor de ar (em breve)
                </div>
                <hr />
                <h6 className="mb-2">Níveis de alerta</h6>
                <div className="d-flex flex-column gap-2">
                  <Badge bg="" className="badge-atencao align-self-start">Atenção</Badge>
                  <Badge bg="" className="badge-alerta align-self-start">Alerta</Badge>
                  <Badge bg="" className="badge-critico align-self-start">Crítico</Badge>
                </div>
                <hr />
                <p className="small text-muted mb-0">
                  Fonte: NASA FIRMS (simulado). Um foco de calor não confirma automaticamente um incêndio.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default MapPage