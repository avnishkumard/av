# cypress-fiddle [![renovate-app badge][renovate-badge]][renovate-app] [![CircleCI](https://circleci.com/gh/cypress-io/cypress-fiddle/tree/master.svg?style=svg)](https://circleci.com/gh/cypress-io/cypress-fiddle/tree/master)
> Generate Cypress tests live from HTML and JS

Instantly experiment with Cypress tests by creating a tiny live HTML fiddle and running E2E tests against it.

![runExample test](images/runExample.png)
\\
## Install

Cypress is a peer dependency of this module. Install the current version of Cypress by running `npm i -D cypress`.

After installing Cypress, install this module via npm:

```shell
npm i -D @cypress/fiddle
```

Then load the custom command by adding the following line to `cypress/support/index.js`

```js
// adds "cy.runExample()" command
import '@cypress/fiddle'
```

## Use

### Create a single test

You can take an object with an `html` property containing HTML and a `test` property containing Cypress commands and run the tests.

For example in the `cypress/integration/spec.js` file:

```js
// loads TypeScript definition for Cypress
// and "cy.runExample" custom command
/// <reference types="@cypress/fiddle" />

const helloTest = {
  html: `
    <div>Hello</div>
  `,
  test: `
    cy.get('div').should('have.text', 'Hello')
  `
}

it('tests hello', () => {
  cy.runExample(helloTest)
})
```

Which produces

![runExample test](images/runExample.png)

### Parameters

The test object can have multiple properties, see [src/index.d.ts](src/index.d.ts) for all.

- `test` JavaScript with Cypress commands, required

The rest of the properties are optional

