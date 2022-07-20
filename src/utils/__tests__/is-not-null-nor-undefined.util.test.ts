import { isNotNullNorUndefinedUtil } from '../is-not-null-nor-undefined.util'

describe('is-not-null-nor-undefined.util.ts', () => {

  it('returns true for defined string value', () => {
    const testValue = 'some-string'

    const result = isNotNullNorUndefinedUtil(testValue)

    expect(result).toBe(true)
  })

  it('returns true for defined number value', () => {
    const testValue = 123

    const result = isNotNullNorUndefinedUtil(testValue)

    expect(result).toBe(true)
  })

  it('returns true for record', () => {
    const testValue = {
      key: 'value',
    }

    const result = isNotNullNorUndefinedUtil(testValue)

    expect(result).toBe(true)
  })

  it('returns false for undefined value', () => {
    const testValue = undefined

    const result = isNotNullNorUndefinedUtil(testValue)

    expect(result).toBe(false)
  })

  it('returns false for null value', () => {
    const testValue = null

    const result = isNotNullNorUndefinedUtil(testValue)

    expect(result).toBe(false)
  })
})
