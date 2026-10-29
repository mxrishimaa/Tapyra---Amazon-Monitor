import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import { FireDataProvider } from './context/FireDataContext'
import AppNavbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import Alerts from './pages/Alerts'
import About from './pages/About'

function App() {
  return (
    <BrowserRouter>
      <FireDataProvider>
        <div className="app-layout">
          <AppNavbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mapa" element={<MapPage />} />
              <Route path="/alertas" element={<Alerts />} />
              <Route path="/sobre" element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </FireDataProvider>
    </BrowserRouter>
  )
}

export default App