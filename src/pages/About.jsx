import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'

function About() {
  return (
    <Container className="py-5">
      <h1 className="h3 text-verde mb-3">Sobre o projeto</h1>
      <p className="lead text-muted mb-5">
        A Rede de Alerta de Fumaça e Fogo (Tapyra) reúne dados de satélite, sensores de ar, meteorologia e notícias para avisar as pessoas antes e durante a chegada da fumaça.
      </p>

      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-verde">🎯 Objetivo</h5>
              <p className="small mb-0">Transformar dados técnicos em avisos úteis para moradores, escolas, unidades de saúde e comunidades da Amazônia.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-verde">🛰️ Fontes</h5>
              <p className="small mb-0">NASA FIRMS, BDQueimadas (INPE), Open-Meteo, sensores de baixo custo e feeds de notícias oficiais.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-verde">⚙️ Diferencial</h5>
              <p className="small mb-0">Motor de correlação que responde: para onde vai a fumaça, se ela já chegou e quão grave está a situação.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2 className="h5 text-verde mb-3">Tecnologias desta versão (front-end)</h2>
      <ul>
        <li>React + Vite</li>
        <li>React Router (navegação)</li>
        <li>Bootstrap 5 + React-Bootstrap</li>
        <li>Leaflet + React-Leaflet (mapa interativo)</li>
        <li>Hooks (useState, useEffect)</li>
      </ul>

      <p className="mt-4 small text-muted">
        Este é um projeto acadêmico. Não substitui os sistemas oficiais de alerta nem a orientação da Defesa Civil ou Corpo de Bombeiros.
      </p>
    </Container>
  )
}

export default About