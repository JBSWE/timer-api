import * as dotEnvFlow from 'dotenv-flow'

import { isNotNullNorUndefinedUtil } from './utils/is-not-null-nor-undefined.util'

dotEnvFlow.config({
  // eslint-disable-next-line camelcase
  purge_dotenv: true,
  path: './config',
  silent: true,
})

export enum ProcessEnv {
  logLevel = 'LOG_LEVEL'
}

function parseNumber(value: string): number {
  const parsedValue = parseInt(value)
  if (isNaN(parsedValue)) {
    throw new Error(`Invalid environment variable type. Expected number, got value: '${value}'`)
  }
  return parsedValue
}

function parseBoolean(value: string): boolean {
  const lowerCaseValue = value.toLocaleLowerCase()
  if (lowerCaseValue !== 'true' && lowerCaseValue !== 'false') {
    throw new Error(`Invalid environment variable type. Expected boolean, got value: '${value}'`)
  }
  return lowerCaseValue === 'true'
}

function get(variableName: ProcessEnv): string {
  const value = process.env[variableName]
  if (!isNotNullNorUndefinedUtil(value)) {
    throw new Error(`Environment variable '${variableName}' is not defined`)
  }
  return value
}

export function getString(variableName: ProcessEnv): string {
  return get(variableName)
}

export function getNumber(variableName: ProcessEnv): number {
  const value = get(variableName)
  return parseNumber(value)
}

export function getBoolean(variableName: ProcessEnv): boolean {
  const value = get(variableName)
  return parseBoolean(value)
}

export function has(variableName: ProcessEnv): boolean {
  const value = process.env[variableName]
  return !!isNotNullNorUndefinedUtil(value)
}
