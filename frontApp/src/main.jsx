import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from './context/AuthContext'
import "./index.css"
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Si una query falla, no reintenta automáticamente en producción
      // evita requests en cascada cuando el token expira
      retry: false,
      // Los datos se consideran frescos por 5 minutos por defecto
      staleTime: 1000 * 60 * 5,
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* FIX: QueryClientProvider debe ir FUERA de AuthProvider.
          AuthProvider usa useQueryClient() internamente (para queryClient.clear()
          en login y logout). Si AuthProvider está fuera de QueryClientProvider,
          useQueryClient() lanza un error porque el contexto no existe todavía. 
          
          Orden correcto:
          QueryClientProvider → BrowserRouter → AuthProvider → App  */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
