import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import { FireDataProvider } from './context/FireDataContext'
import { UserFeaturesProvider } from './context/UserFeaturesProvider'
import AppNavbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppWidget from './components/WhatsAppWidget'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import Alerts from './pages/Alerts'
import About from './pages/About'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import { useUserFeatures } from './context/useUserFeatures'

function RequireUser({ children }) {
  const { currentUser } = useUserFeatures()
  const location = useLocation()

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <FireDataProvider>
        <UserFeaturesProvider>
          <div className="app-layout">
            <AppNavbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mapa" element={<MapPage />} />
                <Route path="/alertas" element={<Alerts />} />
                <Route path="/sobre" element={<About />} />
                <Route path="/login" element={<Auth />} />
                <Route
                  path="/perfil"
                  element={
                    <RequireUser>
                      <Profile />
                    </RequireUser>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <WhatsAppWidget />
          </div>
        </UserFeaturesProvider>
      </FireDataProvider>
    </BrowserRouter>
  )
}

export default App