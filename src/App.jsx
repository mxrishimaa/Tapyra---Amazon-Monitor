import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import SplashScreen from './components/SplashScreen'
import { FireDataProvider } from './context/FireDataContext'
import AppNavbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import Alerts from './pages/Alerts'
import About from './pages/About'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false)
  }, [])

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <FireDataProvider>
        <div className={`app-layout ${showSplash ? 'app-layout--booting' : ''}`}>
          <AppNavbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mapa" element={<MapPage />} />
              <Route path="/alertas" element={<Alerts />} />
              <Route path="/sobre" element={<About />} />
              <Route
                path="*"
                element={
                  <div className="p-5 text-center">
                    <h2>Página não encontrada</h2>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </FireDataProvider>
    </BrowserRouter>
  )
}

export default App