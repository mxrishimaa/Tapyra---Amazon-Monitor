import { useState } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import { Link } from 'react-router-dom'
import { useUserFeatures } from '../context/useUserFeatures'

function Profile() {
  const { profile, updateProfile } = useUserFeatures()
  const [form, setForm] = useState(profile)
  const [regionInput, setRegionInput] = useState('')
  const [accountNotice, setAccountNotice] = useState('')
  const [passwordNotice, setPasswordNotice] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function updateNotification(event) {
    const { name, checked } = event.target
    setForm((current) => ({
      ...current,
      notifications: { ...current.notifications, [name]: checked },
    }))
  }

  function saveAccountChanges() {
    updateProfile(form)
    setAccountNotice('Dados atualizados nesta prévia. A gravação permanente depende do backend.')
  }

  function addRegion(event) {
    event.preventDefault()
    const region = regionInput.trim()
    if (!region) return

    if (form.regions.some((item) => item.toLowerCase() === region.toLowerCase())) {
      setAccountNotice('Essa região já está na sua lista.')
      return
    }

    setForm((current) => ({ ...current, regions: [...current.regions, region] }))
    setRegionInput('')
    setAccountNotice('')
  }

  function removeRegion(regionToRemove) {
    setForm((current) => ({
      ...current,
      regions: current.regions.filter((region) => region !== regionToRemove),
    }))
  }

  function handlePasswordSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    if (formData.get('newPassword') !== formData.get('confirmPassword')) {
      setPasswordNotice('A nova senha e a confirmação precisam ser iguais.')
      return
    }

    setPasswordNotice('A alteração de senha será ativada quando o backend estiver conectado. Nenhuma senha foi armazenada.')
    event.currentTarget.reset()
  }

  return (
    <Container className="profile-page py-5">
      <header className="mb-4">
        <h1 className="h3 text-verde mb-2">Perfil do usuário</h1>
        <p className="text-muted mb-0">
          Gerencie seus dados, notificações e regiões monitoradas.
        </p>
      </header>

      <div className="alert alert-info border-0" role="status">
        Prévia do frontend: os dados desta página ficam apenas nesta sessão do navegador e serão conectados ao backend depois.
      </div>

      <div className="d-flex flex-wrap justify-content-end mb-4">
        <Link to="/alertas?novo=1" className="btn btn-laranja">
          Criar um alerta
        </Link>
      </div>

      <div>
        <Row className="g-4">
          <Col lg={6}>
            <Card className="profile-card h-100">
              <Card.Body>
                <h2 className="h5 text-verde mb-3">Dados da conta</h2>
                <div className="profile-fields">
                  <div>
                    <label className="form-label" htmlFor="profile-name">Nome completo</label>
                    <input
                      id="profile-name"
                      className="form-control"
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      autoComplete="name"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="profile-email">E-mail</label>
                    <input
                      id="profile-email"
                      className="form-control"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      autoComplete="email"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="profile-phone">Telefone</label>
                    <input
                      id="profile-phone"
                      className="form-control"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={updateField}
                      autoComplete="tel"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="profile-card h-100">
              <Card.Body>
                <h2 className="h5 text-verde mb-3">Preferências de notificações</h2>
                <div className="profile-preferences">
                  <Form.Check
                    id="notify-email"
                    name="email"
                    label="Receber por e-mail"
                    checked={form.notifications.email}
                    onChange={updateNotification}
                  />
                  <Form.Check
                    id="notify-whatsapp"
                    name="whatsapp"
                    label="Receber pelo WhatsApp"
                    checked={form.notifications.whatsapp}
                    onChange={updateNotification}
                  />
                  <Form.Check
                    id="notify-browser"
                    name="browser"
                    label="Receber notificações no navegador"
                    checked={form.notifications.browser}
                    onChange={updateNotification}
                  />
                </div>
                <p className="small text-muted mt-3 mb-0">
                  Os canais serão ativados quando os serviços de notificação forem conectados.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="profile-card h-100">
              <Card.Body>
                <h2 className="h5 text-verde mb-3">Regiões monitoradas</h2>
                <div className="d-flex gap-2">
                  <label className="visually-hidden" htmlFor="profile-region">Adicionar região</label>
                  <input
                    id="profile-region"
                    className="form-control"
                    value={regionInput}
                    onChange={(event) => setRegionInput(event.target.value)}
                    placeholder="Ex.: Manaus, AM"
                  />
                  <button type="button" className="btn btn-laranja flex-shrink-0" onClick={addRegion}>
                    Adicionar
                  </button>
                </div>
                {form.regions.length > 0 ? (
                  <ul className="profile-region-list">
                    {form.regions.map((region) => (
                      <li key={region}>
                        <span>{region}</span>
                        <button
                          type="button"
                          className="profile-region-remove"
                          aria-label={`Remover ${region}`}
                          onClick={() => removeRegion(region)}
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="small text-muted mt-3 mb-0">Nenhuma região adicionada.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="profile-card h-100">
              <Card.Body>
                <h2 className="h5 text-verde mb-3">Alteração de senha</h2>
                <form className="profile-fields" onSubmit={handlePasswordSubmit}>
                  <div>
                    <label className="form-label" htmlFor="current-password">Senha atual</label>
                    <input id="current-password" className="form-control" name="currentPassword" type="password" autoComplete="current-password" minLength={8} required />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="new-password">Nova senha</label>
                    <input id="new-password" className="form-control" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="confirm-password">Confirme a nova senha</label>
                    <input id="confirm-password" className="form-control" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
                  </div>
                  <button type="submit" className="btn btn-outline-success">Atualizar senha</button>
                  {passwordNotice && <p className="profile-notice" role="status">{passwordNotice}</p>}
                </form>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12}>
            <div className="d-flex flex-wrap align-items-center gap-3">
              <button type="button" className="btn btn-laranja" onClick={saveAccountChanges}>
                Salvar dados e preferências
              </button>
              {accountNotice && <p className="profile-notice mb-0" role="status">{accountNotice}</p>}
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default Profile
