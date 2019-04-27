/* global describe, test, expect */
const Crackle = require('../')

describe('Comparisons', () => {
  const TRUE = '1'
  const FALSE = ''
  const runAll = (testcases) => {
    const env = new Crackle()
    testcases.forEach(testcase => {
      const actual = env.parseAndRender(...testcase.input)
      expect(actual).toBe(testcase.expected)
    })
  }

  test('==', () => {
    runAll([
      {
        input: ['{{ 1 == 1 }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ 1.0 == 1 }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ 1 == 0 }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ "foo" == "foo" }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ "foo" == "bar" }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ var == var }}', { var: NaN }],
        expected: FALSE
      }
    ])
  })

  test('!=', () => {
    runAll([
      {
        input: ['{{ 1 != 1 }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ 1.0 != 1 }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ 1 != 0 }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ "foo" != "foo" }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ "foo" != "bar" }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ var != var }}', { var: NaN }],
        expected: TRUE
      }
    ])
  })

  test('>', () => {
    runAll([
      {
        input: ['{{ 1 > 1 }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ 2 > 1 }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ "apple" > "banana" }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ var > var }}', { var: NaN }],
        expected: FALSE
      }
    ])
  })

  test('<', () => {
    runAll([
      {
        input: ['{{ 1 < 1 }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ 2 < 1 }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ "apple" < "banana" }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ var < var }}', { var: NaN }],
        expected: FALSE
      }
    ])
  })

  test('>=', () => {
    runAll([
      {
        input: ['{{ 1 >= 1 }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ 2 >= 1 }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ "apple" >= "banana" }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ var >= var }}', { var: NaN }],
        expected: FALSE
      }
    ])
  })

  test('<=', () => {
    runAll([
      {
        input: ['{{ 1 <= 1 }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ 2 <= 1 }}', {}],
        expected: FALSE
      },
      {
        input: ['{{ "apple" <= "banana" }}', {}],
        expected: TRUE
      },
      {
        input: ['{{ var <= var }}', { var: NaN }],
        expected: FALSE
      }
    ])
  })
})
