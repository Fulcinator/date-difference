/* eslint-env mocha */

import toDate from './index.js'

describe('toDate', () => {
  describe('date argument', () => {
    test('returns a clone of the given date', () => {
      const date = new Date(2016, 0, 1)
      const dateClone = toDate(date)
      dateClone.setFullYear(2015)
      expect(date).toStrictEqual( new Date(2016, 0, 1))
    })
  })

  describe('timestamp argument', () => {
    test('creates a date from the timestamp', () => {
      const timestamp = new Date(2016, 0, 1, 23, 30, 45, 123).getTime()
      const result = toDate(timestamp)
      expect(result).toStrictEqual( new Date(2016, 0, 1, 23, 30, 45, 123))
    })
  })

  describe('invalid argument', () => {
    test('returns Invalid Date if argument is NaN', () => {
      const result = toDate(NaN)
      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBeNaN()

    })

    test('returns Invalid Date if argument is Invalid Date', () => {
      const result = toDate(new Date(NaN))
      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBeNaN()
    })
  })
})
