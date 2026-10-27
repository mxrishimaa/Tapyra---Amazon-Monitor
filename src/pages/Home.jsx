import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import StatusCard from '../components/StatusCard'
import MapView from '../components/MapView'

function Home() {
  return (
    <>
      <section className="hero-section">
        <Container>
          <Row>
            <Col lg={7}>
              <h1 className="hero-title">
                Rede de Alerta de<br />Fumaça e Fogo
              </h1>
              <p className="hero-subtitle mb-4">
                Satélite, sensores de ar e notícias em tempo real para proteger comunidades da Amazônia.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Button as={Link} to="/mapa" className="btn-laranja px-4 py-2">Ver Mapa ao Vivo</Button>
                <Button as={Link} to="/alertas" variant="outline-light" className="px-4 py-2">Ver Alertas</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <h2 className="h4 mb-4 text-verde">Visão geral — última atualização (demo)</h2>
        <Row className="g-4 mb-5">
          <Col sm={6} lg={3}>
            <StatusCard iconClass="icon-foco" icon="🔥" title="Focos de calor (24h)" value="1.920" description="Num raio de 300 km de Manaus" />
          </Col>
          <Col sm={6} lg={3}>
            <StatusCard iconClass="icon-ar" icon="💨" title="Qualidade do ar" value="Ruim" description="PM2.5 elevado em vários bairros" />
          </Col>
          <Col sm={6} lg={3}>
            <StatusCard iconClass="icon-alerta" icon="⚠️" title="Alertas ativos" value="3" description="2 Atenção · 1 Alerta" />
          </Col>
          <Col sm={6} lg={3}>
            <StatusCard iconClass="icon-sensor" icon="📡" title="Sensores online" value="0 / 3" description="Rede de sensores em implantação" />
          </Col>
        </Row>

        <h2 className="h4 mb-3 text-verde">Mapa de focos de calor (simulado)</h2>
        <p className="text-muted mb-3">Pontos vermelhos = focos de calor detectados por satélite (dados de demonstração).</p>
        <div className="map-wrapper mb-3">
          <MapView />
        </div>
        <div className="text-end">
          <Button as={Link} to="/mapa" variant="outline-success" size="sm">Abrir mapa completo →</Button>
        </div>
      </Container>
    </>
  )
}

export default Home