import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'

export class OpenAPI {
  public readonly registry = new OpenAPIRegistry()

  generate() {
    const generator = new OpenApiGeneratorV3(this.registry.definitions)

    return Promise.resolve(
      generator.generateDocument({
        openapi: '3.0.0',
        info: {
          version: '1.0.0',
          title: 'My API',
          description: 'This is the API',
        },
        servers: [{ url: 'v1' }],
      }),
    )
  }
}
