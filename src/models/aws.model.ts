export interface LambdaRequestContext {
  authorizer: {
    userRoles: string[]
  }
  awsRequestId: string
}
