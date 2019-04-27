const CrackleType = require('./base')

class CrackleBool extends CrackleType {
  constructor (value, isEscaped) {
    super(value, isEscaped)
    this.type = 'Bool'
  }

  toString () {
    return this.value ? '1' : ''
  }
}

module.exports = CrackleBool
