const CrackleType = require('./base')

class CrackleObject extends CrackleType {
  constructor (value, isEscaped) {
    super(value, isEscaped)
    this.type = 'Object'
  }

  get (property, defaultValue) {
    if (Object.prototype.hasOwnProperty.call(this.value, property)) {
      return this.value[property]
    }
    return defaultValue
  }

  toString () {
    return ''
  }
}

module.exports = CrackleObject
