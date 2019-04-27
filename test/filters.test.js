/* global describe, test, expect */
const Crackle = require('../')

describe('Filters', () => {
  const runAll = (testcases) => {
    const env = new Crackle()
    testcases.forEach(testcase => {
      const actual = env.parseAndRender(...testcase.input)
      expect(actual).toBe(testcase.expected)
    })
  }

  describe('builtins', () => {
    test('capitalize', () => {
      runAll([
        {
          input: ['{{ var | capitalize }}', { var: 'my great text' }],
          expected: 'My great text'
        },
        {
          input: ['{{ "my great text" | capitalize }}', {}],
          expected: 'My great text'
        }
      ])
    })

    test('date', () => {
      runAll([
        {
          input: ['This page was last updated at {{ pubDate | date: "%b %d, %y" }}.', { pubDate: 'March 14, 2016' }],
          expected: 'This page was last updated at Mar 14, 16.'
        }
      ])
    })

    test('default', () => {
      runAll([
        {
          input: ['{{ "" | default: "Default text" }}', {}],
          expected: 'Default text'
        },
        {
          input: ['{{ "Text" | default: "Default text" }}', {}],
          expected: 'Text'
        },
        {
          input: ['{{ null | default: "Default text" }}', {}],
          expected: 'Default text'
        },
        {
          input: ['{{ [] | default: "Default text" }}', {}],
          expected: ''
        },
        {
          input: ['{{ undefinedVariable | default: "Default text" }}', {}],
          expected: 'Default text'
        },
        {
          input: ['{{ false | default: "Default text" }}', {}],
          expected: 'Default text'
        },
        {
          input: ['{{ var | default: "Default text" }}', { var: NaN }],
          expected: 'Default text'
        }
      ])
    })

    test('downcase', () => {
      runAll([
        {
          input: ['{{ var | downcase }}', { var: 'Text' }],
          expected: 'text'
        }
      ])
    })

    test('titlecase', () => {
      runAll([
        {
          input: ['{{ var | titlecase }}', { var: 'my great text' }],
          expected: 'My Great Text'
        },
        {
          input: ['{{ "james and the giant peach" | titlecase }}', {}],
          expected: 'James and the Giant Peach'
        }
      ])
    })

    test('upcase', () => {
      runAll([
        {
          input: ['{{ var | upcase }}', { var: 'text' }],
          expected: 'TEXT'
        }
      ])
    })
  })
})
