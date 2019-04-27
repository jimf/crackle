const CrackleType = require('./base')

class CrackleFloat extends CrackleType {
  constructor (value, isEscaped) {
    super(value, isEscaped)
    this.type = 'Float'
  }

  toString () {
    let result = this.value.toString()
    if (!result.includes('.')) {
      result += '.0'
    }
    return result
  }
}

module.exports = CrackleFloat
