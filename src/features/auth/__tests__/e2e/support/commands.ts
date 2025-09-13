// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-testid attribute
       * @example cy.getByTestId('submit-button')
       */
      getByTestId(selector: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to login
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to register
       * @example cy.register({ firstName: 'John', lastName: 'Doe', email: 'user@example.com', password: 'password', role: 'patient' })
       */
      register(userData: { firstName: string; lastName: string; email: string; password: string; role: string }): Chainable<void>;
    }
  }
}

export {};