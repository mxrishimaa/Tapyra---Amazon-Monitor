describe('01 - Mapa, Satélite (NASA FIRMS) e Navegação', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/area/csv/**').as('getFirms')
  })

  it('Deve carregar a página inicial e navegar até o mapa com marcadores', () => {
    cy.visit('/')
    cy.get('nav').should('be.visible')

    cy.visit('/mapa')
    cy.get('.leaflet-container', { timeout: 10000 }).should('be.visible')
  })

  it('Deve navegar entre as seções principais pelo menu', () => {
    cy.visit('/')
    cy.contains('a', /alertas/i).click()
    cy.url().should('include', '/alertas')
    cy.contains('h1', 'Alertas recentes').should('be.visible')

    cy.contains('a', /entre ou cadastre-se/i).click()
    cy.url().should('include', '/login')
    cy.contains('h1', 'Acesse sua conta').should('be.visible')
  })

  it('Deve tratar graciosamente quando a API NASA FIRMS retornar erro', () => {
    cy.intercept('GET', '**/api/area/csv/**', {
      statusCode: 500,
      body: 'Internal Server Error',
    }).as('getFirmsErro')

    cy.visit('/alertas')
    cy.wait('@getFirmsErro')
    cy.contains(/não foi possível atualizar/i).should('be.visible')
  })
})