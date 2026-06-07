import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
    const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Hola, {user?.nombre}! 🏊</Text>
      <Text style={styles.subtitle}>Dashboard Admin</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 40 },
  button: { backgroundColor: '#EF4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
});