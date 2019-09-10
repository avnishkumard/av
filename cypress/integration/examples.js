import { source } from 'common-tags'

// add different Cypress test examples we want to test
export default {
  'Cypress examples': {
    '.get()': {
      '.get()': {
        html: source`
          <div id="my-element">Hi there</div>
        `,
        test: source`
          cy.get('#my-element')
        `
      }
    },
    'select input by label': {
      html: source`
        <label for="myinput">My Text</label>
        <input type="text" id="myinput" />
      `,
      test: source`
        // select input by ID
        cy.get('input#myinput')

        // a little function to select input by ID in the label
        const inputByLabelText = (text) =>
          cy.contains('label', text)
            .invoke('attr', 'for')
            .then(forInput => cy.get('input#' + forInput))

        // select first the label by text
        inputByLabelText('My Text')
          .should('be.visible')
      `
    },
    'select input by label using custom command': {
      html: source`
        <label for="myinput">My Text</label>
        <input type="text" id="myinput" />
      `,
      test: source`
        Cypress.Commands.add('inputByLabelText', (text) =>
          cy.contains('label', text)
            .invoke('attr', 'for')
            .then(forInput => cy.get('input#' + forInput))
        )
        cy.inputByLabelText('My Text')
          .should('be.visible')
      `
    },
    'within row scope': {
      html: source`
        <table>
          <tr>
            <td>My first client</td>
            <td>My first project</td>
            <td>0</td>
            <td>Active</td>
            <td><button>Edit</button></td>
          </tr>
        </table>
      `,
      test: source`
        cy.contains('My first client').parent('tr').within(() => {
          cy.get('td').eq(1).should('contain', 'My first project')
          cy.get('td').eq(2).should('contain', '0')
          cy.get('td').eq(3).should('contain', 'Active')
          cy.get('td').eq(4).should('contain', 'Edit').find('button').click()
        })
      `
    },
    'within row scope using contains': {
      html: source`
        <div>Notes about My first project</div>
        <table>
          <tr>
            <td>My first client</td>
            <td>My first project</td>
            <td>0</td>
            <td>Active</td>
            <td><button>Edit</button></td>
          </tr>
        </table>
      `,
      test: source`
        cy.contains('My first client').parent('tr').within(() => {
          cy.get('td').eq(1).contains('My first project')
          cy.get('td').eq(2).contains('0')
          cy.get('td').eq(3).contains('Active')
          cy.get('td').eq(4).contains('button', 'Edit').click()
        })
      `
    },
    'exact then inexact matches using jQuery and cypress-pipe': {
      html: source`
        <div id="example">
          <div id="inexact">my item</div>
          <div id="exact">item</div>
        </div>
      `,
      test: source`
        const exactThenInexact = (text) => $el => {
          const r = new RegExp('^' + text + '$')
          let found
          $el.children().each(function (k, v) {
            if (found) return
            if (Cypress.$(v).text().match(r)) {
              found = Cypress.$(v)
            }
          })

          if (!found) {
            // now try to find inexact match
            $el.children().each(function (k, v) {
              if (found) return
              if (Cypress.$(v).text().includes(text)) {
                found = Cypress.$(v)
              }
            })
          }

          return cy.wrap(found)
        }
        const containsExactThenInexactText = (text) =>
          cy.get('div').pipe(exactThenInexact(text))

        containsExactThenInexactText('item').should('have.attr', 'id', 'exact')
        containsExactThenInexactText('my').should('have.attr', 'id', 'inexact')
      `
    },
    'contains exact label match': {
      html: source`
        <div class="form-group">
          <label for="client_default_rate_type">Default rate type</label>
          <select name="client[default_rate_type]" id="client_default_rate_type"><option value="hourly">hourly</option><option selected="selected" value="weekly">weekly</option></select>
        </div>
        <div class="form-group">
          <label for="client_default_rate">Default rate</label>
          <input type="text" value="50.00" name="client[default_rate]" id="client_default_rate">
        </div>
      `,
      test: source`
        cy.contains('label', /^Default rate$/)
          .should('have.attr', 'for', 'client_default_rate')
      `
    },
    'single a': {
      only: false,
      html: source`
        <a id="single">Single anchor</a>
      `,
      test: source`
        // yields "a"
        cy.get('a').should('have.id', 'single')
      `
    },
    'several classes': {
      only: false,
      html: source`
        <div>
          <div class="one two three">incorrect element</div>
          <div class="one two three four">correct element</div>
        </div>
      `,
      test: source`
        cy.get('.one.two.three.four').should('have.text', 'correct element')
      `
    }
  }
}
