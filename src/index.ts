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

// Creating zod validation and openapi documentation schemas
const testSchema = z.object({ test: z.string() }).openapi('TestSchema')

// Registering openapi documentation schema
app.openapi.registry.register('TestSchema', testSchema)

// Patched with zod elysia route with request query schema
app.zod.get('/with-schema', context => context.query.test, {
  query: testSchema,
})

// Base elysia route with context decorated with db
app.get('/access-ab', context => context.db)

// Patched with zod elysia route with context decorated with db
app.zod.get('/access-ab', context => context.db)

// Staring listening an application server on the port
app.listen(configs.application.port)

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
)

// Generating swagger documentation and setting components
app.openapi.generate().then(docs =>
  app.use(
    swagger({
      // provider: 'swagger-ui', // <- If you wan default swagger ui experience
      documentation: {
        components: docs.components as any,
      },
    }),
  ),
)
