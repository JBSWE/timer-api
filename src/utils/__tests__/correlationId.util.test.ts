import { mocked } from 'ts-jest/utils'
import { v4 } from 'uuid'

import { extendCorrelationId } from '../correlationId.util'

jest.mock('uuid')
const uuidV4Mock = mocked(v4)

describe('correlationId', () => {
  uuidV4Mock.mockReturnValue('af049fe3-aa54-4e0d-94fb-121f62eaf6e4')

  it('should generate a correlation id and append it to upstream correlation ids', () => {
    const upstreamCorrelationId = 'some-upstream-service-uuid'

    const result = extendCorrelationId(upstreamCorrelationId)

    expect(result).toEqual('some-upstream-service-uuid,timer-api-af049fe3-aa54-4e0d-94fb-121f62eaf6e4')
  })

  it('should generate a correlation id and handle the case when no upstream correlation id is defined', () => {
    const upstreamCorrelationId = undefined

    const result = extendCorrelationId(upstreamCorrelationId)

    expect(result).toEqual('timer-api-af049fe3-aa54-4e0d-94fb-121f62eaf6e4')
  })
})
