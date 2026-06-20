import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import {
  ShieldCheck, Mail, Lock, Eye, EyeOff,
  ChevronRight, AlertCircle, Loader2
} from 'lucide-react-native';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!correo.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(correo.trim(), password);
      switch (user.rol) {
        case 'admin':    router.replace('/(admin)');    break;
        case 'profesor': router.replace('/(profesor)'); break;
        case 'nadador':  router.replace('/(nadador)');  break;
        default: setError('Rol no reconocido');
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Demasiados intentos. Espera un momento.');
      } else {
        setError(err.response?.data?.message || 'Correo o contraseña incorrectos');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Blobs decorativos */}
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />

        <View style={styles.inner}>

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <ShieldCheck size={32} color={theme.colors.white} />
            </View>
            <Text style={styles.appName}>
              App<Text style={styles.appNameBlue}>ÑSF</Text>
            </Text>
            <Text style={styles.appTagline}>Security Gateway</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Acceso Privado</Text>
              <Text style={styles.cardSubtitle}>Ingresa al ecosistema deportivo</Text>
            </View>

            {/* Correo */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={16} color={theme.colors.slate400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="usuario@appnsf.com"
                  placeholderTextColor={theme.colors.slate300}
                  value={correo}
                  onChangeText={(t) => { setCorreo(t); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={16} color={theme.colors.slate400} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.slate300}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword
                    ? <EyeOff size={16} color={theme.colors.slate400} />
                    : <Eye size={16} color={theme.colors.slate400} />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error !== '' && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error.toUpperCase()}</Text>
              </View>
            )}

            {/* Botón */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.btnText}>Entrar al sistema</Text>
                  <ChevronRight size={16} color={theme.colors.white} />
                </>
              )}
            </TouchableOpacity>

            {/* Footer card */}
            <View style={styles.cardFooter}>
              <View style={styles.cardFooterLine} />
              <Text style={styles.cardFooterText}>
                Conexión Encriptada • AppÑSF v2.0
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.slate50,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  blobTop: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.green500,
    opacity: 0.07,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.blue600,
    opacity: 0.07,
  },
  inner: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 28,
  },
  logoSection: {
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: theme.colors.blue600,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '2deg' }],
    shadowColor: theme.colors.blue600,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.slate900,
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  appNameBlue: {
    color: theme.colors.blue600,
  },
  appTagline: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.green600,
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 32,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    gap: 16,
  },
  cardHeader: {
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.slate900,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.slate400,
    marginTop: 2,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.slate50,
    borderWidth: 1,
    borderColor: theme.colors.slate100,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.slate900,
    paddingVertical: 14,
  },
  eyeBtn: {
    padding: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  btn: {
    backgroundColor: theme.colors.orange500,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: theme.colors.orange500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  cardFooter: {
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  cardFooterLine: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.slate50,
  },
  cardFooterText: {
    fontSize: 8,
    fontWeight: '900',
    color: theme.colors.slate300,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});