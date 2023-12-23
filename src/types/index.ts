import { z } from 'zod'
import Elysia, { Context, HTTPMethod } from 'elysia'

import { db } from '../database'
import { handle } from '../core'

// Type for context that is being extended with decorated keys
export type DecoratedContext = Context & { db: typeof db }

// Type for schemas that will be validated on the request
export type RequestSchema<
  ParamsSchema extends z.ZodObject<{}>,
  QuerySchema extends z.ZodObject<{}>,
  BodySchema extends z.ZodObject<{}>,
> = {
  params?: ParamsSchema
  query?: QuerySchema
  body?: BodySchema
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

// Type for patching application with custom routes handlers
export type Customize<App extends Elysia> = Prettify<{
  route: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends z.ZodObject<{}>,
  >(
    method: HTTPMethod,
    path: string,
    ...args: Parameters<typeof handle<ParamsSchema, QuerySchema, BodySchema>>
  ) => ReturnType<App['route']>

  all: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends z.ZodObject<{}>,
  >(
    path: string,
    ...args: Parameters<typeof handle<ParamsSchema, QuerySchema, BodySchema>>
  ) => ReturnType<App['all']>

  get: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends z.ZodObject<{}>,
  >(
    path: string,
    ...args: Parameters<typeof handle<ParamsSchema, QuerySchema, BodySchema>>
  ) => ReturnType<App['get']>

  post: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends z.ZodObject<{}>,
  >(
    path: string,
    ...args: Parameters<typeof handle<ParamsSchema, QuerySchema, BodySchema>>
  ) => ReturnType<App['post']>

  patch: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends z.ZodObject<{}>,
  >(
    path: string,
    ...args: Parameters<typeof handle<ParamsSchema, QuerySchema, BodySchema>>
  ) => ReturnType<App['patch']>

  put: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends z.ZodObject<{}>,
  >(
    path: string,
    ...args: Parameters<typeof handle<ParamsSchema, QuerySchema, BodySchema>>
  ) => ReturnType<App['put']>

  delete: <
    ParamsSchema extends z.ZodObject<{}>,
    QuerySchema extends z.ZodObject<{}>,
    BodySchema extends z.ZodObject<{}>,
  >(
    path: string,
    ...args: Parameters<typeof handle<ParamsSchema, QuerySchema, BodySchema>>
  ) => ReturnType<App['delete']>
}>
