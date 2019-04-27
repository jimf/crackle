const CrackleType = require('./base')

class CrackleArray extends CrackleType {
  constructor (value, isEscaped) {
    super(value, isEscaped)
    this.type = 'Array'
  }

  toString () {
    return ''
  }
}

module.exports = CrackleArray
