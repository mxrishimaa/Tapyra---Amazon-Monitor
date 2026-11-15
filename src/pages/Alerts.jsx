import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'
import { fetchFocosFIRMS } from '../services/firms'

// Ponto de referência usado para medir a distância dos focos.
const MANAUS = { lat: -3.119, lng: -60.0217 }
// Caixa de ~700 km em volta de Manaus (west, south, east, north)
const AREA = { west: -66.5, south: -9.5, east: -53.5, north: 3.2 }
// Intervalo entre consultas automáticas, expresso em milissegundos.
const ATUALIZAR_MS = 5 * 60 * 1000

// Mede a distância em quilômetros entre coordenadas usando a fórmula de Haversine.
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

// Transforma focos detectados em avisos resumidos para diferentes distâncias.
function gerarAlertas(focos, agora) {
  const horario = agora.toLocaleString('pt-BR')
  // Acrescenta a distância a cada foco sem modificar os objetos originais.
  const comDistancia = focos.map((f) => ({
    ...f,
    km: distanciaKm(MANAUS.lat, MANAUS.lng, f.lat, f.lng),
  }))

  // Cria listas por faixa de distância; a faixa de 50 km também está dentro da de 150 km.
  const ate50 = comDistancia.filter((f) => f.km <= 50)
  const ate150 = comDistancia.filter((f) => f.km <= 150)
  const alertas = []

  if (ate50.length > 0) {
    // O foco mais próximo é calculado a partir das distâncias dos registros locais.
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

// Escolhe a classe CSS correspondente à gravidade do aviso.
function getBadgeClass(nivel) {
  if (nivel === 'Crítico') return 'badge-critico'
  if (nivel === 'Alerta') return 'badge-alerta'
  return 'badge-atencao'
}

// Página que consulta periodicamente os dados FIRMS e os apresenta como alertas.
function Alerts() {
  // Estado controla a lista e os indicadores de carregamento, erro e atualização.
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [atualizadoEm, setAtualizadoEm] = useState(null)

  // O efeito inicia a consulta e a repetição temporizada; sua limpeza cancela
  // tanto o pedido em andamento quanto o intervalo ao desmontar a página.
  useEffect(() => {
    const controller = new AbortController()

    // Busca focos, converte-os em alertas e publica o resultado na interface.
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
        detectados por satélite (NASA FIRMS) em um raio de cerca de 700 km de Manaus.
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

          {/* map transforma cada alerta em um item; sua chave estável ajuda o React
              a identificar qual item mudou entre atualizações. */}
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

// Exporta a página para a rota "/alertas".
export default Alerts