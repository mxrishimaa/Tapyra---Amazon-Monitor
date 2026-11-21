describe('04 - Alertas da Comunidade e Disparo WhatsApp', () => {
  const usuario = {
    nome: 'Operador Alertas',
    email: `alertas.${Date.now()}@tapyra.com`,
    telefone: '85985212359',
    senha: 'SenhaSegura123',
  }

  before(() => {
    cy.cadastrarViaApi(usuario)
  })

  it('Visitante não logado deve ver botão de redirecionamento para login', () => {
    cy.visit('/alertas')
    cy.contains('a', 'Entre ou cadastre-se para criar um alerta')
      .should('be.visible')
      .click()
    cy.url().should('include', '/login')
  })

  it('Usuário logado deve abrir o formulário, publicar alerta e acionar broadcast', () => {
    cy.intercept('POST', '**/notificacoes/broadcast', {
      statusCode: 200,
      body: { ok: true, enviados: 1 },
    }).as('postBroadcast')

    cy.intercept('POST', '**/auth/login').as('postLogin')

    cy.loginViaUi(usuario.email, usuario.senha)
    cy.wait('@postLogin').its('response.statusCode').should('eq', 200)
    cy.url().should('include', '/perfil')

    cy.visit('/alertas')

    cy.contains('button', 'Criar um alerta').click()
    cy.get('#community-location').type('Iranduba - AM')
    cy.get('#community-severity').select('Crítico')
    cy.get('#community-description').type('Foco ativo próximo à rodovia AM-070.')
    cy.get('#community-alert-form button[type="submit"]').click()

    cy.wait('@postBroadcast').then((interception) => {
      expect(interception.request.body).to.include({
        nivel: 'Crítico',
        regiao: 'Iranduba - AM',
      })
    })

    cy.contains('Relato publicado e alerta enviado por WhatsApp').should('be.visible')
    cy.contains('Iranduba - AM').should('be.visible')
  })
})