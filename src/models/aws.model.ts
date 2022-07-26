export interface LambdaRequestContext {
  authorizer: {
    userRoles: string[]
  }
  awsRequestId: string
}

export interface AwsLambdaSqsRecords {
  body?: string
}

export interface LambdaRequestEvent {
  pathParameters: {
    id: string
  }
  requestContext: LambdaRequestContext
  Records?: AwsLambdaSqsRecords[]
  body?: string
  headers?: Record<string, unknown>
}
