import { DateTime, Settings } from 'luxon'

jest.mock('../../AWS/sqsPublisher.ts', () => {
  return {
    SqsPublisher: jest.fn(),
  }
})

const fillSqsWithOutstandingTimersMock = jest.fn()
jest.mock('../../services/timer.service', () => {
  return {
    TimerService: jest.fn().mockImplementation(() => {
      return {
        fillSqsWithOutstandingTimers: fillSqsWithOutstandingTimersMock,
      }
    }),
  }
})

import { scheduleOutstandingTimers } from '../scheduleHandler'

describe('scheduleOutstandingTimers', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('calls fillSqsWithOutstandingTimers successfully', async () => {
    const expectedNow = DateTime.utc(2021, 6, 1, 23, 0, 0)
    Settings.now = (): number => expectedNow.toMillis()

    await scheduleOutstandingTimers(expect.anything(), expect.anything())

    expect(fillSqsWithOutstandingTimersMock).toBeCalledWith('2021-06-01T23:15:00.000Z', expect.anything())
  })

  it('handles error on fillSqsWithOutstandingTimers', async () => {
    const expectedNow = DateTime.utc(2021, 6, 1, 23, 0, 0)
    Settings.now = (): number => expectedNow.toMillis()

    fillSqsWithOutstandingTimersMock.mockReturnValue(Error())

    await expect(scheduleOutstandingTimers(expect.anything(), expect.anything())).resolves
    expect(fillSqsWithOutstandingTimersMock).toBeCalledWith('2021-06-01T23:15:00.000Z', expect.anything())
  })
})
