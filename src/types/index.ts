import { z } from 'zod'
import Elysia, { Context, SingletonBase } from 'elysia'
import { ResponseConfig } from '@asteasolutions/zod-to-openapi'

import { db } from '../database'

export type Method =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'head'
  | 'options'

// Type for context that is being extended with decorated keys
export type DecoratedContext = Context & { db: typeof db }

export type OpenapiBody = {
  description?: string
  required?: boolean
  schema: z.ZodObject<{}>
}

export type RawOpenapiResponse = {
  [statusCode: string]: ResponseConfig
}

export type OpenapiResponse = {
  [statusCode: string]: {
    description?: string
    schema: z.ZodObject<{}>
  }
}

// Type for schemas that will be validated on the request
export type ApiSchema<
  ParamsSchema extends z.ZodObject<{}>,
  QuerySchema extends z.ZodObject<{}>,
  BodySchema extends OpenapiBody,
  ResponseSchema extends OpenapiResponse,
> = {
  params?: ParamsSchema
  query?: QuerySchema
  body?: BodySchema
  response?: ResponseSchema
}

// Type for decorated context patched with validated request data
export type CustomContext<
  ParamsSchema extends z.ZodObject<{}>,
  QuerySchema extends z.ZodObject<{}>,
  BodySchema extends z.ZodObject<{}>,
> = Omit<DecoratedContext, 'params' | 'query' | 'body'> & {
  params: z.infer<ParamsSchema>
  query: z.infer<QuerySchema>
  body: z.infer<BodySchema>
}

export type Handler<
  ParamsSchema extends z.ZodObject<{}>,
  QuerySchema extends z.ZodObject<{}>,
  BodySchema extends OpenapiBody,
> = (
  customContext: Prettify<
    CustomContext<ParamsSchema, QuerySchema, BodySchema['schema']>
  >,
) => unknown

// Type for patching application with custom routes handlers
export type Customize<
  App extends Elysia<
    '',
    false,
    SingletonBase & { decorator: { db: typeof db } }
  >,
> = Prettify<{
  get: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends OpenapiBody,
    ResponseSchema extends OpenapiResponse,
  >(
    path: string,
    handler: Handler<ParamsSchema, QuerySchema, BodySchema>,
    schemas?: ApiSchema<ParamsSchema, QuerySchema, BodySchema, ResponseSchema>,
  ) => ReturnType<App['get']>

  post: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends OpenapiBody,
    ResponseSchema extends OpenapiResponse,
  >(
    path: string,
    handler: Handler<ParamsSchema, QuerySchema, BodySchema>,
    schemas?: ApiSchema<ParamsSchema, QuerySchema, BodySchema, ResponseSchema>,
  ) => ReturnType<App['post']>

  patch: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends OpenapiBody,
    ResponseSchema extends OpenapiResponse,
  >(
    path: string,
    handler: Handler<ParamsSchema, QuerySchema, BodySchema>,
    schemas?: ApiSchema<ParamsSchema, QuerySchema, BodySchema, ResponseSchema>,
  ) => ReturnType<App['patch']>

  put: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends OpenapiBody,
    ResponseSchema extends OpenapiResponse,
  >(
    path: string,
    handler: Handler<ParamsSchema, QuerySchema, BodySchema>,
    schemas?: ApiSchema<ParamsSchema, QuerySchema, BodySchema, ResponseSchema>,
  ) => ReturnType<App['put']>

  delete: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends OpenapiBody,
    ResponseSchema extends OpenapiResponse,
  >(
    path: string,
    handler: Handler<ParamsSchema, QuerySchema, BodySchema>,
    schemas?: ApiSchema<ParamsSchema, QuerySchema, BodySchema, ResponseSchema>,
  ) => ReturnType<App['delete']>
}>
