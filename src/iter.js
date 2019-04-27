exports.range = (start, end, step = 1) => ({
  [Symbol.iterator]() {
    let value = start
    return {
      next() {
        const done = value > end
        const result = {
          done,
          value: done ? undefined : value
        }
        value += step
        return result
      }
    }
  }
})

exports.take = n => iterable => ({
  [Symbol.iterator]() {
    const iterator = iterable[Symbol.iterator]()
    let taken = 0
    return {
      next() {
        let { done, value } = iterator.next()
        taken += 1
        done = done || taken > n
        return {
          done,
          value: done ? undefined : value
        }
      }
    }
  }
})
