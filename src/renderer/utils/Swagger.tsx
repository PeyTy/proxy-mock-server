/* eslint-disable @typescript-eslint/member-delimiter-style */
export interface SwaggerPathResponseHeader {
  type: 'integer' | 'string'
  format: 'int32' | 'date-time'
  description: string
}

export interface SwaggerPathSchema {
  type?: 'string' | 'array'
  $ref?: string
}

export interface SwaggerPathResponse {
  headers: {
    [path: string]: SwaggerPathResponseHeader
  }

  schema?: SwaggerPathSchema

  description?: string

  content?: {
    'application/json'?: {
      schema?: SwaggerPathSchema
    }
  }
}

export interface SwaggerPathMethod {
  responses: {
    [path: string]: SwaggerPathResponse
  }
  summary?: string
}

export interface SwaggerPath {
  [path: string]: SwaggerPathMethod
}

export interface SwaggerDefinitionPropery {
  type: 'integer'
  format?: 'int64'
}

export interface SwaggerDefinition {
  type?: 'object' | 'integer' | 'array' | 'string' | 'boolean'
  format?: 'int64'
  example?: string | number
  required?: string[]
  $ref?: string
  properties?: {
    [name: string]: SwaggerDefinition
  }
}

export interface SwaggerDefinitions {
  [ref: string]: SwaggerDefinition
}

export interface Swagger {
  basePath?: string
  paths: {
    [path: string]: SwaggerPath
  }
  definitions?: SwaggerDefinitions
  components?: { schemas?: SwaggerDefinitions }
}
