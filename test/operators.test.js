/* global describe, test, expect */
const Crackle = require('../')

describe('Operators', () => {
  const TRUE = '1'
  const FALSE = ''
  const runAll = (testcases) => {
    const env = new Crackle()
    testcases.forEach(testcase => {
      const actual = env.parseAndRender(...testcase.input)
      expect(actual).toBe(testcase.expected)
    })
  }

  describe('logical', () => {
    test('AND', () => {
      runAll([
        {
          input: ['{{ true && true }}', {}],
          expected: TRUE
        },
        {
          input: ['{{ true && false }}', {}],
          expected: FALSE
        },
        {
          input: ['{{ false && true }}', {}],
          expected: FALSE
        },
        {
          input: ['{{ false && false }}', {}],
          expected: FALSE
        }
      ])
    })

    test('OR', () => {
      runAll([
        {
          input: ['{{ true || true }}', {}],
          expected: TRUE
        },
        {
          input: ['{{ true || false }}', {}],
          expected: TRUE
        },
        {
          input: ['{{ false || true }}', {}],
          expected: TRUE
        },
        {
          input: ['{{ false || false }}', {}],
          expected: FALSE
        }
      ])
    })

    test('NOT', () => {
      runAll([
        {
          input: ['{{ !true }}', {}],
          expected: FALSE
        },
        {
          input: ['{{ !false }}', {}],
          expected: TRUE
        },
        {
          input: ['{{ !!true }}', {}],
          expected: TRUE
        },
        {
          input: ['{{ !!false }}', {}],
          expected: FALSE
        }
      ])
    })

    test('coercions', () => {
      runAll([
        {
          input: ['{{ !![1] }}', {}],
          expected: TRUE
        },
        {
          input: ['{{ !![] }}', {}],
          expected: FALSE
        },
        {
          input: ['{{ !!1.5 }}', {}],
          expected: TRUE
        },
        {
          input: ['{{ !!0.0 }}', {}],
          expected: FALSE
        },
        {
          input: ['{{ !!1 }}', {}],
          expected: TRUE
        },
        {
          input: ['{{ !!0 }}', {}],
          expected: FALSE
        },
        {
          input: ['{{ !!null }}', {}],
          expected: FALSE
        },
        {
          input: ['{{ !!"non-empty" }}', {}],
          expected: TRUE
        },
        {
          input: ['{{ !!"" }}', {}],
          expected: FALSE
        }
      ])
    })

    test('precedence', () => {
      const testcases = [
        {
          input: '{{ A || B && C }}',
          expected: '{{ A || (B && C) }}'
        },
        {
          input: '{{ A && B || C && D }}',
          expected: '{{ (A && B) || (C && D) }}'
        },
        {
          input: '{{ A && B && C || D }}',
          expected: '{{ ((A && B) && C) || D }}'
        },
        {
          input: '{{ !A && B || C }}',
          expected: '{{ ((!A) && B) || C }}'
        }
      ]
      const env = new Crackle()
      ;[true, false].forEach(A => {
        ;[true, false].forEach(B => {
          ;[true, false].forEach(C => {
            ;[true, false].forEach(D => {
              const ctx = { A, B, C, D }
              testcases.forEach(testcase => {
                const actual = env.parseAndRender(testcase.input, ctx)
                const expected = env.parseAndRender(testcase.expected, ctx)
                expect(actual).toBe(expected)
              })
            })
          })
        })
      })
    })
  })
})
