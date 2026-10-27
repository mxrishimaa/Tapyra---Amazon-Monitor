import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'

const alertasSimulados = [
  {
    id: 1,
    nivel: 'Alerta',
    titulo: 'Fumaça chegando à zona leste',
    mensagem: 'Foco de calor detectado a 30 km. O vento sopra para a sua região. A qualidade do ar está piorando.',
    horario: '26/10/2026 15:40',
    regiao: 'Manaus - Zona Leste',
  },
  {
    id: 2,
    nivel: 'Atenção',
    titulo: 'Novos focos a 45 km',
    mensagem: 'Foco de calor detectado a 45 km. O vento sopraria na direção da capital nas próximas horas.',
    horario: '26/10/2026 14:15',
    regiao: 'Manaus e entorno',
  },
  {
    id: 3,
    nivel: 'Atenção',
    titulo: 'Concentração de focos no Amazonas',
    mensagem: '3.726 focos registrados em setembro no estado. Acompanhe a evolução.',
    horario: '26/10/2026 10:00',
    regiao: 'Estado do Amazonas',
  },
]

function getBadgeClass(nivel) {
  if (nivel === 'Crítico') return 'badge-critico'
  if (nivel === 'Alerta') return 'badge-alerta'
  return 'badge-atencao'
}

function Alerts() {
  return (
    <Container className="py-5">
      <h1 className="h3 text-verde mb-2">Alertas recentes</h1>
      <p className="text-muted mb-4">Alertas gerados pelo motor de correlação (dados de demonstração).</p>

      <Row className="g-4">
        <Col lg={8}>
          <ListGroup variant="flush" className="shadow-sm rounded">
            {alertasSimulados.map((alerta) => (
              <ListGroup.Item key={alerta.id} className="px-4 py-3">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h5 className="mb-0 fs-6">{alerta.titulo}</h5>
                  <Badge bg="" className={getBadgeClass(alerta.nivel)}>{alerta.nivel}</Badge>
                </div>
                <p className="mb-2 text-muted small">{alerta.mensagem}</p>
                <div className="d-flex gap-3 small text-muted">
                  <span>📍 {alerta.regiao}</span>
                  <span>🕐 {alerta.horario}</span>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Como funcionam os níveis</h5>
              <div className="mb-3">
                <Badge bg="" className="badge-atencao mb-1">Atenção</Badge>
                <p className="small text-muted mb-0">Focos novos num raio de 50 km e vento na direção da localidade.</p>
              </div>
              <div className="mb-3">
                <Badge bg="" className="badge-alerta mb-1">Alerta</Badge>
                <p className="small text-muted mb-0">Condição de atenção + aumento de PM2.5 ou notícia confirmada.</p>
              </div>
              <div className="mb-3">
                <Badge bg="" className="badge-critico mb-1">Crítico</Badge>
                <p className="small text-muted mb-0">PM2.5 em faixa ruim ou muito ruim por tempo prolongado.</p>
              </div>
              <hr />
              <p className="small mb-0"><strong>Emergência:</strong> Bombeiros 193 · Defesa Civil 199</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Alerts