import { z } from 'zod'

// Validated and transformed environment variable
export const configs = z
  .object({
    PORT: z.preprocess(val => val, z.coerce.number()),
    DB_HOST: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_DATABASE: z.string(),
  })
  .transform(configs => ({
    application: {
      port: configs.PORT,
    },
    database: {
      host: configs.DB_HOST,
      user: configs.DB_USER,
      password: configs.DB_PASSWORD,
      database: configs.DB_DATABASE,
    },
  }))
  .parse(process.env)
