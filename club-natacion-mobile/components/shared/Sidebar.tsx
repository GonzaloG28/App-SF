import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing  } from 'react-native';
import { useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../constants/theme';
import {
  LayoutDashboard, Trophy, User, LogOut, Waves,
  ChevronRight, ClipboardList, Calendar, MessageSquare,
  BarChart3, Users, Wallet, X
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const NavItem = ({ to, label, Icon, exact }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const active = exact ? pathname === to : pathname.startsWith(to);
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.95, // Se encoge un poquito
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => router.push(to));
  };

  const Content = (
    <Animated.View style={[styles.navItem, active && styles.navItemActive, { transform: [{ scale: scaleValue }] }]}>
      {active ? (
        <LinearGradient
          colors={[theme.colors.blue600, theme.colors.green500]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      
      <View style={styles.navItemLeft}>
        <Icon
          size={19}
          strokeWidth={active ? 2.5 : 2}
          color={active ? theme.colors.white : theme.colors.slate500}
        />
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
      </View>
      {active && <ChevronRight size={14} color={theme.colors.white} opacity={0.7} />}
    </Animated.View>
  );

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {Content}
    </TouchableOpacity>
  );
};

interface SidebarProps {
  role: 'nadador' | 'profesor' | 'admin';
  userName?: string;
  userEmail?: string;
  onClose?: () => void;
}

export default function Sidebar({ role, userName = 'Atleta', userEmail = '', onClose }: SidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const navNadador = [
    { to: '/(nadador)',                label: 'Mi Panel',       Icon: LayoutDashboard, exact: true },
    { to: '/(nadador)/entrenamientos', label: 'Entrenamientos', Icon: ClipboardList },
    { to: '/(nadador)/tiempos',        label: 'Mis Marcas',     Icon: Waves },
    { to: '/(nadador)/competencias',   label: 'Competencias',   Icon: Trophy },
    { to: '/(nadador)/calendario',     label: 'Calendario',     Icon: Calendar },
    { to: '/(nadador)/perfil',         label: 'Ficha Técnica',  Icon: User },
  ];

  const navProfesor = [
    { to: '/(profesor)',                label: 'Dashboard',      Icon: LayoutDashboard, exact: true },
    { to: '/(profesor)/nadadores',      label: 'Nadadores',      Icon: Users },
    { to: '/(profesor)/entrenamientos', label: 'Entrenamientos', Icon: ClipboardList },
    { to: '/(profesor)/calendario',     label: 'Calendario',     Icon: Calendar },
    { to: '/(profesor)/metricas',       label: 'Métricas',       Icon: BarChart3 },
  ];

  const navAdmin = [
    { to: '/(admin)',             label: 'Dashboard',     Icon: LayoutDashboard, exact: true },
    { to: '/(admin)/nadadores',  label: 'Nadadores',     Icon: Users },
    { to: '/(admin)/finanzas',   label: 'Finanzas',      Icon: Wallet },
    { to: '/(admin)/chat',       label: 'Mensajes',      Icon: MessageSquare },
  ];

  const navItems = role === 'nadador' ? navNadador
    : role === 'profesor' ? navProfesor : navAdmin;

  const roleLabel = role === 'nadador' ? 'Atleta'
    : role === 'profesor' ? 'Coach' : 'Administración';

  const roleColor = role === 'admin' ? theme.colors.orange500 : theme.colors.green600;
  const sectionLabel = role === 'nadador' ? 'Rendimiento'
    : role === 'profesor' ? 'Panel Profesor' : 'Panel Admin';

  const initials = [userName?.charAt(0), userName?.split(' ')?.[1]?.charAt(0)]
    .filter(Boolean).join('').toUpperCase() || 'AT';

  return (
    <View style={styles.container}>
      {onClose && (
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <X size={20} color={theme.colors.slate400} />
        </TouchableOpacity>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo con Gradiente como en la web */}
        <View style={styles.logoRow}>
          <LinearGradient
            colors={[theme.colors.blue600, theme.colors.green500]}
            style={styles.logoIcon}
          >
            <Waves size={20} color={theme.colors.white} />
          </LinearGradient>
          <View>
            <Text style={[styles.roleLabel, { color: theme.colors.green600 }]}>{roleLabel}</Text>
            <Text style={styles.appName}>
              App<Text style={styles.appNameBlue}>ÑSF</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{sectionLabel}</Text>
        {navItems.map((item) => <NavItem key={item.to} {...item} />)}
      </ScrollView>

      {/* Footer mejorado */}
      <View style={styles.footer}>
        <View style={styles.userCard}>
          <LinearGradient colors={[theme.colors.blue600, theme.colors.green500]} style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{initials.charAt(0)}</Text>
          </LinearGradient>
          <View style={styles.onlineDot} />
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{userName.split(' ')[0]}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{userEmail || 'Online'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={theme.colors.slate400} strokeWidth={2.5} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  scroll: { flex: 1 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 36,
    paddingHorizontal: 4,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '3deg' }],
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 2,
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.slate900,
    letterSpacing: -1,
  },
  appNameBlue: {
    color: theme.colors.blue600,
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 12,
    marginLeft: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16, // Más redondeado como la web
    marginBottom: 6,
    overflow: 'hidden', // Necesario para que el LinearGradient no se salga de las esquinas
  },
  navItemActive: {
    borderRadius: 16,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.slate500,
    letterSpacing: -0.3,
  },
  navLabelActive: {
    color: theme.colors.white,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.slate100,
    paddingTop: 16,
    gap: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.slate100,
    marginBottom: 8,
  },
  userAvatarWrap: { position: 'relative' },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: theme.colors.white,
    fontWeight: '900',
    fontSize: 16,
    fontStyle: 'italic',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.green500,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.slate900,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  userEmail: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.slate400,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    gap: 12,
  },
  logoutText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    color: theme.colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
});