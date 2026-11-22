describe('03 - Perfil do Usuário e Preferências de WhatsApp', () => {
  const usuario = {
    nome: 'Morador Perfil Teste',
    email: `perfil.${Date.now()}@tapyra.com`,
    telefone: '85985212359',
    senha: 'SenhaSegura123',
  }

  before(() => {
    cy.cadastrarViaApi(usuario)
  })

  beforeEach(() => {
    cy.intercept('PATCH', '**/usuarios/me/whatsapp').as('patchWhatsapp')
    cy.loginViaUi(usuario.email, usuario.senha)
    cy.url().should('include', '/perfil')
  })

  it('Deve exibir os dados do usuário logado na página de perfil', () => {
    cy.get('#profile-name').should('have.value', usuario.nome)
    cy.get('#profile-email').should('have.value', usuario.email)
  })

  it('Deve sincronizar alteração de telefone/WhatsApp com o backend', () => {
    cy.get('input[type="tel"]').clear().type('92991234567')
    cy.contains('button', /salvar/i).click()

    cy.wait('@patchWhatsapp').its('response.statusCode').should('eq', 200)
  })

  it('Deve encerrar a sessão ao clicar em Sair e limpar o localStorage', () => {
    cy.contains('button', /sair/i).click()
    cy.window().its('localStorage.tapyra_token').should('be.undefined')
  })
})