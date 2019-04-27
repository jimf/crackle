const strftime = require('strftime')
const toTitleCase = require('titlecase')

exports.capitalize = s => s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)
exports.date = (x, arg) => {
  let date = x
  if (date === 'now') {
    date = new Date()
  } else if (typeof date === 'string') {
    date = new Date(date)
  }
  return date instanceof Date && !isNaN(date.getTime()) ? strftime(arg, date) : x
}
exports.default = (x, fallback) => x === '' || x === null || x === false || Number.isNaN(x) ? fallback : x
exports.downcase = s => s.toLowerCase()
exports.titlecase = s => toTitleCase(s)
exports.upcase = s => s.toUpperCase()
