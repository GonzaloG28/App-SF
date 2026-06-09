import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // El tiempo que la caché sobrevive en memoria aunque no se esté viendo (15 min)
      // Nota: Si usas React Query v4, cambia 'gcTime' por 'cacheTime'
      gcTime: 1000 * 60 * 15, 
      
      // Opcional: Evita que recargue solo por cambiar de pestaña en el móvil
      refetchOnWindowFocus: false, 
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </QueryClientProvider>
  );
}