const Lexer = require('./lexer')
const util = require('./util')

function tokenize (lexer) {
  const tokens = []
  let token = lexer.next()
  while (token) {
    tokens.push(token)
    token = lexer.next()
  }
  return tokens
}

function parse (env, input) {
  const lexer = Lexer(env, input)
  const tokens = tokenize(lexer)
  let pos = 0

  function expect (success, expected, found) {
    if (success) { return }
    const token = tokens[pos]
    if (!token) {
      throw new Error(`Parse error: Expected ${expected}, but reached end of input`)
    }
    const errorContext = util.formatErrorContext(input, token.line, token.column, token.raw.length)
    throw new Error(`Parse error at line ${token.line}, column ${token.column}
Expected ${expected}, but found ${found || '"' + token.raw + '"'}

${errorContext}`)
  }

  function peek () {
    return tokens[pos]
  }

  function isAtEnd () {
    return pos === tokens.length
  }

  function previous () {
    return tokens[pos - 1]
  }

  function advance () {
    if (!isAtEnd()) {
      pos += 1
    }
    return previous()
  }

  function check (type, lexeme) {
    const token = peek()
    return !!token && token.type === type && (lexeme === undefined || token.raw === lexeme)
  }

  function match (type, lexeme) {
    if (!check(type, lexeme)) { return false }
    advance()
    return true
  }

  function primary () {
    if (match('Integer') || match('Float') || match('Boolean') || match('Null') || match('String')) {
      const token = previous()
      return {
        type: token.type,
        value: token.value
      }
    } else if (match('Identifier')) {
      return {
        type: 'Identifier',
        value: previous().raw
      }
    } else if (match('LParen')) {
      const expr = expression()
      expect(match('RParen'), 'a closing ")"')
      return expr
    } else if (match('LBracket')) {
      const values = []
      do {
        if (check('RBracket')) { break }
        values.push(expression())
      } while (match('Comma'))
      expect(match('RBracket'), 'a closing "]"')
      return {
        type: 'ArrayLiteral',
        values
      }
    }
    expect(false, 'an expression')
  }

  function access () {
    let expr = primary()
    while (match('Dot')) {
      const property = primary()
      expr = {
        type: 'MemberExpr',
        object: expr,
        property
      }
    }
    return expr
  }

  function unary () {
    if (match('Bang')) {
      const callee = unary()
      return {
        type: 'UnaryOp',
        operator: '!',
        callee
      }
    }
    return access()
  }

  function comparison () {
    let expr = unary()
    while (
      match('EqEq') ||
      match('BangEq') ||
      match('Less') ||
      match('LessEq') ||
      match('Greater') ||
      match('GreaterEq')
    ) {
      const op = previous()
      const right = unary()
      expr = {
        type: 'CompareOp',
        operator: op.raw,
        left: expr,
        right
      }
    }
    return expr
  }

  function conjunction () {
    let expr = comparison()
    while (match('AmpAmp')) {
      const right = comparison()
      expr = {
        type: 'LogicalOp',
        operator: '&&',
        left: expr,
        right
      }
    }
    return expr
  }

  function disjunction () {
    let expr = conjunction()
    while (match('PipePipe')) {
      const right = conjunction()
      expr = {
        type: 'LogicalOp',
        operator: '||',
        left: expr,
        right
      }
    }
    return expr
  }

  function application () {
    let expr = disjunction()
    while (match('Pipe')) {
      const callee = disjunction()
      const args = [expr]
      if (match('Colon')) {
        do {
          args.push(expression())
        } while (match('Comma'))
      }
      expr = {
        type: 'CallExpr',
        callee,
        arguments: args
      }
    }
    return expr
  }

  function expression () {
    return application()
  }

  function statement () {
    if (match('Content')) {
      const content = previous()
      return {
        type: 'ContentStmt',
        value: content.raw
      }
    } else if (match('ExprOpen')) {
      const expr = expression()
      expect(expr, 'an expression')
      expect(match('ExprClose'), 'closing expression delimiter')
      return {
        type: 'ExprStmt',
        expression: expr
      }
    } else if (match('StmtOpen')) {
      if (check('ReservedWord', 'if')) {
        return ifStmt('if')
      } else if (match('ReservedWord', 'for')) {
        expect(match('Identifier'), 'an identifier')
        const id = previous()
        const left = {
          type: 'VarDecl',
          id: {
            type: 'Identifier',
            value: id.raw
          }
        }
        expect(match('ReservedWord', 'in'), 'keyword "in"')
        const right = expression()
        expect(match('StmtClose'), 'closing statement delimiter')
        const body = block(() => check('ReservedWord', 'endfor'))
        expect(match('ReservedWord', 'endfor'), '"endfor"')
        expect(match('StmtClose'), 'closing statement delimiter')
        return {
          type: 'ForStmt',
          left,
          right,
          body
        }
      }
    }
    expect(false, 'content, an expression, or a statement block')
  }

  function ifStmt (expected) {
    // Pre-condition: opening delimiter already consumed
    expect(match('ReservedWord', expected), `"${expected}"`)
    const test = expression()
    expect(match('StmtClose'), 'closing statement delimiter')
    const body = block(() => check('ReservedWord', 'elif') || check('ReservedWord', 'else') || check('ReservedWord', 'endif'))
    if (match('ReservedWord', 'else')) {
      expect(match('StmtClose'), 'closing statement delimiter')
      const alternate = block(() => check('ReservedWord', 'endif'))
      expect(match('ReservedWord', 'endif') && match('StmtClose'), 'closing statement delimiter')
      return {
        type: 'IfStmt',
        test,
        body,
        alternate
      }
    } else if (match('ReservedWord', 'endif')) {
      expect(match('StmtClose'), 'closing statement delimiter')
      return {
        type: 'IfStmt',
        test,
        body,
        alternate: null
      }
    }
    return {
      type: 'IfStmt',
      test,
      body,
      alternate: ifStmt('elif')
    }
  }

  function block (shouldStop) {
    const node = {
      type: 'BlockStmt',
      statements: []
    }
    while (!isAtEnd()) {
      if (match('StmtOpen')) {
        if (shouldStop()) {
          break
        } else {
          pos -= 1
        }
      }
      node.statements.push(statement())
    }
    return node.statements.length > 0 ? node : null
  }

  function statements () {
    if (isAtEnd()) {
      return []
    }
    const result = []
    while (!isAtEnd()) {
      result.push(statement())
    }
    return result
  }

  function program () {
    return {
      type: 'Program',
      statements: statements()
    }
  }

  const ast = program()
  expect(isAtEnd(), 'end of template')
  return ast
}

module.exports = parse
