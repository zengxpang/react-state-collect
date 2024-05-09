import { createContext, ReactNode, useContext } from 'react'

import type { QueryClient } from './queryClient'

export const QueryClientContext = createContext<QueryClient | undefined>(
  undefined,
)

export const useQueryClient = () => {
  const client = useContext(QueryClientContext)
  if (!client) {
    // 这里需要做一个判断，如果拿到的client为undefined就代表没被QueryClientProvider包裹，需要报错
    throw new Error('No QueryClient set, use QueryClientProvider to set one')
  }
  return client
}

export type QueryClientProviderProps = {
  client: QueryClient
  children?: ReactNode
}

export const QueryClientProvider = ({
  client,
  children,
}: QueryClientProviderProps) => {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  )
}
