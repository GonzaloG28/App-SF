import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, SafeAreaView, StatusBar, Platform
} from 'react-native';
import { theme } from '../../constants/theme';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  role: 'nadador' | 'profesor' | 'admin';
  title?: string;
  subtitle?: string;
}

export default function AppLayout({ children, role, title, subtitle }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const subtitleColor = role === 'nadador' ? theme.colors.green500
    : role === 'profesor' ? theme.colors.green500
    : theme.colors.orange500;

  const subtitleDefault = role === 'nadador' ? 'Centro de Atletas'
    : role === 'profesor' ? 'Club ÑSF'
    : 'Club ÑSF';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setSidebarOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerSubtitle, { color: subtitleColor }]}>
              {subtitle || subtitleDefault}
            </Text>
            <Text style={styles.headerTitle}>
              {title || 'Panel de Control'}
            </Text>
          </View>
        </View>

        {/* Avatar */}
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {role === 'nadador' ? '🏊' : role === 'profesor' ? '👨‍🏫' : '⚙️'}
          </Text>
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Sidebar Modal */}
      <Modal
        visible={sidebarOpen}
        transparent
        animationType="none"
        onRequestClose={() => setSidebarOpen(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => setSidebarOpen(false)}
            activeOpacity={1}
          />

          {/* Sidebar */}
          <View style={styles.sidebarContainer}>
            <Sidebar
              role={role}
              onClose={() => setSidebarOpen(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.slate100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuBtn: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.slate50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
    color: theme.colors.slate700,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.colors.slate900,
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    backgroundColor: theme.colors.blue50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.blue500,
  },
  headerAvatarText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
});