import type {
  DocumentClient,
  GetItemInput,
  PutItemInput,
  PutItemInputAttributeMap,
  PutItemOutput,
  QueryInput,
} from 'aws-sdk/clients/dynamodb'

import type { ProcessEnv } from '../config'
import { getString } from '../config'
import { NotFoundError } from '../errors/notFound.error'
import type { Timer } from '../models'
import { getDynamoDbClient } from '../utils/offline.util'

export class TimerDao {
  private dynamoDb: DocumentClient
  private readonly unprocessedIndex: string

  constructor(protected tableName: string) {
    this.dynamoDb = getDynamoDbClient()
     this.unprocessedIndex = getString('DYNAMODB_INDEX' as ProcessEnv)
  }

  async upsert(newObj: Timer): Promise<PutItemOutput> {
    const params: PutItemInput = {
      TableName: this.tableName,
      Item: newObj as unknown as PutItemInputAttributeMap,
    }
    return this.dynamoDb.put(params).promise()
  }

  async getById(id: string): Promise<Timer> {
    const params = {
      TableName: this.tableName,
      Key: {id},
    } as GetItemInput
    const response = await this.dynamoDb.get(params).promise()
    const result = response.Item as Timer
    if (!result) {
      throw new NotFoundError(`cannot find ${id}`)
    }
    return result
  }

  async getOutstandingTimers(fifteenMinutesInFuture: string): Promise<Timer[]> {
    const params = {
      TableName: this.tableName,
      IndexName: this.unprocessedIndex,
      KeyConditionExpression: '#p = :isProcessed AND #t <= :futureTime',
      ExpressionAttributeNames: {
        '#t': 'time',
        '#p': 'processed',
      },
      ExpressionAttributeValues: {
        ':futureTime': fifteenMinutesInFuture,
        ':isProcessed': 'false',
      },
    } as QueryInput
    const response = await this.dynamoDb.query(params).promise()
    const result = response.Items as Timer[]
    if (!result) {
      throw new NotFoundError(`Cannot find unprocessed items for ${fifteenMinutesInFuture}`)
    }
    return result
  }
}
