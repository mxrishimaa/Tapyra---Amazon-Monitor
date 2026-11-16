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

// Componente raiz: reúne a navegação, os dados compartilhados e as páginas.
function App() {
  // Este estado decide se a tela de abertura ainda deve aparecer.
  const [showSplash, setShowSplash] = useState(true)

  // useCallback mantém a mesma função entre renderizações; a tela inicial a
  // chama quando sua animação termina.
  const handleSplashFinish = useCallback(() => {
    setShowSplash(false)
  }, [])

  return (
    // BrowserRouter habilita navegação por URL sem recarregar a página inteira.
    <BrowserRouter>
      {/* A tela de abertura só é montada enquanto showSplash for verdadeiro. */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      {/* O Provider disponibiliza os dados de focos para os componentes filhos. */}
      <FireDataProvider>
        <div className={`app-layout ${showSplash ? 'app-layout--booting' : ''}`}>
          <AppNavbar />
          <main className="main-content">
            {/* Cada Route associa um endereço a um componente de página. */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mapa" element={<MapPage />} />
              <Route path="/alertas" element={<Alerts />} />
              <Route path="/sobre" element={<About />} />
              {/* Rota curinga: conteúdo exibido quando o endereço não existe. */}
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

// Exporta o componente para que main.jsx possa montá-lo na página.
export default App