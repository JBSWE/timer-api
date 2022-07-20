import type { ProcessEnv } from '../config'
import { getBoolean, getNumber, getString, has } from '../config'

describe('config.ts', () => {

  describe('getString', () => {
    it('returns string', () => {
      const result = getString('STRING_VALUE' as ProcessEnv)

      expect(result).toBe('test')
    })

    it('returns boolean as string', () => {
      const result = getString('BOOLEAN_FALSE_VALUE' as ProcessEnv)

      expect(result).toBe('false')
    })

    it('returns number as string', () => {
      const result = getString('NUMBER_VALUE' as ProcessEnv)

      expect(result).toBe('123')
    })

    it('throws if value is not defined', () => {
      expect(() => getString('NO_SUCH_ENV_VARIABLE_DEFINED' as ProcessEnv)).toThrow('Environment variable \'NO_SUCH_ENV_VARIABLE_DEFINED\' is not defined')
    })
  })

  describe('getNumber', () => {
    it('returns number', () => {
      const result = getNumber('NUMBER_VALUE' as ProcessEnv)

      expect(result).toBe(123)
    })

    it('throws as expected number, but got string', () => {
      expect(() => getNumber('STRING_VALUE' as ProcessEnv)).toThrow('Invalid environment variable type. Expected number, got value: \'test\'')
    })

    it('throws as expected number, but got boolean', () => {
      expect(() => getNumber('BOOLEAN_FALSE_VALUE' as ProcessEnv)).toThrow('Invalid environment variable type. Expected number, got value: \'false\'')
    })

    it('throws if value is not defined', () => {
      expect(() => getNumber('NO_SUCH_ENV_VARIABLE_DEFINED' as ProcessEnv)).toThrow('Environment variable \'NO_SUCH_ENV_VARIABLE_DEFINED\' is not defined')
    })
  })

  describe('getBoolean', () => {
    it('returns true', () => {
      const result = getBoolean('BOOLEAN_TRUE_VALUE' as ProcessEnv)

      expect(result).toBe(true)
    })

    it('returns false', () => {
      const result = getBoolean('BOOLEAN_FALSE_VALUE' as ProcessEnv)

      expect(result).toBe(false)
    })

    it('throws as expected boolean, but got number', () => {
      expect(() => getBoolean('NUMBER_VALUE' as ProcessEnv)).toThrow(
        'Invalid environment variable type. Expected boolean, got value: \'123\'',
      )
    })

    it('throws as expected boolean, but got string', () => {
      expect(() => getBoolean('STRING_VALUE' as ProcessEnv)).toThrow(
        'Invalid environment variable type. Expected boolean, got value: \'test\'',
      )
    })

    it('throws if value is not defined', () => {
      expect(() => getBoolean('NO_SUCH_ENV_VARIABLE_DEFINED' as ProcessEnv)).toThrow(
        'Environment variable \'NO_SUCH_ENV_VARIABLE_DEFINED\' is not defined',
      )
    })
  })

  describe('has', () => {
    it('returns true if an env variable is set', () => {
      const result = has('STRING_VALUE' as ProcessEnv)

      expect(result).toBe(true)
    })

    it('returns false if an env variable is not set', () => {
      const result = has('NO_SUCH_ENV_VARIABLE_DEFINED)' as ProcessEnv)

      expect(result).toBe(false)
    })
  })
})
