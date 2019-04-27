const CrackleType = require('./base')

class CrackleFunction extends CrackleType {
  constructor (value, isEscaped) {
    super(value, isEscaped)
    this.type = 'Function'
  }

  toString () {
    return ''
  }
}

module.exports = CrackleFunction
