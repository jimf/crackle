/* global describe, test, expect */
const Crackle = require('../')

describe('Control Structures', () => {
  const runAll = (testcases) => {
    const env = new Crackle()
    testcases.forEach(testcase => {
      const actual = env.parseAndRender(...testcase.input)
      expect(actual).toBe(testcase.expected)
    })
  }

  test('if', () => {
    runAll([
      {
        input: ['{% if var %}true body{% endif %}', { var: false }],
        expected: ''
      },
      {
        input: ['{% if var %}true body{% endif %}', { var: true }],
        expected: 'true body'
      },
      {
        input: ['{% if var %}{{var}}{% endif %}', { var: 'value' }],
        expected: 'value'
      },
      {
        input: ['{% if var %}true body{% else %}alt body{% endif %}', { var: false }],
        expected: 'alt body'
      },
      {
        input: ['{% if var %}{% else %}alt body{% endif %}', { var: false }],
        expected: 'alt body'
      },
      {
        input: ['{% if var %}true body{% else %}alt body{% endif %}', { var: true }],
        expected: 'true body'
      },
      {
        input: ['{% if a %}body A{% elif b %}body B{% else %}body C{% endif %}', { b: true }],
        expected: 'body B'
      },
      {
        input: ['{% if a %}{% if b %}body A AND B{% endif %}{% else %}body C{% endif %}', { a: true, b: true }],
        expected: 'body A AND B'
      },
      {
        input: ['{% if a %}{% if b %}body A AND B{% endif %}{% else %}body C{% endif %}', { a: false, b: true }],
        expected: 'body C'
      },
      {
        input: ['{% if a %}{% if b %}body A AND B{% endif %}{% else %}body C{% endif %}', { a: false, b: false }],
        expected: 'body C'
      }
    ])
  })

  test('for', () => {
    runAll([
      {
        input: ['{% for item in items %}{{item}}{% endfor %}', { items: ['h', 'e', 'l', 'l', 'o'] }],
        expected: 'hello'
      },
      {
        input: ['{% for item in items %}{{item}}{% endfor %}', { items: ['h', 'i'], item: 'unexpected' }],
        expected: 'hi'
      },
      {
        input: ['{% for c in str %}{{c}}{% endfor %}', { str: 'hello' }],
        expected: 'hello'
      },
      {
        input: [
          '{% for color in colors %}{% for fruit in color.fruits %}{{fruit}}{% endfor %}{% endfor %}',
          {
            colors: [
              { color: 'red', fruits: ['apple', 'cherry'] },
              { color: 'green', fruits: ['grape', 'pear'] }
            ]
          }
        ],
        expected: 'applecherrygrapepear'
      },
    ])
  })
})
