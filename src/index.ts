import { z } from 'zod'
import swagger from '@elysiajs/swagger'

import { configs } from './configs'
import { AppFactory } from './core'

// Creating elysia app and patching it with zod
const app = new AppFactory().create().zodify()

// Base elysia route
app.get('/', () => 'Elysia')

// Patched with zod elysia route without request schemas
app.zod.get('/without-schema', () => 'Elysia')

// Patched with zod elysia route with request query schema
app.zod.get('/get-with-schema', context => context.query.test, {
  query: z.object({ test: z.string().openapi({ example: 'query' }) }),
  response: {
    200: {
      schema: z.object({
        test: z.string().openapi({ example: 'response' }),
      }),
    },
  },
})

app.zod.post('/post-with-schema', context => context.body.test, {
  body: {
    schema: z.object({
      test: z.string().openapi({ example: 'body' }),
    }),
  },
  response: {
    200: {
      schema: z.object({
        test: z.string().openapi({ example: 'response' }),
      }),
    },
  },
})

// Base elysia route with context decorated with db
app.get('/access-db', context => context.db)

// Patched with zod elysia route with context decorated with db
app.zod.get('/access-zod-db', context => context.db, {
  query: z.object({ test: z.string().openapi({ example: 'query' }) }),
  response: {
    200: {
      schema: z.object({
        test: z.string().openapi({ example: 'response' }),
      }),
    },
  },
})

// Staring listening an application server on the port
app.listen(configs.application.port)

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
)

// Generating swagger documentation and setting components
app.openapi.generate().then(docs =>
  app.use(
    swagger({
      // provider: 'swagger-ui', // <- If you want default swagger ui experience
      documentation: {
        paths: docs.paths as any,
        components: docs.components as any,
      },
    }),
  ),
)
