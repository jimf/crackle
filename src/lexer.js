const util = require('./util')

const RESERVED_WORDS = [
  'elif',
  'else',
  'endfor',
  'endif',
  'for',
  'if',
  'in'
].reduce((acc, word) => {
  acc[word] = true
  return acc
}, {})

function Token (type, raw, value, line, column, pos) {
  this.type = type
  this.raw = raw
  this.value = value
  this.line = line
  this.column = column
  this.pos = pos
}

/** Helpers */
const isDigit = c => c >= '0' && c <= '9'
const isHex = c => isDigit(c) || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f')
const isUpper = c => c >= 'A' && c <= 'Z'
const isLower = c => c >= 'a' && c <= 'z'
const isAlpha = c => isUpper(c) || isLower(c)
const isAlphaNumeric = c => isAlpha(c) || isDigit(c)

/** Scanner state */
const PARSE_CONTENT = 0
const PARSE_EXPR = 1
const PARSE_STMT = 2

/** FSM for detecting character sequences, i.e., "ab" */
class SeqFsm {
  constructor (pattern) {
    this.pattern = pattern
    this.state = -1
  }

  input (ch) {
    if (this.pattern.charAt(this.state + 1) === ch) {
      this.state += 1
    }
  }

  isAccepting () {
    return this.state === this.pattern.length - 1
  }

  isAdvanced () {
    return this.state > -1
  }
}

/** Number scan states */
const NUM_INTEGER = 0
const NUM_ZERO = 1
const NUM_WITH_DEC_BEGIN = 2
const NUM_WITH_DEC = 3
const NUM_BEGIN_WITH_EXP = 4
const NUM_BEGIN_WITH_SIGNED_EXP = 5
const NUM_WITH_EXP = 6
const NUM_BEGIN_HEX = 7
const NUM_HEX = 8
const NUM_DONE = 9

const nextNumberState = (state, c) => {
  switch (state) {
    case NUM_INTEGER:
      switch (true) {
        case isDigit(c): return NUM_INTEGER
        case c === '.': return NUM_WITH_DEC_BEGIN
        case c === 'e' || c === 'E': return NUM_BEGIN_WITH_EXP
        default: return NUM_DONE
      }

    case NUM_WITH_DEC_BEGIN:
      switch (true) {
        case isDigit(c): return NUM_WITH_DEC
        default: return NUM_DONE
      }

    case NUM_WITH_DEC:
      switch (true) {
        case isDigit(c): return NUM_WITH_DEC
        case c === 'e' || c === 'E': return NUM_BEGIN_WITH_EXP
        default: return NUM_DONE
      }

    case NUM_BEGIN_WITH_EXP:
      switch (true) {
        case isDigit(c): return NUM_WITH_EXP
        case c === '-' || c === '+': return NUM_BEGIN_WITH_SIGNED_EXP
        default: return NUM_DONE
      }

    case NUM_ZERO:
      switch (true) {
        case c === 'x' || c === 'X': return NUM_BEGIN_HEX
        case c === '.': return NUM_WITH_DEC_BEGIN
        case isDigit(c): return NUM_INTEGER
        default: return NUM_DONE
      }

    case NUM_BEGIN_HEX:
    case NUM_HEX:
      return isHex(c) ? NUM_HEX : NUM_DONE

    default: return NUM_DONE
  }
}

/** String scan states */
const STR_BEGIN = 0
const STR_BEGIN_ESC = 1
const STR_STRING = 2

const nextStringState = (delim, state, c, str) => {
  switch (state) {
    case STR_BEGIN:
      if (c === delim) return [STR_STRING, str]
      if (c === '\\') return [STR_BEGIN_ESC, str]
      return [STR_BEGIN, str + c]

    case STR_BEGIN_ESC:
      if (c === 'n') return [STR_BEGIN, str + '\n']
      if (c === 'r') return [STR_BEGIN, str + '\r']
      if (c === 't') return [STR_BEGIN, str + '\t']
      return [STR_BEGIN, str + c]

    default:
      throw new Error(`Unhandled string parse state ${state}`)
  }
}

