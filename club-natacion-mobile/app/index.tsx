import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    console.log('Usuario logueado:', user); // debug
    console.log('Rol:', user.rol); // debug

    switch (user.rol) {
      case 'admin':
        router.replace('/(admin)');
        break;
      case 'profesor':
        router.replace('/(profesor)');
        break;
      case 'nadador':
        router.replace('/(nadador)');
        break;
      default:
        console.log('Rol no reconocido:', user.rol);
        router.replace('/(auth)/login');
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}