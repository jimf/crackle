const filters = require('./filters')
const iter = require('./iter')
const parse = require('./parser')
const render = require('./render')
const Type = require('./types')

const promoteNonStrict = ({ from, to: toType }) => {
  switch (toType) {
    case 'Bool':
      switch (from.type) {
        case 'Array': return new Type.Bool(from.valueOf().length > 0)
        case 'Bool': return from
        case 'Float': return new Type.Bool(!!from.valueOf())
        case 'Function': return new Type.Bool(true)
        case 'Int': return new Type.Bool(!!from.valueOf())
        case 'NaN': return new Type.Bool(false)
        case 'Null': return new Type.Bool(false)
        case 'Object': return new Type.Bool(Object.keys(from.valueOf()).length > 0)
        case 'String': return new Type.Bool(!!from.valueOf())
        default: throw new Error(`Unhandled Bool conversion from type ${from.type}`)
      }

    case 'Float':
      switch (from.type) {
        case 'Bool': return new Type.Float(from.valueOf() ? 1.0 : 0.0)
        case 'Float': return from
        case 'Int': return new Type.Float(Math.trunc(from.valueOf()))

        case 'String': {
          const parsed = parseFloat(from.valueOf())
          return new Type.Float(!isNaN(parsed) ? parsed : 0.0)
        }

        case 'Array':
        case 'Function':
        case 'NaN':
        case 'Null':
        case 'Object':
          return promoteNonStrict({ from: promoteNonStrict({ from, to: 'Bool' }), to: 'Float' })

        default: throw new Error(`Unhandled Float conversion from type ${from.type}`)
      }

    case 'Int':
      switch (from.type) {
        case 'Bool': return new Type.Int(from.valueOf() ? 1 : 0)
        case 'Float': return new Type.Int(Math.trunc(from.valueOf()))
        case 'Int': return from

        case 'String': {
          const parsed = parseInt(from.valueOf(), 10)
          return new Type.Int(!isNaN(parsed) ? parsed : 0)
        }

        case 'Array':
        case 'Function':
        case 'NaN':
        case 'Null':
        case 'Object':
          return promoteNonStrict({ from: promoteNonStrict({ from, to: 'Bool' }), to: 'Int' })

        default: throw new Error(`Unhandled Int conversion from type ${from.type}`)
      }

    case 'String':
      return from.type === 'String' ? from : new Type.String(from.toString(), from.isEscaped)

    default: throw new Error(`Unhandled promotion to type ${toType}`)
  }
}

class Crackle {
  constructor () {
    this.delimiterExprOpen = '{{'
    this.delimiterExprClose = '}}'
    this.delimiterStmtOpen = '{%'
    this.delimiterStmtClose = '%}'
    this.maxLoopIterations = 50
    this.globalMaxLoopIterations = 500
    this.Null = Type.NullSafe
    this.escape = x => x.toString()
    this.promote = promoteNonStrict
    this.filters = {}
    Object.keys(filters).forEach((key) => {
      this.registerFilter(key, filters[key])
    })
    this.loopLimit = iter.take(this.maxLoopIterations)
  }

  registerFilter (name, filter) {
    this.filters[name] = filter
  }

  parse (template) {
    return parse(this, template)
  }

  render (ast, ctx = {}) {
    return render(this, ast, ctx)
  }

  parseAndRender (template, ctx = {}) {
    return this.render(this.parse(template), ctx)
  }
}

module.exports = Crackle
