import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Link as LinkIcon, Clock, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/shared/AppLayout';
import api from '../../services/api';
import { theme } from '../../constants/theme';

// ==========================================
// 1. SUB-COMPONENTE: BADGE DE ESTADO
// ==========================================
function StatusBadge({ completed, type }: { completed: boolean; type: string }) {
  return (
    <View style={[styles.badge, completed ? styles.badgeSuccess : styles.badgeDefault]}>
      <Text style={[styles.badgeText, completed ? styles.badgeTextSuccess : styles.badgeTextDefault]}>
        {completed ? "✓ Éxito" : `Fase: ${type}`}
      </Text>
    </View>
  );
}

// ==========================================
// 2. SUB-COMPONENTE: TARJETA DE ENTRENAMIENTO
// ==========================================
interface TrainingCardProps {
  ent: any;
  onComplete: () => void;
  isPending: boolean;
}

function TrainingCard({ ent, onComplete, isPending }: TrainingCardProps) {
  const handleOpenURL = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.card, ent.completado ? styles.cardCompleted : styles.cardActive]}>
      <View style={[styles.cardAccent, { backgroundColor: ent.completado ? theme.colors.green500 : theme.colors.blue600 }]} />

      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.dateLabel}>
            {new Date(ent.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </Text>
          <Text style={styles.cardTitle}>{ent.titulo}</Text>
        </View>
        <StatusBadge completed={ent.completado} type={ent.tipo} />
      </View>

      <View style={styles.mainContent}>
        {ent.tipo === 'texto' && (
          <View style={styles.textContainer}>
            <Text style={styles.textContent}>{ent.contenido}</Text>
          </View>
        )}

        {ent.tipo === 'archivo' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenURL(ent.archivoUrl)}>
            <Text style={styles.actionButtonText}>DESCARGAR PDF DE RUTINA</Text>
            <View style={styles.iconBox}>
              <Download size={18} color={theme.colors.white} />
            </View>
          </TouchableOpacity>
        )}

        {ent.tipo === 'link' && (
          <TouchableOpacity style={styles.linkButton} onPress={() => handleOpenURL(ent.contenido)}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBox}>
                <LinkIcon size={18} color={theme.colors.blue600} />
              </View>
              <Text style={styles.linkText}>REFERENCIA DE VIDEO EXTERNA</Text>
            </View>
            <ChevronRight size={16} color={theme.colors.slate300} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>NOTAS COACH</Text>
          <Text style={styles.notesText}>"{ent.notasProfesor || 'Sin comentarios'}"</Text>
        </View>

        <TouchableOpacity
          style={[styles.completeBtn, ent.completado && styles.completeBtnDone]}
          onPress={onComplete}
          disabled={ent.completado || isPending}
        >
          <Text style={[styles.completeBtnText, ent.completado && styles.completeBtnTextDone]}>
            {isPending ? '...' : ent.completado ? 'COMPLETADO' : 'MARCAR FINALIZADO'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==========================================
// 3. COMPONENTE PRINCIPAL (EXPORT DEFAULT)
// ==========================================
export default function MisEntrenamientos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Cargar Perfil para los datos del Sidebar/Navbar
  const { data: perfil, isLoading: loadPerfil } = useQuery({
    queryKey: ['miPerfil'],
    queryFn: async () => (await api.get('/nadadores/perfil')).data,
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  // 2. Cargar Entrenamientos
  const { data: entrenamientos = [], isLoading: loadEntreno } = useQuery({
    queryKey: ['misEntrenamientos'],
    queryFn: async () => {
      const res = await api.get('/entrenamiento/mis-entrenamientos');
      return Array.isArray(res.data) ? res.data : (res.data?.entrenamientos || []);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Mutación para completar rutina
  const completarMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(`/entrenamiento/completar/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misEntrenamientos'] });
    },
  });

  // Variables para los datos del Layout de manera idéntica al index
  const userName = perfil?.user?.nombre || user?.nombre || 'Atleta';
  const userEmail = perfil?.user?.correo || user?.correo || '';
  const initials = [perfil?.user?.nombre?.charAt(0), perfil?.apellido?.charAt(0)]
    .filter(Boolean).join('').toUpperCase() || 'AT';

  const isLoading = loadPerfil || loadEntreno;

  if (isLoading) {
    return (
      <AppLayout role="nadador" title="Cargando..." userName={userName} userEmail={userEmail} initials={initials}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.blue600} />
          <Text style={styles.loadingText}>Sincronizando datos...</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      role="nadador"
      title="Mis Rutinas"
      subtitle="Panel de Entrenamientos"
      userName={userName}
      userEmail={userEmail}
      initials={initials}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HEADER DE LA PANTALLA */}
        <View style={styles.header}>
          <View>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeBrand}>ÑSF</Text>
              <Text style={styles.panelSubtitle}>PANEL DE ENTRENAMIENTOS</Text>
            </View>
            <Text style={styles.mainTitle}>
              MIS <Text style={{ color: theme.colors.blue600 }}>RUTINAS</Text>
            </Text>
          </View>
          <View style={styles.counterBox}>
            <Text style={styles.counterLabel}>SESIONES</Text>
            <Text style={styles.counterNumber}>{entrenamientos?.length || 0}</Text>
          </View>
        </View>

        {/* LISTA DE TARJETAS */}
        <View style={styles.listContainer}>
          {entrenamientos?.length === 0 ? (
            <View style={styles.emptyCard}>
              <Clock size={32} color={theme.colors.slate300} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>SIN SESIONES PROGRAMADAS PARA HOY</Text>
            </View>
          ) : (
            entrenamientos?.map((ent: any) => (
              <TrainingCard
                key={ent._id}
                ent={ent}
                onComplete={() => completarMutation.mutate(ent._id)}
                isPending={completarMutation.isPending}
              />
            ))
          )}
        </View>
      </ScrollView>
    </AppLayout>
  );
}

// ==========================================
// 4. DISEÑO DE ESTILOS
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', paddingVertical: 40, gap: 16 },
  loadingText: { fontSize: 11, fontWeight: '900', color: theme.colors.slate400, letterSpacing: 4 },
  
  // Header Styles
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 24 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  badgeBrand: { backgroundColor: theme.colors.blue600, color: 'white', fontSize: 10, fontWeight: '900', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  panelSubtitle: { color: theme.colors.blue600, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  mainTitle: { fontSize: 36, fontWeight: '900', fontStyle: 'italic', color: theme.colors.slate900 },
  counterBox: { alignItems: 'flex-end' },
  counterLabel: { fontSize: 9, fontWeight: '900', color: theme.colors.slate400, letterSpacing: 1 },
  counterNumber: { fontSize: 28, fontWeight: '900', fontStyle: 'italic', color: theme.colors.slate900, marginTop: -4 },
  
  // List & Cards General
  listContainer: { paddingBottom: 32 },
  card: { backgroundColor: 'white', borderRadius: 28, padding: 20, marginBottom: 16, position: 'relative', borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  cardActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  cardCompleted: { borderColor: theme.colors.green500 },
  cardAccent: { position: 'absolute', left: 0, top: 24, bottom: 24, width: 4, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  
  // Card Content Layout
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dateLabel: { fontSize: 10, fontWeight: '900', color: theme.colors.slate400, marginBottom: 2 },
  cardTitle: { fontSize: 22, fontWeight: '900', fontStyle: 'italic', color: theme.colors.slate900, textTransform: 'uppercase' },
  mainContent: { marginTop: 16 },
  
  // Dynamic Content Renderers
  textContainer: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  textContent: { fontSize: 13, fontStyle: 'italic', color: theme.colors.slate600, lineHeight: 18 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.slate900, borderRadius: 16, paddingLeft: 16, paddingRight: 6, paddingVertical: 6, alignSelf: 'flex-start' },
  actionButtonText: { color: 'white', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  iconBox: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12, marginLeft: 12 },
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 16 },
  linkLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkIconBox: { backgroundColor: '#EFF6FF', padding: 8, borderRadius: 10 },
  linkText: { fontSize: 11, fontWeight: '900', color: theme.colors.slate800 },
  
  // Card Footer Layout
  footerContainer: { marginTop: 20, gap: 12 },
  notesBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  notesLabel: { fontSize: 9, fontWeight: '900', color: theme.colors.slate400, letterSpacing: 1, marginBottom: 2 },
  notesText: { fontSize: 12, fontStyle: 'italic', color: theme.colors.slate600 },
  completeBtn: { backgroundColor: theme.colors.slate900, paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  completeBtnDone: { backgroundColor: theme.colors.green50, borderWidth: 1, borderColor: theme.colors.green600 },
  completeBtnText: { color: 'white', fontWeight: '900', fontSize: 12, letterSpacing: 1.5 },
  completeBtnTextDone: { color: theme.colors.green600 },
  
  // Status Badges
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  badgeSuccess: { backgroundColor: theme.colors.green500, borderColor: 'transparent' },
  badgeDefault: { backgroundColor: 'white', borderColor: '#E2E8F0' },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  badgeTextSuccess: { color: 'white' },
  badgeTextDefault: { color: theme.colors.slate500 },
  
  // Empty State Styles
  emptyCard: { backgroundColor: 'white', borderRadius: 24, paddingVertical: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  emptyText: { fontSize: 11, fontWeight: '900', color: theme.colors.slate400, letterSpacing: 2, textAlign: 'center' }
});