function Lexer (env, input) {
  let current = 0
  let line = 1
  let col = 1
  let start = { pos: current, line, col }
  let peek = input.charAt(current)
  let state = PARSE_CONTENT
  const nextTokens = []

  function isAtEnd () {
    return current >= input.length
  }

  function carriageReturn () {
    line += 1
    col = 1
  }

  function read () {
    current += 1
    col += 1
    peek = input.charAt(current)
    return input.charAt(current - 1)
  }

  function scanError () {
    const token = createToken('Invalid')
    const errorContext = util.formatErrorContext(input, token.line, token.column, token.raw.length)
    // TODO: check env for whether to throw
    throw new Error(`Syntax error: Invalid or unexpected token "${token.raw}" at line ${token.line}, column ${token.column}

${errorContext}
`)
  }

  function match (expected) {
    if (isAtEnd()) {
      return false
    }

    if (expected.length === 1) {
      if (expected !== peek) {
        return false
      }
      read()
      return true
    }

    let pos = current
    const seq = new SeqFsm(expected)
    seq.input(input.charAt(pos))
    while (seq.isAdvanced() && !seq.isAccepting()) {
      pos += 1
      seq.input(input.charAt(pos))
    }
    if (!seq.isAccepting()) {
      return false
    }
    for (let i = 0; i < expected.length; i += 1) {
      read()
    }
    return true
  }

  function createToken (type, createValue) {
    const lexeme = input.substring(start.pos, current)
    const value = createValue ? createValue(lexeme) : null
    return new Token(type, lexeme, value, start.line, start.col, start.pos)
  }

  function skipWhitespace () {
    while (match(' ') || match('\t')) {
      /* do nothing */
    }
  }

  function scanIdentifier () {
    while (isAlphaNumeric(peek) || peek === '_') {
      read()
    }
    const token = createToken('Identifier')
    if (util.has(RESERVED_WORDS, token.raw)) {
      token.type = 'ReservedWord'
    } else if (token.raw === 'true') {
      token.type = 'Boolean'
      token.value = true
    } else if (token.raw === 'false') {
      token.type = 'Boolean'
      token.value = false
    } else if (token.raw === 'null' || token.raw === 'nil') {
      token.type = 'Null'
    }
    return token
  }

  function scanNumber (first) {
    let prevState = null
    let state = first === '.' ? NUM_WITH_DEC : NUM_INTEGER
    if (first === '0') { state = NUM_ZERO }
    while (true) {
      prevState = state
      state = nextNumberState(state, peek)
      if (state === NUM_DONE) {
        break
      }
      read()
    }
    if (prevState === NUM_INTEGER || prevState === NUM_ZERO) {
      return createToken('Integer', t => parseInt(t, 10))
    } else if (prevState === NUM_WITH_DEC || prevState === NUM_WITH_EXP) {
      return createToken('Float', parseFloat)
    } else if (prevState === NUM_HEX) {
      return createToken('Integer', t => parseInt(t, 16))
    } else if (prevState === NUM_WITH_DEC_BEGIN) {
      current -= 1
      col -= 1
      peek = input.charAt(current)
      return createToken('Integer', t => parseInt(t, 10))
    }
    scanError()
  }

  function scanString (delim) {
    let state = STR_BEGIN
    let value = ''
    while (!isAtEnd() && state !== STR_STRING) {
      const ch = read()
      if (ch === '\n') { carriageReturn() }
      const next = nextStringState(delim, state, ch, value)
      state = next[0]
      value = next[1]
    }
    if (state === STR_STRING) {
      return createToken('String', () => value)
    }
    scanError()
  }

  function scanContent () {
    const expr = new SeqFsm(env.delimiterExprOpen)
    const stmt = new SeqFsm(env.delimiterStmtOpen)
    while (!isAtEnd()) {
      const ch = read()
      if (ch === '\n') { carriageReturn() }
      expr.input(ch)
      stmt.input(ch)
      if (expr.isAccepting()) {
        const delimLen = env.delimiterExprOpen.length
        state = PARSE_EXPR
        const openToken = new Token(
          'ExprOpen',
          env.delimiterExprOpen,
          null,
          line,
          col - delimLen,
          current - delimLen
        )
        const contentToken = new Token(
          'Content',
          input.substring(start.pos, current - delimLen),
          null,
          start.line,
          start.col,
          start.pos
        )
        if (contentToken.raw.length > 0) {
          nextTokens.push(openToken)
          return contentToken
        }
        return openToken
      } else if (stmt.isAccepting()) {
        const delimLen = env.delimiterStmtOpen.length
        state = PARSE_STMT
        const openToken = new Token(
          'StmtOpen',
          env.delimiterStmtOpen,
          null,
          line,
          col - delimLen,
          current - delimLen
        )
        const contentToken = new Token(
          'Content',
          input.substring(start.pos, current - delimLen),
          null,
          start.line,
          start.col,
          start.pos
        )
        if (contentToken.raw.length > 0) {
          nextTokens.push(openToken)
          return contentToken
        }
        return openToken
      }
    }
    return createToken('Content')
  }

  function next () {
    if (nextTokens.length) { return nextTokens.shift() }
    if (isAtEnd()) { return null }
    switch (state) {
      case PARSE_CONTENT:
        start = { pos: current, line, col }
        return scanContent()

      case PARSE_EXPR:
      case PARSE_STMT: {
        skipWhitespace()
        start = { pos: current, line, col }
        if (state === PARSE_EXPR && match(env.delimiterExprClose)) {
          const token = createToken('ExprClose')
          state = PARSE_CONTENT
          return token
        } else if (state === PARSE_STMT && match(env.delimiterStmtClose)) {
          const token = createToken('StmtClose')
          state = PARSE_CONTENT
          return token
        }
        const ch = read()
        switch (ch) {
          case '\n':
            carriageReturn()
            return next()

          case '"': return scanString(ch)
          case "'": return scanString(ch)
          case '_': return scanIdentifier()
          case '[': return createToken('LBracket')
          case ']': return createToken('RBracket')
          case ',': return createToken('Comma')
          case '.': return isDigit(peek) ? scanNumber(ch) : createToken('Dot')
          case '&': return match('&') ? createToken('AmpAmp') : scanError()
          case '|': return match('|') ? createToken('PipePipe') : createToken('Pipe')
          case '!': return createToken(match('=') ? 'BangEq' : 'Bang')
          case '(': return createToken('LParen')
          case ')': return createToken('RParen')
          case ':': return createToken('Colon')
          case '=': return match('=') ? createToken('EqEq') : scanError()
          case '>': return createToken(match('=') ? 'GreaterEq' : 'Greater')
          case '<': return createToken(match('=') ? 'LessEq' : 'Less')

          default:
            if (isAlpha(ch)) {
              return scanIdentifier()
            } else if (isDigit(ch)) {
              return scanNumber(ch)
            }
            scanError()
        }
        break
      }

      default:
        throw new Error('Unhandled parse state', state)
    }
  }

  return {
    isAtEnd,
    next
  }
}

module.exports = Lexer
