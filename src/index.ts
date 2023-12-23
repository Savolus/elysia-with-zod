import { z } from 'zod'

import { configs } from './configs'
import { AppFactory } from './core'

// Creating elysia app and patching it with zod
const app = new AppFactory().create().zodify()

// Base elysia route
app.get('/', () => 'Elysia')

// Patched with zod elysia route without request schemas
app.zod.get('/without-schema', () => 'Elysia')

// Patched with zod elysia route with request query schema
app.zod.get('/with-schema', context => context.query.test, {
  query: z.object({ test: z.string() }),
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
