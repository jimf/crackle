/* global describe, test, expect */
const Crackle = require('../')

describe('Literals', () => {
  const runAll = (testcases) => {
    const env = new Crackle()
    testcases.forEach(testcase => {
      const actual = env.parseAndRender(...testcase.input)
      expect(actual).toBe(testcase.expected)
    })
  }

  test('array', () => {
    runAll([
      {
        input: ['{{ [1, 2] }}', {}],
        expected: ''
      }
    ])
  })

  test('bool', () => {
    runAll([
      {
        input: ['{{ true }}', {}],
        expected: '1'
      },
      {
        input: ['{{ false }}', {}],
        expected: ''
      }
    ])
  })

  test('float', () => {
    runAll([
      {
        input: ['{{ 0.0 }}', {}],
        expected: '0.0'
      },
      {
        input: ['{{ 3.14 }}', {}],
        expected: '3.14'
      },
      {
        input: ['{{ .5 }}', {}],
        expected: '0.5'
      }
    ])
  })

  test('int', () => {
    runAll([
      {
        input: ['{{ 0 }}', {}],
        expected: '0'
      },
      {
        input: ['{{ 42 }}', {}],
        expected: '42'
      }
    ])
  })

  test('null (safe)', () => {
    runAll([
      {
        input: ['{{ null }}', {}],
        expected: ''
      },
      {
        input: ['{{ nil }}', {}],
        expected: ''
      }
    ])
  })

  test('string', () => {
    runAll([
      {
        input: [`Hello, {{ 'Jim' }}!`, {}],
        expected: 'Hello, Jim!'
      },
      {
        input: [`Hello, {{"Jim"}}!`, {}],
        expected: 'Hello, Jim!'
      },
      {
        input: [String.raw`{{ "\"" }}`],
        expected: '"'
      },
      {
        input: [String.raw`{{ '\'' }}`],
        expected: "'"
      },
      {
        input: [String.raw`{{ "\\" }}`],
        expected: '\\'
      },
      {
        input: [String.raw`{{ "\n" }}`],
        expected: '\n'
      },
      {
        input: [String.raw`{{ '\r' }}`],
        expected: '\r'
      },
      {
        input: [String.raw`{{ "\t" }}`],
        expected: '\t'
      }
    ])
  })
})
