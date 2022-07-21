import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'

import { SqsPublisher } from '../AWS/sqsPublisher'
import type { ProcessEnv } from '../config'
import { getString } from '../config'
import type { LambdaRequestContext, TimerHttpPost } from '../models'
import { Command } from '../models'
import { createContextForHttpRequest } from '../utils/createContext.util'
import { makeAcceptedHttpResponse, makeErrorResponse } from '../utils/http.util'
import { timerBuilder } from '../utils/timerBuilder.util'

const sqsPublisher = new SqsPublisher(getString('SQS_URL' as ProcessEnv))

export async function postTimer(event: APIGatewayProxyEvent, context: LambdaRequestContext): Promise<APIGatewayProxyResult> {
  const timerContext = createContextForHttpRequest(event, context)

  const data = getPostInputFromEvent(event)
  if (!data) {
    return makeErrorResponse(400, 'Request does not contain body')
  }

  const timer = timerBuilder(data)
  if (!timer) {
    return makeErrorResponse(422, 'Please add a valid timer to the request body')
  }

  const published = await sqsPublisher.publish(timerContext, Command.UPSERT, timer)
  if (!published) {
    return makeErrorResponse(500, 'Could not process timer')
  }

  timerContext.logger.info(`Timer ${timer.id} for was successfully put onto the queue`)
  return makeAcceptedHttpResponse(timer)
}

function getPostInputFromEvent(event: APIGatewayProxyEvent): TimerHttpPost | undefined {
  if (!event?.body) {
    return undefined
  }

  const decodedJsonObject = Buffer.from(event.body, 'base64').toString('ascii')
  return JSON.parse(decodedJsonObject)
}
