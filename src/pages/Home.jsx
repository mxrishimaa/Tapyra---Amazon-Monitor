import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import StatusCard from '../components/StatusCard'
import MapView from '../components/MapView'
import { useFireDataContext } from '../context/FireDataContext'

function formatNumber(n) {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('pt-BR')
}

function Home() {
  const {
    totalManauskm,
    totalVisivel,
    alertas,
    loading,
    error,
    atualizadoEm,
  } = useFireDataContext()

  const hora =
    atualizadoEm &&
    atualizadoEm.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

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
                Satélite, sensores de ar e notícias em tempo real para proteger
                comunidades da Amazônia.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Button as={Link} to="/mapa" className="btn-laranja px-4 py-2">
                  Ver Mapa ao Vivo
                </Button>
                <Button
                  as={Link}
                  to="/alertas"
                  variant="outline-light"
                  className="px-4 py-2"
                >
                  Ver Alertas
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <h2 className="h4 mb-0 text-verde">Visão geral</h2>
          <span className="small text-muted">
            {loading && 'Atualizando com o mapa…'}
            {!loading && hora && `Atualizado às ${hora}`}
            {error && <span className="text-danger ms-2">{error}</span>}
          </span>
        </div>

        <Row className="g-4 mb-5">
          <Col sm={6} lg={6}>
            <StatusCard
              iconClass="icon-foco"
              icon="🔥"
              title="Focos de calor"
              value={loading ? '…' : formatNumber(totalManauskm)}
              description={`Raio de 700 km de Manaus · ${formatNumber(totalVisivel)} na área do mapa`}
            />
          </Col>
          <Col sm={6} lg={6}>
            <StatusCard
              iconClass="icon-alerta"
              icon="⚠️"
              title="Alertas ativos"
              value={loading ? '…' : formatNumber(alertas.ativos)}
              description={alertas.detalhe}
            />
          </Col>
        </Row>

        <h2 className="h4 mb-3 text-verde">Mapa de focos de calor</h2>
        <p className="text-muted mb-3">
          Mova o mapa para atualizar os focos e os cards automaticamente.
          O card de focos conta apenas pontos a até 700 km de Manaus.
        </p>
        <div className="map-wrapper mb-3">
          <MapView />
        </div>
        <div className="text-end">
          <Button as={Link} to="/mapa" variant="outline-success" size="sm">
            Abrir mapa completo →
          </Button>
        </div>
      </Container>
    </>
  )
}

export default Home