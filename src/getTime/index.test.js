/* eslint-env mocha */

import getTime from './index.js'

describe('getTime', () => {
  test('returns the timestamp of the given date', () => {
    const timestamp = 1483228800000
    const result = getTime(new Date(timestamp))
    expect(result ).toStrictEqual( timestamp)
  })

  test('accepts a timestamp (and returns it unchanged)', () => {
    const timestamp = 804643200000
    const result = getTime(timestamp)
    expect(result ).toStrictEqual( timestamp)
  })

  test('returns NaN if the given date is invalid', () => {
    const result = getTime(new Date(NaN))
    expect(result).toBeNaN()
  })
})
