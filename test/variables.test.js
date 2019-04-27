/* global describe, test, expect */
const Crackle = require('../')

describe('Variables', () => {
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
        input: ['{{ var }}', { var: [1, 2, 3] }],
        expected: ''
      },
      {
        input: ['{{ var }}', { var: ['a', 'b', 'c'] }],
        expected: ''
      },
      {
        input: ['{{ var }}', { var: [true, false] }],
        expected: ''
      }
    ])
  })

  test('bool', () => {
    runAll([
      {
        input: ['{{ var }}', { var: true }],
        expected: '1'
      },
      {
        input: ['{{ var }}', { var: false }],
        expected: ''
      }
    ])
  })

  test('float', () => {
    runAll([
      {
        input: ['{{ var }}', { var: 3.14 }],
        expected: '3.14'
      }
    ])
  })

  test('int', () => {
    runAll([
      {
        input: ['{{ var }}', { var: 0 }],
        expected: '0'
      },
      {
        input: ['{{ var }}', { var: 42 }],
        expected: '42'
      },
      {
        input: ['{{ _azAz1_ }}', { _azAz1_: 1 }],
        expected: '1'
      }
    ])
  })

  test('nan', () => {
    runAll([
      {
        input: ['{{ var }}', { var: NaN }],
        expected: ''
      }
    ])
  })

  test('null (safe)', () => {
    runAll([
      {
        input: ['Hello, {{ name }}!', {}],
        expected: 'Hello, !'
      }
    ])
  })

  test('object', () => {
    runAll([
      {
        input: ['{{ banana.color }}', { banana: { color: 'yellow' } }],
        expected: 'yellow'
      },
      {
        input: ['{{ foo.bar.baz }}', { foo: { bar: { baz: 'baz value' } } }],
        expected: 'baz value'
      },
      {
        input: ['{{ foo.missing }}', { foo: {} }],
        expected: ''
      }
    ])
  })

  test('string', () => {
    runAll([
      {
        input: ['Hello, {{ name }}!', { name: 'Jim' }],
        expected: 'Hello, Jim!'
      },
      {
        input: ['Hello, {{name}}!', { name: 'Jim' }],
        expected: 'Hello, Jim!'
      }
    ])
  })
})
