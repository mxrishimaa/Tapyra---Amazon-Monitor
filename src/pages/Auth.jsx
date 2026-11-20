import { useState } from 'react'
import Container from 'react-bootstrap/Container'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUserFeatures } from '../context/useUserFeatures'

function Auth() {
  const [mode, setMode] = useState('login')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { loginUser, registerUser } = useUserFeatures()
  const location = useLocation()
  const navigate = useNavigate()
  const isRegistering = mode === 'register'

  function changeMode(nextMode) {
    setMode(nextMode)
    setNotice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email').trim()
    const password = formData.get('password')

    if (isRegistering && password !== formData.get('confirmPassword')) {
      setNotice('As senhas não conferem. Verifique os campos e tente novamente.')
      return
    }

    setSubmitting(true)
    try {
      if (!isRegistering) {
        await loginUser({ email, password })
      } else {
        const name = formData.get('name').trim()
        if (!name) {
          setNotice('Informe seu nome para criar a conta.')
          setSubmitting(false)
          return
        }
        const phone = (formData.get('phone') || '').trim()
        const acceptWhatsapp = Boolean(formData.get('acceptWhatsapp'))

        await registerUser({
          name,
          email,
          password,
          phone,
          acceptWhatsapp,
        })
      }

      navigate(location.state?.from || '/perfil', { replace: true })
    } catch (err) {
      setNotice(err.message || 'Erro ao conectar com o servidor.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="auth-page py-5">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-heading">
          <span className="auth-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
            </svg>
          </span>
          <p className="auth-eyebrow">Bem-vindo à Tapyra</p>
          <h1 id="auth-title">{isRegistering ? 'Crie sua conta' : 'Acesse sua conta'}</h1>
          <p className="auth-intro">
            {isRegistering
              ? 'Cadastre-se para acompanhar as informações da sua região.'
              : 'Entre para acompanhar as informações da sua região.'}
          </p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Acesso à conta">
          <button
            type="button"
            role="tab"
            id="login-tab"
            aria-selected={!isRegistering}
            aria-controls="auth-form"
            className={isRegistering ? '' : 'active'}
            onClick={() => changeMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            id="register-tab"
            aria-selected={isRegistering}
            aria-controls="auth-form"
            className={isRegistering ? 'active' : ''}
            onClick={() => changeMode('register')}
          >
            Criar conta
          </button>
        </div>

        <form
          id="auth-form"
          className="auth-form"
          role="tabpanel"
          aria-labelledby={isRegistering ? 'register-tab' : 'login-tab'}
          onSubmit={handleSubmit}
        >
          {isRegistering && (
            <div className="auth-field">
              <label htmlFor="auth-name">Nome completo</label>
              <input
                id="auth-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Como podemos chamar você?"
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">E-mail</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              required
            />
          </div>

        {isRegistering && (
          <div className="auth-field">
            <label htmlFor="auth-phone">WhatsApp (opcional)</label>
              <div className="auth-phone-row">
              <input
                id="auth-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(92) 99999-0000"
              />
            <label className="auth-check">
              <input type="checkbox" name="acceptWhatsapp" defaultChecked />
              <span>Receber alertas de queimadas no WhatsApp</span>
            </label>
              </div>
            </div>
)}

          <div className="auth-field">
            <label htmlFor="auth-password">Senha</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              placeholder="Mínimo de 8 caracteres"
              minLength={8}
              required
            />
          </div>

          {isRegistering && (
            <div className="auth-field">
              <label htmlFor="auth-confirm-password">Confirme sua senha</label>
              <input
                id="auth-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Digite a senha novamente"
                minLength={8}
                required
              />
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting
              ? 'Aguarde...'
              : isRegistering
                ? 'Criar minha conta'
                : 'Entrar'}
          </button>
          {notice && <p className="auth-notice" role="status">{notice}</p>}
        </form>
      </section>
    </Container>
  )
}

export default Auth