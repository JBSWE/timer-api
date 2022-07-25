import { DynamoDB } from 'aws-sdk'
import type { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

import type { ProcessEnv } from '../config'
import { getBoolean, getString } from '../config'

const isOffline = getBoolean('IS_OFFLINE' as ProcessEnv)

export const getSqsUrl = (): string => !isOffline ? getString('SQS_URL' as ProcessEnv) : getString('OFFLINE_SQS_URL' as ProcessEnv)

export const getDynamoDbClient = (): DocumentClient => !isOffline
  ? new DynamoDB.DocumentClient()
  : new DynamoDB.DocumentClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
})
