import { z } from 'zod'
import Elysia from 'elysia'

import { db } from '../database'
import { OpenAPI } from './openapi'
import {
  Method,
  Customize,
  ApiSchema,
  OpenapiBody,
  CustomContext,
  OpenapiResponse,
  DecoratedContext,
  RawOpenapiResponse,
} from '../types'

// Custom route handler that allows to use zod for validation
export const handle = <
  ParamsSchema extends z.ZodObject<{}> = never,
  QuerySchema extends z.ZodObject<{}> = never,
  BodySchema extends OpenapiBody = never,
  ResponseSchema extends OpenapiResponse = never,
>(
  method: Method,
  path: string,
  handler: (
    customContext: Prettify<
      CustomContext<ParamsSchema, QuerySchema, BodySchema['schema']>
    >,
  ) => unknown,
  {
    params: paramsSchema,
    query: querySchema,
    body: bodySchema,
    response: responseSchema,
  }: ApiSchema<ParamsSchema, QuerySchema, BodySchema, ResponseSchema> = {},
) => {
  const openapi = OpenAPI.instance

  if (paramsSchema) {
    openapi.registry.register(`params:${path}`, paramsSchema)
  }
  if (querySchema) {
    openapi.registry.register(`query:${path}`, querySchema)
  }
  if (bodySchema) {
    openapi.registry.register(`body:${path}`, bodySchema.schema)
  }
  if (responseSchema) {
    Object.values(responseSchema).forEach(responseOpenapi =>
      openapi.registry.register(`response:${path}`, responseOpenapi.schema),
    )
  }

  if (paramsSchema || querySchema || bodySchema || responseSchema) {
    openapi.registry.registerPath({
      method,
      path,
      request: {
        params: paramsSchema,
        query: querySchema,
        body: bodySchema
          ? {
              required: bodySchema.required,
              description: bodySchema.description,
              content: {
                'application/json': {
                  schema: bodySchema.schema,
                },
              },
            }
          : undefined,
      },
      responses: responseSchema
        ? Object.entries(responseSchema).reduce(
            (
              responseOpenapi,
              [statusCode, { description = 'No description', schema }],
            ) => {
              responseOpenapi[statusCode] = {
                description,
                content: {
                  'application/json': {
                    schema,
                  },
                },
              }
              return responseOpenapi
            },
            {} as RawOpenapiResponse,
          )
        : {},
    })
  }

  return (context: DecoratedContext) => {
    if (paramsSchema) {
      ;(context.params as unknown) = paramsSchema.parse(context.params)
    }
    if (querySchema) {
      context.query = querySchema.parse(context.query)
    }
    if (bodySchema) {
      context.body = bodySchema.schema.parse(context.body)
    }

    return handler(
      context as CustomContext<ParamsSchema, QuerySchema, BodySchema['schema']>,
    )
  }
}

// Application class
class App {
  private app = new Elysia().decorate('db', db)

  zodify() {
    const openapi = OpenAPI.instance

    const zod: Customize<typeof this.app> = {
      get: (path, handler, schema) =>
        this.app.get(path, handle('get', path, handler, schema)),
      post: (path, handler, schema) =>
        this.app.post(path, handle('post', path, handler, schema)),
      patch: (path, handler, schema) =>
        this.app.patch(path, handle('patch', path, handler, schema)),
      put: (path, handler, schema) =>
        this.app.put(path, handle('put', path, handler, schema)),
      delete: (path, handler, schema) =>
        this.app.delete(path, handle('delete', path, handler, schema)),
    }

    return Object.assign(this.app, {
      zod,
      openapi,
    })
  }
}

// Application factory class
export class AppFactory {
  create() {
    return new App()
  }
}
