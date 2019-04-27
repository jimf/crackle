const CrackleType = require('./base')

class CrackleString extends CrackleType {
  constructor (value, isEscaped) {
    super(value, isEscaped)
    this.type = 'String'
  }
}

module.exports = CrackleString
