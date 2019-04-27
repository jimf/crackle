const CrackleType = require('./base')

class CrackleNullSafe extends CrackleType {
  constructor () {
    super(null, true)
    this.type = 'Null'
  }

  toString () {
    return ''
  }
}

module.exports = CrackleNullSafe
