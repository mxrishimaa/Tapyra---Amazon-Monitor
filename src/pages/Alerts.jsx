import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchFocosFIRMS } from '../services/firms'
import { useUserFeatures } from '../context/useUserFeatures'

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

function getLocalDateTimeValue() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function Alerts() {
  const [searchParams] = useSearchParams()
  const { currentUser, communityAlerts, addCommunityAlert } = useUserFeatures()
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [atualizadoEm, setAtualizadoEm] = useState(null)
  const [formUserEmail, setFormUserEmail] = useState(
    () => (currentUser && searchParams.get('novo') === '1' ? currentUser.email : null)
  )
  const mostrarFormulario = Boolean(currentUser && formUserEmail === currentUser.email)
  const [avisoRelato, setAvisoRelato] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function carregar() {
      try {
        const focos = await fetchFocosFIRMS(AREA, 5, 'MODIS_NRT', controller.signal)
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

async function handleCommunityAlertSubmit(event) {
    event.preventDefault()
    if (!currentUser) {
      setFormUserEmail(null)
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const startedAt = new Date(formData.get('startedAt'))

    if (Number.isNaN(startedAt.getTime())) {
      setAvisoRelato('Informe um horário válido para o início da ocorrência.')
      return
    }

    try {
      await addCommunityAlert({
        location: formData.get('location').trim(),
        severity: formData.get('severity'),
        startedAt: startedAt.toISOString(),
        description: formData.get('description').trim(),
      })
      form.reset()
      setFormUserEmail(null)
      setAvisoRelato('Relato publicado e alerta enviado por WhatsApp para os inscritos!')
    } catch (err) {
      setAvisoRelato(err.message || 'Erro ao enviar alerta.')
    }
  }

  return (
    <Container className="py-5">
      <div className="alert alert-warning border-0 shadow-sm mb-4" role="status">
        <strong>Como interpretar os alertas.</strong>
        {' '} Os níveis abaixo são uma estimativa do Tapyra com base nos focos de calor
        detectados por satélite (NASA FIRMS) em um raio de cerca de 700 km de Manaus.
        {' '} <i>Não substituem avisos da Defesa Civil, INPE ou bombeiros.</i>
      </div>
      <h1 className="h3 text-verde mb-2">Alertas recentes</h1>
      <p className="text-muted mb-4">
        Alertas gerados a partir dos focos de calor da NASA FIRMS (últimas 24 h).
        {atualizadoEm && ` Atualizado às ${atualizadoEm.toLocaleTimeString('pt-BR')}.`}
      </p>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <h2 className="h5 text-verde mb-0">Relatos da comunidade</h2>
        {currentUser ? (
          <button
            type="button"
            className="btn btn-laranja"
            aria-expanded={mostrarFormulario}
            aria-controls="community-alert-form"
            onClick={() => {
              setFormUserEmail(mostrarFormulario ? null : currentUser.email)
              setAvisoRelato('')
            }}
          >
            {mostrarFormulario ? 'Cancelar' : 'Criar um alerta'}
          </button>
        ) : (
          <Link
            to="/login"
            state={{ from: '/alertas?novo=1' }}
            className="btn btn-info"
          >
            Entre ou cadastre-se para criar um alerta
          </Link>
        )}
      </div>
      <p className="small text-muted mb-3">
        Relatos de usuários ficam nesta prévia durante a sessão. A publicação para outras pessoas será conectada ao backend.
      </p>

      {currentUser && mostrarFormulario && (
        <Card className="community-alert-form mb-4">
          <Card.Body>
            <form id="community-alert-form" className="row g-3" onSubmit={handleCommunityAlertSubmit}>
              <div className="col-md-6">
                <label className="form-label" htmlFor="community-location">Localização</label>
                <input
                  id="community-location"
                  name="location"
                  className="form-control"
                  placeholder="Ex.: Bairro, município - UF"
                  autoComplete="address-level2"
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="community-severity">Gravidade</label>
                <select id="community-severity" name="severity" className="form-select" defaultValue="Atenção" required>
                  <option value="Atenção">Atenção</option>
                  <option value="Alerta">Alerta</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="community-started-at">Quando começou</label>
                <input
                  id="community-started-at"
                  name="startedAt"
                  type="datetime-local"
                  className="form-control"
                  defaultValue={getLocalDateTimeValue()}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="community-description">Descrição (opcional)</label>
                <textarea
                  id="community-description"
                  name="description"
                  className="form-control"
                  rows="2"
                  placeholder="Descreva o que está acontecendo"
                />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-laranja">Publicar relato na prévia</button>
              </div>
            </form>
          </Card.Body>
        </Card>
      )}
      {avisoRelato && <p className="small text-success mb-4" role="status">{avisoRelato}</p>}

      {communityAlerts.length > 0 ? (
        <ListGroup className="community-alert-list mb-5">
          {communityAlerts.map((alerta) => (
            <ListGroup.Item key={alerta.id} className="px-4 py-3">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                <h3 className="h6 mb-0">{alerta.location}</h3>
                <Badge bg="" className={getBadgeClass(alerta.severity)}>{alerta.severity}</Badge>
              </div>
              {alerta.description && <p className="mb-2 text-muted small">{alerta.description}</p>}
              <div className="d-flex flex-wrap gap-3 small text-muted">
                <span>Início: {new Date(alerta.startedAt).toLocaleString('pt-BR')}</span>
                <span>Relatado: {new Date(alerta.createdAt).toLocaleString('pt-BR')}</span>
                <span>Por: {alerta.author}</span>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="small text-muted mb-5">Ainda não há relatos da comunidade nesta sessão.</p>
      )}

      <h2 className="h5 text-verde mb-3">Alertas de satélite</h2>
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