import { Link, NavLink } from 'react-router-dom'
import { Map, Bell, Info } from 'lucide-react'

import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import LogoTapyra from '../assets/Logo.png'

// Barra superior com links que mudam de página sem recarregar o site.
function AppNavbar({ alertCount = 0 }) {
  // Função auxiliar que calcula a classe a partir do estado ativo do NavLink;
  // os links abaixo ainda usam uma classe fixa e não chamam esta função.
  const linkClass = ({ isActive }) =>
    `nav-link-custom${isActive ? ' active' : ''}`

  return (
    <Navbar
      expand="lg"
      className="navbar-custom"
      variant="dark"
      sticky="top"
    >
      <Container>
        {/* Link transforma o nome e a imagem da marca em atalho para a página inicial. */}
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2"
        >
          <img
            src={LogoTapyra}
            width={46}
            height={46}
            alt="Logo do Tapyra"
          />

          <span className="navbar-brand-title">
            Tapyra
          </span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="main-nav"
          aria-label="Abrir ou fechar menu"
        />

        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            {/* Cada Nav.Link aponta para uma rota declarada em App.jsx. */}
            <Nav.Link as={NavLink} to="/" end className="nav-link-custom">Início</Nav.Link>
            <Nav.Link as={NavLink} to="/mapa" className="nav-link-custom"> Mapa</Nav.Link>
            <Nav.Link as={NavLink} to="/alertas" className="nav-link-custom"> Alertas</Nav.Link>
            <Nav.Link as={NavLink} to="/sobre" className="nav-link-custom"> Sobre</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}


// Permite importar esta barra nas páginas que compõem a aplicação.
export default AppNavbar