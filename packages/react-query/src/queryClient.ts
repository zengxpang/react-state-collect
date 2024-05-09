import { QueryCache } from './queryCache'
import { QueryKey, QueryObserverOptions } from './types'

interface QueryClientConfig {
  defaultOptions?: {
    queries?: {
      staleTime?: number
    }
  }
}

export class QueryClient {
  #queryCache: QueryCache

  constructor(config: QueryClientConfig = {}) {
    this.#queryCache = new QueryCache()
  }

  getQueryCache(): QueryCache {
    return this.#queryCache
  }
}
