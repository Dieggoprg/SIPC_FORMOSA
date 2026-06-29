import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Cliente de React Query. Configura el comportamiento global del fetching de datos.
// staleTime: los datos se consideran frescos por 30 segundos antes de refetchear.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1>SIPC Formosa</h1>
      </div>
    </QueryClientProvider>
  )
}