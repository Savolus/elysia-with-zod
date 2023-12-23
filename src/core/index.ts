import { z } from 'zod'
import Elysia from 'elysia'

import { db } from '../database'
import {
  Customize,
  CustomContext,
  RequestSchema,
  DecoratedContext,
} from '../types'

// Custom route handler that allows to use zod for validation
export const handle =
  <
    ParamsSchema extends z.ZodObject<{}> = never,
    QuerySchema extends z.ZodObject<{}> = never,
    BodySchema extends z.ZodObject<{}> = never,
  >(
    handler: (
      customContext: Prettify<
        CustomContext<ParamsSchema, QuerySchema, BodySchema>
      >,
    ) => unknown,
    {
      params: paramsSchema,
      query: querySchema,
      body: bodySchema,
    }: RequestSchema<ParamsSchema, QuerySchema, BodySchema> = {},
  ) =>
  (context: DecoratedContext) => {
    if (paramsSchema) {
      ;(context.params as unknown) = paramsSchema.parse(context.params)
    }
    if (querySchema) {
      context.query = querySchema.parse(context.query)
    }
    if (bodySchema) {
      context.body = bodySchema.parse(context.body)
    }

    return handler(
      context as CustomContext<ParamsSchema, QuerySchema, BodySchema>,
    )
  }

// Application class
class App {
  private app = new Elysia().decorate('db', db)

  instance() {
    return this.app
  }

  zodify() {
    const zod: Customize<typeof this.app> = {
      route: (method, path, handler, schema) =>
        this.app.route(method, path, handle(handler, schema)),
      all: (path, handler, schema) =>
        this.app.all(path, handle(handler, schema)),
      get: (path, handler, schema) =>
        this.app.get(path, handle(handler, schema)),
      post: (path, handler, schema) =>
        this.app.post(path, handle(handler, schema)),
      patch: (path, handler, schema) =>
        this.app.patch(path, handle(handler, schema)),
      put: (path, handler, schema) =>
        this.app.put(path, handle(handler, schema)),
      delete: (path, handler, schema) =>
        this.app.delete(path, handle(handler, schema)),
    }

    return Object.assign(this.app, {
      zod,
    })
  }
}

// Application factory class
export class AppFactory {
  create() {
    return new App()
  }
}
