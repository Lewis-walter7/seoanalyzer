/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login (example)
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid=email-input]').type(email);
  cy.get('[data-testid=password-input]').type(password);
  cy.get('[data-testid=login-button]').click();
});

// Custom command to seed test data
Cypress.Commands.add('seedTestData', () => {
  // This would typically call an API endpoint to seed test data
  cy.request('POST', '/api/test/seed', {
    projects: [
      {
        id: '1',
        name: 'Test Project',
        url: 'https://example.com',
        audits: [
          {
            id: 'audit-1',
            createdAt: '2024-01-01T00:00:00Z',
            pages: [
              {
                id: 'page-1',
                url: 'https://example.com',
                titleTag: 'Example Title',
                metaDescription: 'Example description',
                h1Count: 1,
                imgMissingAlt: 0,
                totalLinks: 10,
                performanceScore: 85,
                seoScore: 90,
                accessibilityScore: 80,
                internalLinksCount: 5,
                externalLinksCount: 5,
                brokenLinksCount: 0,
                loadTime: 2.5,
                pageSize: 1024,
                hasCanonical: true,
                isIndexable: true,
                crawledAt: '2024-01-01T00:00:00Z'
              }
            ]
          }
        ]
      }
    ]
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      seedTestData(): Chainable<void>
    }
  }
}

