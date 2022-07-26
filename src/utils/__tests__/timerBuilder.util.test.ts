import { DateTime, Settings } from 'luxon'
import { mocked } from 'ts-jest/utils'
import { v4 } from 'uuid'

import type { TimerHttpPost } from '../../models'
import { timerBuilder } from '../timerBuilder.util'

jest.mock('uuid')
const uuidV4Mock = mocked(v4)

describe('timerBuilder.util.ts', () => {

  it('returns timer from input json with times as string', () => {
    uuidV4Mock.mockReturnValue('test-id')
    const expectedNow = DateTime.utc(2021, 6, 1, 23, 0, 0)
    Settings.now = ():number => expectedNow.toMillis()

    const httpInput = {hours: '4', minutes: '0', seconds: '1', url: 'https://someserver.com'} as TimerHttpPost

    const result = timerBuilder(httpInput)

    expect(result).toStrictEqual({
      id: 'test-id',
      processed: 'false',
      time: '2021-06-02T03:00:01.000Z',
      url: 'https://someserver.com'
      })
  })

  it('returns undefined if not a valid input', () => {
    const httpInput = {hours: '4'} as TimerHttpPost

    const result = timerBuilder(httpInput)

    expect(result).toBe(undefined)
  })
})
