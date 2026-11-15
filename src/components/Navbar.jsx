import { Link, NavLink } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import LogoTapyra from '../assets/Logo.png'

function AppNavbar() {
  return (
    <Navbar expand="lg" className="navbar-custom" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <img src={LogoTapyra} className="navbar-brand-logo" alt="Logo app Tapyra" width={40} height={40} />
          <span className="brand-name">Tapyra</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
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

export default AppNavbar