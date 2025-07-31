describe('Audit Results Page', () => {
  beforeEach(() => {
    cy.seedTestData();
  });

  it('should visit audit results page with seeded data', () => {
    cy.visit('/project/1/auditresults');
    cy.contains('Audit Results').should('exist');
    cy.contains('Test Project').should('exist');
    cy.contains('Example Title').should('exist');
  });
});
