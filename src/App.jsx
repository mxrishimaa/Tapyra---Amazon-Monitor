import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import AppNavbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import Alerts from './pages/Alerts'
import About from './pages/About'

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <AppNavbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/alertas" element={<Alerts />} />
            <Route path="/sobre" element={<About />} />
            {/* Rota Fallback 404*/}
            <Route path='*' element={<div className='p-5 text-center'><h2>Página não encontrada</h2></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App