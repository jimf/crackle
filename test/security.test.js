/* global describe, test, expect */
const Crackle = require('../')

describe('Security', () => {
  const runAll = (testcases) => {
    const env = new Crackle()
    testcases.forEach(testcase => {
      const actual = env.parseAndRender(...testcase.input)
      expect(actual).toBe(testcase.expected)
    })
  }

  test('for', () => {
    runAll([
      {
        input: ['{% for item in items %}{{item}}{% endfor %}', { items: new Array(1000).fill('x') }],
        expected: new Array(50).fill('x').join('')
      }
    ])
  })
})
