// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const API_URL = 'http://localhost:3000'

Cypress.Commands.add('cadastrarViaApi', (usuario) => {
  return cy.request({
    method: 'POST',
    url: `${API_URL}/auth/cadastro`,
    body: {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      telefone: usuario.telefone || '85985212359',
      aceitaWhatsapp: true,
    },
    failOnStatusCode: false,
  })
})

Cypress.Commands.add('loginViaUi', (email, senha) => {
  cy.visit('/login')
  cy.get('#login-tab').click()
  cy.get('#auth-email').clear().type(email)
  cy.get('#auth-password').clear().type(senha)
  cy.get('.auth-submit').click()
})