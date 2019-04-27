class CrackleType {
  constructor (value = null, isEscaped = false) {
    this.isCrackleType = true
    this.value = value
    this.isEscaped = isEscaped
  }

  toString () {
    return this.value.toString()
  }

  valueOf () {
    return this.value
  }
}

module.exports = CrackleType
