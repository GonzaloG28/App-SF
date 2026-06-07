import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  id: string;
  nombre: string;
  correo: string;        // ← correo no email
  rol: 'admin' | 'profesor' | 'nadador';
  debeCambiarPassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<User>; // ← Promise<User> no Promise<void>
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app, verificar si hay sesión guardada
  useEffect(() => {
    checkStoredSession();
  }, []);

  const checkStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Agregar token al header de axios
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.log('Error al cargar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (correo: string, password: string) => {

    console.log('=== LOGIN DEBUG ===');
  console.log('correo:', correo);
  console.log('password:', password);
  console.log('body a enviar:', JSON.stringify({ correo, password }));
  console.log('base url:', api.defaults.baseURL);
  const { data } = await api.post('/auth/login', { correo, password });

  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));

  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

  setToken(data.token);
  setUser(data.user);

  return data.user;
};

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);