const Scope = require('./scope')
const Type = require('./types')

function render (env, ast, ctx) {
  const rootScope = Scope(null)

  const jsToCrackle = value => {
    const valueType = typeof value
    if (valueType === 'string') {
      return new Type.String(value)
    } else if (valueType === 'number') {
      if (isNaN(value)) {
        return new Type.NaN(NaN)
      }
      const Ctor = value % 1 === 0 ? Type.Int : Type.Float
      return new Ctor(value)
    } else if (valueType === 'boolean') {
      return new Type.Bool(value)
    } else if (Array.isArray(value)) {
      return new Type.Array(value.map(jsToCrackle))
    } else if (typeof value === 'object') {
      if (value === null) {
        return new env.Null()
      }
      return new Type.Object(Object.keys(value).reduce((acc, key) => {
        acc[key] = jsToCrackle(value[key])
        return acc
      }, {}))
    } else if (valueType === 'function') {
      return new Type.Function(value)
    }
    throw new Error(`Crackle type not defined for JS value ${String(value)}`)
  }

  Object.keys(env.filters).forEach(key => {
    const value = env.filters[key]
    rootScope.define(key, jsToCrackle(value))
  })

  let currentScope = Scope(rootScope)
  Object.keys(ctx).forEach(key => {
    const value = ctx[key]
    currentScope.define(key, jsToCrackle(value))
  })

  const renderVisitor = {
    visitArrayLiteral (node) {
      return new Type.Array(node.values.map(expr => this.accept(expr)))
    },
    visitBlockStmt (node) {
      let result = ''
      node.statements.forEach(stmt => {
        result += env.escape(this.accept(stmt))
      })
      return result
    },
    visitCompareOp (node) {
      let left = this.accept(node.left)
      let right = this.accept(node.right)

      if (right.type === 'NaN' || right.type === 'NaN') {
        // NaN comparisons are false in all cases but !=.
        return new Type.Bool(node.operator === '!=')
      }
      if (!(left.type === 'String' && right.type === 'String')) {
        left = env.promote({ from: left, to: 'Float' })
        right = env.promote({ from: right, to: 'Float' })
      }

      left = left.valueOf()
      right = right.valueOf()

      switch (node.operator) {
        case '==': return new Type.Bool(left == right) /* eslint-disable-line */
        case '!=': return new Type.Bool(left != right) /* eslint-disable-line */
        case '>=': return new Type.Bool(left >= right)
        case '<=': return new Type.Bool(left <= right)
        case '>': return new Type.Bool(left > right)
        case '<': return new Type.Bool(left < right)

        default:
          throw new Error(`Unhandled comparison operator ${node.operator}`)
      }
    },
    visitBoolean (node) {
      return new Type.Bool(node.value, true)
    },
    visitCallExpr (node) {
      const filter = this.accept(node.callee).valueOf()
      if (typeof filter !== 'function') {
        // TODO: add option for silent failure
        throw new Error(`Call to undefined filter ${node.callee.value}`)
      }
      const args = node.arguments.map(arg => this.accept(arg).valueOf())
      return jsToCrackle(filter(...args))
    },
    visitContentStmt (node) {
      return new Type.String(node.value, true)
    },
    visitExprStmt (node) {
      return this.accept(node.expression)
    },
    visitFloat (node) {
      return new Type.Float(node.value, true)
    },
    visitForStmt (node) {
      const items = this.accept(node.right)
      // TODO: non-iterable handling?
      // TODO: degenerate loop handling
      let result = ''
      for (let item of env.loopLimit(items.valueOf())) {
        currentScope = Scope(currentScope)
        currentScope.define(node.left.id.value, item)
        result += this.accept(node.body)
        currentScope = currentScope.pop()
      }
      return result
    },
    visitIdentifier (node) {
      return currentScope.lookup(node.value) || new env.Null()
    },
    visitIfStmt (node) {
      const condition = this.accept(node.test)
      const block = condition.valueOf() ? node.body : node.alternate
      return block ? this.accept(block) : new env.Null()
    },
    visitInteger (node) {
      return new Type.Int(node.value, true)
    },
    visitLogicalOp (node) {
      const left = env.promote({ from: this.accept(node.left), to: 'Bool' }).valueOf()
      const right = env.promote({ from: this.accept(node.right), to: 'Bool' }).valueOf()

      switch (node.operator) {
        case '&&': return new Type.Bool(left && right)
        case '||': return new Type.Bool(left || right)

        default:
          throw new Error(`Unhandled logical operator ${node.operator}`)
      }
    },
    visitMemberExpr (node) {
      const obj = this.accept(node.object)
      if (obj.type === 'Null') {
        return obj
      }
      return obj.get(node.property.value, new env.Null())
    },
    visitNull (node) {
      return new env.Null()
    },
    visitProgram (node) {
      let result = ''
      node.statements.forEach(stmt => {
        result += env.escape(this.accept(stmt))
      })
      return result
    },
    visitString (node) {
      return new Type.String(node.value, true)
    },
    visitUnaryOp (node) {
      const callee = env.promote({ from: this.accept(node.callee), to: 'Bool' }).valueOf()

      switch (node.operator) {
        case '!': return new Type.Bool(!callee)

        default:
          throw new Error(`Unhandled logical operator ${node.operator}`)
      }
    },
    accept (node) {
      const method = `visit${node.type}`
      if (!this[method]) {
        console.warn(`Undefined visitor method for node type ${node.type}`)
      }
      return this[method] ? this[method](node) : new env.Null()
    }
  }

  return renderVisitor.accept(ast)
}

module.exports = render
