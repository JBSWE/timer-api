import { v4 as uuid } from 'uuid'

export function extendCorrelationId(upstreamCorrelationId?: string): string {
  const correlationId = `timer-api-${uuid()}`
  return [upstreamCorrelationId, correlationId].filter(Boolean).join(',')
}
