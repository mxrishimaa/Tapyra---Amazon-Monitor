import { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import { Link } from 'react-router-dom'
import { useUserFeatures } from '../context/useUserFeatures'

const NIVEL_LABEL = {
  atencao: 'Atenção',
  alerta: 'Alerta',
  critico: 'Crítico',
}

function Profile() {
  const {
    changePassword,
    profile,
    updateProfile,
    currentUser,
    fetchRegions,
    fetchMyRegions,
    subscribeRegion,
    unsubscribeRegion,
  } = useUserFeatures()

  const [form, setForm] = useState(profile)
  const [availableRegions, setAvailableRegions] = useState([])
  const [myRegions, setMyRegions] = useState([])
  const [selectedRegionId, setSelectedRegionId] = useState('')
  const [nivelMinimo, setNivelMinimo] = useState('atencao')
  const [loadingRegions, setLoadingRegions] = useState(false)
  const [savingRegion, setSavingRegion] = useState(false)
  const [savingAccount, setSavingAccount] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [accountNotice, setAccountNotice] = useState('')
  const [passwordNotice, setPasswordNotice] = useState('')

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: profile.name || prev.name,
      email: profile.email || prev.email,
      phone: profile.phone || prev.phone,
      notifications: profile.notifications || prev.notifications,
    }))
  }, [profile])

  useEffect(() => {
    let active = true

    async function loadRegionsData() {
      setLoadingRegions(true)
      try {
        const allRegions = await fetchRegions()
        if (!active) return
        setAvailableRegions(allRegions)
        if (allRegions.length > 0 && !selectedRegionId) {
          setSelectedRegionId(String(allRegions[0].id))
        }

        if (currentUser) {
          const mine = await fetchMyRegions()
          if (active) {
            setMyRegions(mine)
          }
        } else if (active) {
          setMyRegions([])
        }
      } catch (err) {
        if (active) {
          setAccountNotice(err.message || 'Não foi possível carregar as regiões.')
        }
      } finally {
        if (active) {
          setLoadingRegions(false)
        }
      }
    }

    loadRegionsData()
    return () => {
      active = false
    }
  }, [currentUser, fetchRegions, fetchMyRegions])

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

  async function saveAccountChanges() {
    setSavingAccount(true)
    setAccountNotice('')
    try {
      await updateProfile(form)
      setAccountNotice(
        'Preferência de WhatsApp salva no servidor. (Edição de nome/e-mail ainda não possui rota completa no back-end.)'
      )
    } catch (err) {
      setAccountNotice(err.message || 'Erro ao salvar alterações.')
    } finally {
      setSavingAccount(false)
    }
  }

  async function handleAddRegion(event) {
    event.preventDefault()
    setAccountNotice('')

    if (!currentUser) {
      setAccountNotice('Faça login para vincular regiões à sua conta.')
      return
    }

    if (!selectedRegionId) {
      setAccountNotice('Selecione uma região na lista.')
      return
    }

    const jaInscrito = myRegions.some(
      (item) => Number(item.regiao_id ?? item.regiao?.id) === Number(selectedRegionId)
    )
    if (jaInscrito) {
      setAccountNotice('Você já acompanha essa região.')
      return
    }

    setSavingRegion(true)
    try {
      await subscribeRegion(Number(selectedRegionId), nivelMinimo)
      const updated = await fetchMyRegions()
      setMyRegions(updated)
      setAccountNotice('Região adicionada com sucesso ao seu perfil.')
    } catch (err) {
      setAccountNotice(err.message || 'Erro ao adicionar região.')
    } finally {
      setSavingRegion(false)
    }
  }

  async function handleRemoveRegion(regiaoId) {
    setAccountNotice('')
    setSavingRegion(true)
    try {
      await unsubscribeRegion(regiaoId)
      setMyRegions((current) =>
        current.filter((item) => Number(item.regiao_id ?? item.regiao?.id) !== Number(regiaoId))
      )
      setAccountNotice('Região removida do seu perfil.')
    } catch (err) {
      setAccountNotice(err.message || 'Erro ao remover região.')
    } finally {
      setSavingRegion(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordNotice('')

    const formElement = event.currentTarget
    const formData = new FormData(formElement)
    const currentPassword = String(formData.get('currentPassword') || '')
    const newPassword = String(formData.get('newPassword') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (newPassword !== confirmPassword) {
      setPasswordNotice('A nova senha e a confirmação precisam ser iguais.')
      return
    }

    if (currentPassword === newPassword) {
      setPasswordNotice('A nova senha deve ser diferente da senha atual.')
      return
    }

    setSavingPassword(true)

    try {
      const mensagem = await changePassword({ currentPassword, newPassword })
      setPasswordNotice(mensagem)
      formElement.reset()
    } catch (err) {
      setPasswordNotice(err.message || 'Erro ao alterar a senha.')
    } finally {
      setSavingPassword(false)
    }
  }


return (
  <Container className="profile-page py-5">
    <header className="mb-4">
      <h1 className="h3 text-verde mb-2">Perfil do usuário:</h1>
      <p className="text-muted mb-0">
        Gerencie seus dados, notificações e regiões monitoradas.
      </p>
    </header>
    <div className="alert alert-info border-0" role="status">
      As regiões monitoradas podem ser fixadas e ficam salvas na sua conta.
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
              <h2 className="h5 text-verde mb-3">Dados da conta:</h2>
              <div className="profile-fields">
                <div>
                  <label className="form-label" htmlFor="profile-name">Nome Completo:</label>
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
                  <label className="form-label" htmlFor="profile-email">E-mail:</label>
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
                  <label className="form-label" htmlFor="profile-phone">Telefone:</label>
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
                A opção de WhatsApp é salva na sua conta ao clicar em salvar.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="profile-card h-100">
            <Card.Body>
              <h2 className="h5 text-verde mb-3">Regiões monitoradas</h2>

              <form className="d-flex flex-wrap gap-2" onSubmit={handleAddRegion}>
                <label className="visually-hidden" htmlFor="profile-region">
                  Selecionar região
                </label>
                <select
                  id="profile-region"
                  className="form-select"
                  value={selectedRegionId}
                  onChange={(event) => setSelectedRegionId(event.target.value)}
                  disabled={loadingRegions || savingRegion || availableRegions.length === 0}
                >
                  {availableRegions.length === 0 ? (
                    <option value="">Carregando regiões...</option>
                  ) : (
                    availableRegions.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.nome_regiao} {reg.codigo_estado ? `(${reg.codigo_estado})` : ''}
                      </option>
                    ))
                  )}
                </select>
                <h6>Nível de Alerta:</h6>
                <label className="visually-hidden" htmlFor="profile-region-level">
                  Nível mínimo de alerta
                </label>
                <select
                  id="profile-region-level"
                  className="form-select w-auto"
                  value={nivelMinimo}
                  onChange={(event) => setNivelMinimo(event.target.value)}
                  disabled={savingRegion}
                >
                  <option value="atencao">Atenção</option>
                  <option value="alerta">Alerta</option>
                  <option value="critico">Crítico</option>
                </select>


                <button
                  type="submit"
                  className="btn btn-laranja flex-shrink-0"
                  disabled={savingRegion || loadingRegions}
                >
                  {savingRegion ? 'Salvando...' : 'Adicionar'}
                </button>
              </form>

              {loadingRegions ? (
                <p className="small text-muted mt-3 mb-0">Carregando regiões...</p>
              ) : myRegions.length > 0 ? (
                <ul className="profile-region-list mt-3">
                  {myRegions.map((item) => {
                    const regId = item.regiao_id ?? item.regiao?.id
                    const nomeExibicao =
                      item.regiao?.nome_regiao || `Região #${regId}`
                    const uf = item.regiao?.codigo_estado
                      ? ` (${item.regiao.codigo_estado})`
                      : ''
                    const nivelTexto = NIVEL_LABEL[item.nivel_minimo] || item.nivel_minimo

                    return (
                      <li key={regId}>
                        <span>
                          {nomeExibicao}
                          {uf} — <strong>{nivelTexto}</strong>
                        </span>
                        <button
                          type="button"
                          className="profile-region-remove"
                          aria-label={`Remover ${nomeExibicao}`}
                          disabled={savingRegion}
                          onClick={() => handleRemoveRegion(regId)}
                        >
                          Remover
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="small text-muted mt-3 mb-0">
                  {currentUser
                    ? 'Nenhuma região adicionada ainda.'
                    : 'Faça login para ver e gerenciar suas regiões.'}
                </p>
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
                <button type="submit" className="btn btn-outline-success" disabled={savingPassword}>{savingPassword ? 'Atualizando...' : 'Atualizar senha'}</button>
                {passwordNotice && <p className="profile-notice" role="status">{passwordNotice}</p>}
              </form>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12}>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <button
              type="button"
              className="btn btn-laranja"
              disabled={savingAccount}
              onClick={saveAccountChanges}
            >
              {savingAccount ? 'Salvando...' : 'Salvar dados e preferências'}
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