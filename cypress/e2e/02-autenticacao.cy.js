describe('02 - Autenticação, Cadastro e Sessão JWT', () => {
  const usuario = {
    nome: 'Usuário Completo Tapyra',
    email: `completo.${Date.now()}@tapyra.com`,
    telefone: '85985212359',
    senha: 'SenhaSegura123',
  }

  beforeEach(() => {
    cy.intercept('POST', '**/auth/cadastro').as('postCadastro')
    cy.intercept('POST', '**/auth/login').as('postLogin')
    cy.intercept('GET', '**/auth/me').as('getMe')
  })

  it('Deve bloquear cadastro com senhas diferentes', () => {
    cy.visit('/login')
    cy.get('#register-tab').click()
    cy.get('#auth-name').type(usuario.nome)
    cy.get('#auth-email').type(usuario.email)
    cy.get('#auth-password').type('Senha12345')
    cy.get('#auth-confirm-password').type('OutraSenha99')
    cy.get('.auth-submit').click()

    cy.get('.auth-notice').should('contain', 'As senhas não conferem')
  })

  it('Deve cadastrar novo usuário e salvar token no localStorage', () => {
    cy.visit('/login')
    cy.get('#register-tab').click()
    cy.get('#auth-name').type(usuario.nome)
    cy.get('#auth-email').type(usuario.email)
    cy.get('#auth-phone').type(usuario.telefone)
    cy.get('#auth-password').type(usuario.senha)
    cy.get('#auth-confirm-password').type(usuario.senha)
    cy.get('.auth-submit').click()

    cy.wait('@postCadastro').its('response.statusCode').should('eq', 201)
    cy.window().its('localStorage.tapyra_token').should('be.a', 'string')
    cy.url().should('include', '/perfil')
  })

  it('Deve impedir cadastro duplicado com o mesmo e-mail (HTTP 409)', () => {
    cy.visit('/login')
    cy.get('#register-tab').click()
    cy.get('#auth-name').type(usuario.nome)
    cy.get('#auth-email').type(usuario.email)
    cy.get('#auth-password').type(usuario.senha)
    cy.get('#auth-confirm-password').type(usuario.senha)
    cy.get('.auth-submit').click()

    cy.wait('@postCadastro').its('response.statusCode').should('eq', 409)
    cy.get('.auth-notice').should('be.visible')
  })

  it('Deve exibir erro ao tentar login com senha incorreta (HTTP 401)', () => {
    cy.loginViaUi(usuario.email, 'SenhaErrada999')
    cy.wait('@postLogin').its('response.statusCode').should('eq', 401)
    cy.get('.auth-notice').should('be.visible')
  })

  it('Deve autenticar com sucesso e manter sessão ativa após reload (F5)', () => {
    cy.loginViaUi(usuario.email, usuario.senha)
    cy.wait('@postLogin').its('response.statusCode').should('eq', 200)
    cy.url().should('include', '/perfil')

    // Vai para /alertas e espera a primeira checagem de sessão terminar
    cy.visit('/alertas')
    cy.wait('@getMe')

    // Agora sim dá o F5 e confere que a sessão foi restaurada
    cy.reload()
    cy.wait('@getMe').its('response.statusCode').should('be.oneOf', [200, 304])
    cy.contains('button', 'Criar um alerta').should('be.visible')
  })
})