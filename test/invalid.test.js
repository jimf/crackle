/* global describe, test, expect */
const Crackle = require('../')

describe('Invalid', () => {
  const runAll = (testcases) => {
    const env = new Crackle()
    testcases.forEach(testcase => {
      expect(env.parseAndRender.bind(env, ...testcase.input)).toThrow(testcase.expected)
    })
  }

  test('syntax', () => {
    runAll([
      '{{ ^ }}',
      '{{ "missing close quote }}',
      '{{ & }}',
      '{{ = }}'
    ].map(input => ({
      input: [input, {}],
      expected: 'Syntax error'
    })))
  })

  test('parse', () => {
    runAll([
      '{{ var1 var2 }}',
      '{{ var1',
      '{{ == }}',
      '{{ a > }}',
      '{% if cond %}',
      '{% invalidtag %}{% endinvalidtag %}'
    ].map(input => ({
      input: [input, {}],
      expected: 'Parse error'
    })))
  })
})
