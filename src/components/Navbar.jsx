import { Link, NavLink } from 'react-router-dom'
import { Map, Bell, Info } from 'lucide-react'

import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Badge from 'react-bootstrap/Badge'

import LogoTapyra from '../assets/logo.png'

function AppNavbar({ alertCount = 0 }) {
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
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link
              as={NavLink}
              to="/"
              end
              className={linkClass}
            >
              Início
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/mapa"
              className={linkClass}
            >
              <Map size={17} aria-hidden="true" />
              Mapa
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/alertas"
              className={linkClass}
            >
              <Bell size={17} aria-hidden="true" />
              Alertas

              {alertCount > 0 && (
                <Badge
                  bg="warning"
                  text="dark"
                  pill
                  className="ms-1"
                >
                  {alertCount}
                  <span className="visually-hidden">
                    alertas ativos
                  </span>
                </Badge>
              )}
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/sobre"
              className={linkClass}
            >
              <Info size={17} aria-hidden="true" />
              Sobre
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}



export default AppNavbar