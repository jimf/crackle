const CrackleType = require('./base')

class CrackleInt extends CrackleType {
  constructor (value, isEscaped) {
    super(value, isEscaped)
    this.type = 'Int'
  }
}

module.exports = CrackleInt
