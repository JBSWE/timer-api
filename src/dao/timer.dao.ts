import { DynamoDB } from 'aws-sdk'
import type {
  DocumentClient,
  GetItemInput,
  PutItemInput,
  PutItemInputAttributeMap,
  PutItemOutput,
} from 'aws-sdk/clients/dynamodb'

import { NotFoundError } from '../errors/notFound.error'
import type { Timer } from '../models'

export class TimerDao {
  private dynamoDb: DocumentClient

  constructor(protected tableName: string) {
    this.dynamoDb = new DynamoDB.DocumentClient()
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
}
