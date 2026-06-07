import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../constants/theme';

// Íconos simples con texto (sin librería externa)
const Icon = ({ name, size = 20, color = theme.colors.slate400 }: any) => {
  const icons: any = {
    dashboard:      '⊞',
    swimmers:       '🏊',
    trainings:      '💪',
    times:          '⏱',
    competitions:   '🏆',
    calendar:       '📅',
    profile:        '👤',
    logout:         '→',
    chat:           '💬',
    metrics:        '📊',
    nadadores:      '👥',
    finanzas:       '💰',
    convocatorias:  '📋',
  };
  return (
    <Text style={{ fontSize: size, color }}>{icons[name] || '•'}</Text>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const NavItem = ({ to, label, icon, exact }: NavItemProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const active = exact ? pathname === to : pathname.startsWith(to);

  return (
    <TouchableOpacity
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={() => router.push(to as any)}
    >
      <View style={styles.navItemLeft}>
        <Icon name={icon} size={18} color={active ? theme.colors.white : theme.colors.slate400} />
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>
          {label}
        </Text>
      </View>
      {active && <Text style={styles.navChevron}>›</Text>}
    </TouchableOpacity>
  );
};

interface SidebarProps {
  role: 'nadador' | 'profesor' | 'admin';
  onClose?: () => void;
}

export default function Sidebar({ role, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const navNadador = [
    { to: '/(nadador)',               label: 'Mi Panel',       icon: 'dashboard', exact: true },
    { to: '/(nadador)/entrenamientos', label: 'Entrenamientos', icon: 'trainings' },
    { to: '/(nadador)/tiempos',        label: 'Mis Marcas',     icon: 'times' },
    { to: '/(nadador)/perfil',         label: 'Ficha Técnica',  icon: 'profile' },
  ];

  const navProfesor = [
    { to: '/(profesor)',                label: 'Dashboard',      icon: 'dashboard', exact: true },
    { to: '/(profesor)/nadadores',      label: 'Nadadores',      icon: 'nadadores' },
    { to: '/(profesor)/entrenamientos', label: 'Entrenamientos', icon: 'trainings' },
    { to: '/(profesor)/calendario',     label: 'Calendario',     icon: 'calendar' },
  ];

  const navAdmin = [
    { to: '/(admin)',              label: 'Dashboard',      icon: 'dashboard', exact: true },
    { to: '/(admin)/nadadores',   label: 'Nadadores',      icon: 'nadadores' },
    { to: '/(admin)/finanzas',    label: 'Finanzas',       icon: 'finanzas' },
  ];

  const navItems = role === 'nadador' ? navNadador
    : role === 'profesor' ? navProfesor
    : navAdmin;

  const roleLabel = role === 'nadador' ? 'Atleta'
    : role === 'profesor' ? 'Coach'
    : 'Administración';

  const roleColor = role === 'nadador' ? theme.colors.green600
    : role === 'profesor' ? theme.colors.green600
    : theme.colors.orange500;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoWave}>🌊</Text>
          </View>
          <View>
            <Text style={[styles.roleLabel, { color: roleColor }]}>
              {roleLabel}
            </Text>
            <Text style={styles.appName}>
              App<Text style={styles.appNameBlue}>ÑSF</Text>
            </Text>
          </View>
        </View>

        {/* Nav */}
        <Text style={styles.sectionLabel}>
          {role === 'nadador' ? 'Rendimiento'
            : role === 'profesor' ? 'Panel Profesor'
            : 'Panel Admin'}
        </Text>

        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.nombre?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.nombre || 'Usuario'}
            </Text>
            <Text style={styles.userRole}>{roleLabel}</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>↩</Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scroll: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  logoIcon: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.blue50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '3deg' }],
  },
  logoWave: {
    fontSize: 22,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: theme.font.black,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 2,
  },
  appName: {
    fontSize: 20,
    fontWeight: theme.font.black,
    color: theme.colors.slate900,
    letterSpacing: -1,
  },
  appNameBlue: {
    color: theme.colors.blue600,
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: theme.font.black,
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
    borderRadius: theme.radius.xl,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: theme.colors.blue600,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: theme.font.bold,
    color: theme.colors.slate500,
    letterSpacing: -0.3,
  },
  navLabelActive: {
    color: theme.colors.white,
  },
  navChevron: {
    color: theme.colors.white,
    fontSize: 18,
    opacity: 0.7,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.slate100,
    paddingTop: 16,
    gap: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.slate50,
    padding: 12,
    borderRadius: theme.radius.xxl,
    borderWidth: 1,
    borderColor: theme.colors.slate100,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.blue600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: theme.colors.white,
    fontWeight: theme.font.black,
    fontSize: 16,
    fontStyle: 'italic',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontWeight: theme.font.black,
    color: theme.colors.slate900,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  userRole: {
    fontSize: 10,
    fontWeight: theme.font.bold,
    color: theme.colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.green500,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: theme.radius.xl,
  },
  logoutIcon: {
    fontSize: 18,
    color: theme.colors.slate400,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: theme.font.black,
    color: theme.colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
});