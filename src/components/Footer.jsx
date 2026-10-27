import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

function Footer() {
  return (
    <footer className="footer-custom">
      <Container>
        <Row className="gy-3">
          <Col md={4}>
            <h5 className="text-white mb-3">Tapyra: Monitor da Amazônia</h5>
            <p className="small">
              Rede de Alerta de Fumaça e Fogo. Satélite, sensores de ar e notícias em tempo real para proteger comunidades da Amazônia.
            </p>
          </Col>
          <Col md={4}>
            <h6 className="text-white mb-3">Links úteis</h6>
            <ul className="list-unstyled small">
              <li><a href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noreferrer">NASA FIRMS</a></li>
              <li><a href="https://queimadas.dgi.inpe.br/" target="_blank" rel="noreferrer">BDQueimadas (INPE)</a></li>
              <li><a href="https://terrabrasilis.dpi.inpe.br/" target="_blank" rel="noreferrer">TerraBrasilis</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h6 className="text-white mb-3">Emergência</h6>
            <p className="small mb-1"><strong>Bombeiros:</strong> 193</p>
            <p className="small mb-1"><strong>Defesa Civil:</strong> 199</p>
            <p className="small mt-3 opacity-75">
              Este sistema complementa, e não substitui, os órgãos oficiais.
            </p>
          </Col>
        </Row>
        <hr className="border-secondary my-3" />
        <p className="text-center small mb-0 opacity-75">
          © 2026 · Projeto acadêmico · Versão 0.1.0 · Dados abertos
        </p>
      </Container>
    </footer>
  )
}

export default Footer