- `html` to mount as DOM nodes before the test begins
- `name` the name to display at the top of the page, otherwise the test title will be used
- `description` extra test description under the name, supports Markdown via [safe-marked](https://github.com/azu/safe-marked)
- `commonHtml` is extra HTML markup to attach to the live HTML (if any) element. Useful for loading external stylesheets or styles without cluttering every HTML block

The next properties are NOT used by `cy.runExample` but are used by the `testExamples` function from this package.

- `skip` creates a skipped test with `it.skip`
- `only` creates an exclusive test with `it.only`

### Included scripts

- [jQuery minified](https://code.jquery.com/)
- [Highlight.js](https://highlightjs.org/)

You can include your own additional scripts by using environment variable block in `cypress.json` file

```json
{
  "env": {
    "cypress-fiddle": {
      "scripts": [
        "https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js"
      ]
    }
  }
}
```

### Styles

Sometimes you want to inject external stylesheets and maybe custom style CSS into the frame (we already include Highlight.js). Pass additional CSS link urls and custom styles through environment variables in `cypress.json` config file.

```json
{
  "env": {
    "cypress-fiddle": {
      "stylesheets": [
        "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
      ],
      "style": "body { padding: 1rem; }"
    }
  }
}
```

**Tip:** it is more convenient to set multiline environment variables or even load CSS files from plugins file.

### Create multiple tests

Instead of writing the `cy.runExample()` command one by one, you can collect all test definitions into a list or a nested object of suites and create tests automatically.

For example, here is a list of tests created from an array:

```js
import { testExamples } from '@cypress/fiddle'

const tests = [
  {
    name: 'first test',
    description: 'cy.wrap() example',
    test: `
      cy.wrap('hello').should('have.length', 5)
    `
  },
  {
    name: 'second test',
    description: 'cy.wrap() + .then() example',
    test: `
        cy.wrap()
          .then(() => {
            cy.log('In .then')
          })
      `
  }
]
testExamples(tests)
```

![List of tests](images/list.png)

While working with tests, you can skip a test or make it exclusive. For example to skip the first test add a `skip: true` property.

```js
{
  name: 'first test',
  description: 'cy.wrap example',
  skip: true
  ...
}
```

Or run just a single test by using the `only: true` property.

```js
{
  name: 'first test',
  description: 'cy.wrap example',
  only: true
  ...
}
```

You can create suites by having nested objects. Each object becomes either a suite or a test.

```js
import { testExamples } from '@cypress/fiddle'
const suite = {
  'parent suite': {
    'inner suite': [
      {
        name: 'a test',
        html: `
          <div id="name">Joe</div>
        `,
        test: `
          cy.contains('#name', 'Joe')
        `
      }
    ],
    'list test': {
      html: `
        <ul>
          <li>Alice</li>
          <li>Bob</li>
          <li>Cory</li>
        </ul>
      `,
      test: `
        cy.get('li').should('have.length', 3)
          .first().should('contain', 'Alice')
      `
    }
  }
}

testExamples(suite)
```

![Tree of tests](images/tree.png)

Find more examples in [cypress/integration](cypress/integration) folder.



### Markdown

This package includes a JS/CoffeeScript/Markdown preprocessor that can find and run tests in `.md` files. Just surround the tests with HTML comments like this:

    <!-- fiddle Test name here -->
    Add additional text if you want. HTML code block is optional.

    ```html
    <div>Example</div>
    ```

    Test code block that should be run as a test
    ```js
    cy.contains('Bye').should('be.visible')
    ```
    <!-- fiddle-end -->

See example [bahmutov/vuepress-cypress-test-example](https://github.com/bahmutov/vuepress-cypress-test-example) and [live site](https://vuepress-cypress-test-example.netlify.com/). Read blog posts [Run End-to-end Tests from Markdown Files](https://glebbahmutov.com/blog/cypress-fiddle/) and [Self-testing JAM pages](https://www.cypress.io/blog/2019/11/13/self-testing-jam-pages/).

You can have common HTML block and split the test across multiple JavaScript code blocks. This is useful to explain the test step by step

    This test has multiple parts. First, it confirms the string value
    ```js
    cy.wrap('first').should('equal', 'first')
    ```
    Then it checks if 42 is 42
    ```js
    cy.wrap(42).should('equal', 42)
    ```

The actual test to be executed will be
```js
cy.wrap('first').should('equal', 'first')
cy.wrap(42).should('equal', 42)
```

### Skip and only

You can skip a fiddle, or run only a particular fiddle similar to `it.skip` and `it.only`

```
<!-- fiddle.skip this is a skipped test -->
<!-- fiddle.only this is an exclusive test -->
```

**Note:** there is also `fiddle.export` modifier. These fiddles are skipped during normal testing from Markdown, but exported and enabled in the output JavaScript specs.

### Page title

If the Markdown file has page title line like `# <some text>`, it will be used to create the top level suite of tests

```js
describe('<some text>', () => {
  // tests
})
```

### Nested suites

You can put a fiddle into nested suites using `/` as a separator

```
<!-- fiddle Top / nested / test -->
```

Will create

```js
describe('Top', () => {
  describe('nested', () => {
    it('test', () => {})
  })
})
```

### Live HTML

You can include "live" html blocks in the fiddle - in that case they will become the test fragment.

    <!-- fiddle includes live html -->
    <div id="live-block">Live Block</div>
    ```js
    cy.contains('#live-block', 'Live Block').should('be.visible')
    ```
    <!-- fiddle-end -->

When including HTML source fragment and live HTML block, live HTML block wins and will be used as the test fragment.

    <!-- fiddle includes both live and html block -->
    ```html
    <div id="my-block">Block</div>
    ```

    <div id="live-block">Live Block</div>

    ```js
    // when including both live HTML block and
    // html code block, the live HTML block wins
    cy.contains('#live-block', 'Live Block').should('be.visible')
    cy.contains('#my-block', 'Block').should('not.exist')
    ```
    <!-- fiddle-end -->

### Common Live HTML

If you have common HTML to load before the live HTML block, but do not want to show it in the HTML snippet, put it into a comment like this

    <!-- fiddle-markup
    <link rel="stylesheet" href="some CSS URL">
    <style>
    body {
      padding: 2rem;
    }
    </style>
    -->

You can load styles and external CDN scripts using this approach.

### Hiding fiddle in Markdown

You can "hide" fiddle inside Markdown so the page _can test itself_. See [cypress/integration/hidden-fiddle.md](cypress/integration/hidden-fiddle.md) example.

**Markdown**

![Hidden fiddle Markdown](images/hidden-fiddle.png)

**Rendered page**

![Hidden fiddle Markdown preview](images/hidden-fiddle-preview.png)

Notice how only the summary is displayed

**Test runner**

![Hidden fiddle test](images/hidden-fiddle-test.png)

**Note:** by default the summary element is displayed in the HTML. You can the fiddle completely using
```html
<details style="display:none">
 ...
</details>
```

#### Installation

In your plugins file use

```js
const mdPreprocessor = require('@cypress/fiddle/src/markdown-preprocessor')
module.exports = (on, config) => {
  on('file:preprocessor', mdPreprocessor)
}
```

And in `cypress.json` file allow Markdown files

```json
{
  "testFiles": "*.md"
}
```

Warning: [issue #5401](https://github.com/cypress-io/cypress/issues/5401)

## Exporting JS specs from Markdown fiddles

```shell
# saves path/to/md.js file
npx export-fiddle <path/to/md>
# adds optional "beforeEach" hook with cy.visit(url)
npx export-fiddle <path/to/md> --before-each <url>
# adds optional "before" hook with cy.visit(url)
npx export-fiddle <path/to/md> --before <url>
```

## Debug

To see debug logs, use `DEBUG=@cypress/fiddle` when running Cypress.

## Publishing

Automatic semantic release on CircleCI using [Cypress Circle Orb](https://github.com/cypress-io/circleci-orb), see [circle.yml](circle.yml) file.

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
