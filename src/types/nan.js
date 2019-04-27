const CrackleType = require('./base')

class CrackleNaN extends CrackleType {
  constructor () {
    super(NaN, true)
    this.type = 'NaN'
  }

  toString () {
    return ''
  }
}

module.exports = CrackleNaN
