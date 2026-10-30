import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'
import { fetchFocosFIRMS } from '../services/firms'

const MANAUS = { lat: -3.119, lng: -60.0217 }
// Caixa de ~700 km em volta de Manaus (west, south, east, north)
const AREA = { west: -66.5, south: -9.5, east: -53.5, north: 3.2 }
const ATUALIZAR_MS = 5 * 60 * 1000

function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function gerarAlertas(focos, agora) {
  const horario = agora.toLocaleString('pt-BR')
  const comDistancia = focos.map((f) => ({
    ...f,
    km: distanciaKm(MANAUS.lat, MANAUS.lng, f.lat, f.lng),
  }))

  const ate50 = comDistancia.filter((f) => f.km <= 50)
  const ate150 = comDistancia.filter((f) => f.km <= 150)
  const alertas = []

  if (ate50.length > 0) {
    const maisProximo = Math.round(Math.min(...ate50.map((f) => f.km)))
    alertas.push({
      id: 'raio-50',
      nivel: ate50.length >= 10 ? 'Alerta' : 'Atenção',
      titulo: `${ate50.length} foco(s) de calor a até 50 km de Manaus`,
      mensagem: `Foco mais próximo a ${maisProximo} km, detectado nas últimas 24 h.`,
      horario,
      regiao: 'Manaus e entorno',
    })
  }

  if (ate150.length - ate50.length > 0) {
    alertas.push({
      id: 'raio-150',
      nivel: 'Atenção',
      titulo: `${ate150.length - ate50.length} foco(s) entre 50 e 150 km`,
      mensagem: 'Focos na região metropolitana e municípios vizinhos. Acompanhe a evolução.',
      horario,
      regiao: 'Região de Manaus',
    })
  }

  if (focos.length >= 30) {
    alertas.push({
      id: 'regional',
      nivel: 'Atenção',
      titulo: 'Concentração de focos no Amazonas',
      mensagem: `${focos.length} focos registrados nas últimas 24 h em um raio de ~700 km de Manaus.`,
      horario,
      regiao: 'Amazonas e entorno',
    })
  }

  return alertas
}

function getBadgeClass(nivel) {
  if (nivel === 'Crítico') return 'badge-critico'
  if (nivel === 'Alerta') return 'badge-alerta'
  return 'badge-atencao'
}

function Alerts() {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [atualizadoEm, setAtualizadoEm] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function carregar() {
      try {
        const focos = await fetchFocosFIRMS(AREA, 1, 'VIIRS_SNPP_NRT', controller.signal)
        const agora = new Date()
        setAlertas(gerarAlertas(focos, agora))
        setAtualizadoEm(agora)
        setErro(null)
      } catch (e) {
        if (e.name !== 'AbortError') setErro(e.message || 'Falha ao carregar alertas')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    carregar()
    const id = setInterval(carregar, ATUALIZAR_MS)
    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [])

  return (
    <Container className="py-5">
      <div className="alert alert-warning border-0 shadow-sm mb-4" role="status">
        <strong>Como interpretar os alertas.</strong>
        {' '} Os níveis abaixo são uma estimativa do Tapyra com base nos focos de calor
        detectados por satélite (NASA FIRMS) em um raio de cerca de 300 km de Manaus.
        {' '} <i>Não substituem avisos da Defesa Civil, INPE ou bombeiros.</i>
      </div>
      <h1 className="h3 text-verde mb-2">Alertas recentes</h1>
      <p className="text-muted mb-4">
        Alertas gerados a partir dos focos de calor da NASA FIRMS (últimas 24 h).
        {atualizadoEm && ` Atualizado às ${atualizadoEm.toLocaleTimeString('pt-BR')}.`}
      </p>

      <Row className="g-4">
        <Col lg={8}>
          {loading && <p className="text-muted">Carregando alertas…</p>}
          {erro && <p className="text-danger">Não foi possível atualizar: {erro}</p>}
          {!loading && !erro && alertas.length === 0 && (
            <p className="text-muted">Nenhum alerta ativo no momento.</p>
          )}

          {alertas.length > 0 && (
            <ListGroup variant="flush" className="shadow-sm rounded">
              {alertas.map((alerta) => (
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
          )}
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Como funcionam os níveis:</h5>
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