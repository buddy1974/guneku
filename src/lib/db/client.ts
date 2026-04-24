import { neon, NeonQueryFunction } from '@neondatabase/serverless'

let _sql: NeonQueryFunction<false, false> | null = null

function getClient(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

export const sql: NeonQueryFunction<false, false> = new Proxy(
  {} as NeonQueryFunction<false, false>,
  {
    apply(_target, thisArg, args) {
      return (getClient() as any).apply(thisArg, args)
    },
    get(_target, prop) {
      return (getClient() as any)[prop]
    },
  }
)
