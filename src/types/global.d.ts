export {}

// Global type helpers
declare global {
  type Nullable<T> = T | null

  type Prettify<T> = {
    [K in keyof T]: T[K]
  } & {}
}
