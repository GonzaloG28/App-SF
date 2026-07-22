
import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, RefreshControl
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/shared/AppLayout';
import api from '../../services/api';
import { theme } from '../../constants/theme';
import {
  UserPlus, Search, Filter, User, Edit3, Trash2,
  Users, Target, Award, RefreshCcw,
  CheckCircle, XCircle, GraduationCap, Trophy, Loader2
} from 'lucide-react-native';

// ══════════════════════════════════════════════════
// UTILS (inline para no depender de imports externos)
// ══════════════════════════════════════════════════
const calcularEdad = (fechaNacimiento: string): number | null => {
  if (!fechaNacimiento) return null;
  const hoy   = new Date();
  const nac   = new Date(fechaNacimiento);
  let edad    = hoy.getFullYear() - nac.getFullYear();
  const mes   = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

const calcularCategoria = (fechaNacimiento: string): string => {
  const edad = calcularEdad(fechaNacimiento);
  if (edad === null) return 'N/A';
  if (edad <= 12)  return 'Infantil';
  if (edad <= 15)  return 'JA';
  if (edad <= 17)  return 'JB';
  return 'Mayores';
};

// ══════════════════════════════════════════════════
// COLORES DE TEMA PARA STAT CARDS
// ══════════════════════════════════════════════════
type ColorKey = 'blue' | 'green' | 'orange' | 'slate' | 'purple' | 'red';

const colorMap: Record<ColorKey, { bg: string; border: string; text: string }> = {
  blue:   { bg: '#eff6ff', border: '#dbeafe', text: '#2563eb' },
  green:  { bg: '#ecfdf5', border: '#d1fae5', text: '#059669' },
  orange: { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' },
  slate:  { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' },
  purple: { bg: '#f5f3ff', border: '#ede9fe', text: '#7c3aed' },
  red:    { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
};

// ══════════════════════════════════════════════════
// SUB-COMPONENTE: STAT MINI CARD
// ══════════════════════════════════════════════════
const StatMiniCard = memo(({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: any; color: ColorKey;
}) => {
  const c = colorMap[color];
  return (
    <View style={[styles.statCard, { borderColor: c.border }]}>
      <View style={[styles.statIconBox, { backgroundColor: c.bg, borderColor: c.border }]}>
        <Icon size={18} color={c.text} strokeWidth={2.5} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
});

// ══════════════════════════════════════════════════
// SUB-COMPONENTE: ATHLETE CARD
// ══════════════════════════════════════════════════
const AthleteCard = memo(({ nadador, onDelete, isDeleting, onPress, onEdit }: {
  nadador: any; onDelete: (id: string) => void;
  isDeleting: boolean; onPress: () => void; onEdit: () => void;
}) => {
  const esFormativo = nadador.rama === 'formativo';
  const edad        = calcularEdad(nadador.fechaNacimiento);
  const categoria   = calcularCategoria(nadador.fechaNacimiento);
  const inicial     = nadador.user?.nombre?.charAt(0)?.toUpperCase() || 'N';

  return (
    <View style={styles.athleteCard}>

      {/* Cabecera: avatar + badges */}
      <View style={styles.athleteCardTop}>
        {/* Avatar */}
        <View style={[
          styles.avatar,
          esFormativo ? styles.avatarFormativo : styles.avatarCompetitivo,
        ]}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>

        {/* Badges derecha */}
        <View style={styles.badgesCol}>
          <View style={styles.categoriaBadge}>
            <Text style={styles.categoriaBadgeText}>{categoria}</Text>
          </View>
          <View style={[
            styles.ramaBadge,
            esFormativo ? styles.ramaBadgeFormativo : styles.ramaBadgeCompetitivo,
          ]}>
            {esFormativo
              ? <GraduationCap size={9} color="#15803d" />
              : <Trophy size={9} color="#1d4ed8" />}
            <Text style={[
              styles.ramaBadgeText,
              esFormativo ? { color: '#15803d' } : { color: '#1d4ed8' },
            ]}>
              {esFormativo ? 'Formativo' : 'Competitivo'}
            </Text>
          </View>
        </View>
      </View>

      {/* Nombre + RUT */}
      <View style={styles.athleteNameBlock}>
        <Text style={styles.athleteName} numberOfLines={1}>
          {nadador.user?.nombre} {nadador.apellido}
        </Text>
        <Text style={styles.athleteMeta}>
          RUT {nadador.rut || 'N/A'}  ·  {edad ? `${edad} años` : 'N/A'}
        </Text>
      </View>

      {/* Badge de pago */}
      <View style={[
        styles.pagoBadge,
        nadador.pagoAlDia ? styles.pagoBadgeActive : styles.pagoBadgeInactive,
      ]}>
        {nadador.pagoAlDia
          ? <CheckCircle size={10} color="#059669" />
          : <XCircle size={10} color="#ea580c" />}
        <Text style={[
          styles.pagoBadgeText,
          nadador.pagoAlDia ? { color: '#059669' } : { color: '#ea580c' },
        ]}>
          {nadador.pagoAlDia ? 'Cuenta activa' : 'Cuenta inactiva'}
        </Text>
      </View>

      {/* Acciones */}
      <View style={styles.athleteActions}>
        <TouchableOpacity style={styles.actionBtnPrimary} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.actionBtnPrimaryText}>VER PERFIL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnIcon} onPress={onEdit} activeOpacity={0.8}>
          <Edit3 size={17} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnIconDanger}
          onPress={() => onDelete(nadador._id)}
          disabled={isDeleting}
          activeOpacity={0.8}
        >
          {isDeleting
            ? <ActivityIndicator size="small" color="#ef4444" />
            : <Trash2 size={17} color="#94a3b8" />}
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════
export default function ProfesorNadadores() {
  const { user }    = useAuth();
  const router      = useRouter();
  const queryClient = useQueryClient();

  // ── Filtros locales ────────────────────────────
  const [nombre,    setNombre]    = useState('');
  const [rama,      setRama]      = useState('');
  const [categoria, setCategoria] = useState('');
  const [filters,   setFilters]   = useState({ nombre: '', rama: '', categoria: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ── Query ──────────────────────────────────────
  const { data: nadadores = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['nadadores', filters],
    queryFn: async () => {
      const params: any = {};
      if (filters.nombre)    params.nombre    = filters.nombre;
      if (filters.rama)      params.rama      = filters.rama;
      if (filters.categoria) params.categoria = filters.categoria;
      const res = await api.get('/nadadores', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
    placeholderData: (prev: any) => prev,
    staleTime: 1000 * 60 * 5,
  });

  // ── Stats ──────────────────────────────────────
  const stats = useMemo(() => {
    return (nadadores as any[]).reduce(
      (acc: any, n: any) => {
        acc.total++;
        if (n.rama === 'formativo') acc.formativos++;
        else acc.competitivos++;
        const cat = calcularCategoria(n.fechaNacimiento);
        if (cat === 'Infantil') acc.infantiles++;
        else if (cat === 'JA' || cat === 'JB') acc.juveniles++;
        else if (cat === 'Mayores') acc.mayores++;
        return acc;
      },
      { total: 0, juveniles: 0, infantiles: 0, mayores: 0, formativos: 0, competitivos: 0 }
    );
  }, [nadadores]);

  // ── Mutación delete ────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/nadadores/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nadadores'] });
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
      Alert.alert('Error', 'No se pudo eliminar el atleta.');
    },
  });

  const handleBuscar = useCallback(() => {
    setFilters({ nombre, rama, categoria });
  }, [nombre, rama, categoria]);

  const handleReset = useCallback(() => {
    setNombre('');
    setRama('');
    setCategoria('');
    setFilters({ nombre: '', rama: '', categoria: '' });
  }, []);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      '¿Eliminar atleta?',
      'Esta acción es permanente y no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => { setDeletingId(id); deleteMutation.mutate(id); },
        },
      ]
    );
  }, [deleteMutation]);

  // ── Layout data ────────────────────────────────
  const userName  = (user as any)?.nombre || 'Profesor';
  const userEmail = (user as any)?.correo || '';
  const initials  = (user as any)?.nombre?.charAt(0)?.toUpperCase() || 'P';

  return (
    <AppLayout
      role="profesor"
      title="Team ÑSF"
      subtitle="Gestión de Plantel"
      userName={userName}
      userEmail={userEmail}
      initials={initials}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.colors.blue600} />
        }
        keyboardShouldPersistTaps="handled"
      >

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAccentRow}>
              <View style={styles.headerAccentLine} />
              <Text style={styles.headerSub}>GESTIÓN DE PLANTEL</Text>
            </View>
            <Text style={styles.headerTitle}>
              TEAM <Text style={styles.headerTitleAccent}>ÑSF</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push('/(profesor)/nadadorForm')}
            activeOpacity={0.85}
          >
            <UserPlus size={17} color="white" strokeWidth={2.5} />
            <Text style={styles.newBtnText}>{'REGISTRAR\nATLETA'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── STATS GRID (2×3) ── */}
        <View style={styles.statsGrid}>
          <StatMiniCard label="Total Plantel"  value={stats.total}        icon={Users}         color="blue"   />
          <StatMiniCard label="Infantiles"      value={stats.infantiles}   icon={Award}         color="orange" />
          <StatMiniCard label="Juveniles"       value={stats.juveniles}    icon={Target}        color="green"  />
          <StatMiniCard label="Mayores"         value={stats.mayores}      icon={User}          color="slate"  />
          <StatMiniCard label="Formativos"      value={stats.formativos}   icon={GraduationCap} color="red"    />
          <StatMiniCard label="Competitivos"    value={stats.competitivos} icon={Trophy}        color="purple" />
        </View>

        {/* ── SEARCH BAR ── */}
        <View style={styles.searchBar}>
          {/* Campo de texto */}
          <View style={styles.searchInputRow}>
            <Search size={18} color="#cbd5e1" />
            <TextInput
              placeholder="BUSCAR POR NOMBRE..."
              placeholderTextColor="#cbd5e1"
              value={nombre}
              onChangeText={setNombre}
              onSubmitEditing={handleBuscar}
              returnKeyType="search"
              style={styles.searchInput}
              autoCapitalize="characters"
            />
            {nombre !== '' && (
              <TouchableOpacity onPress={() => setNombre('')}>
                <XCircle size={16} color="#f97316" />
              </TouchableOpacity>
            )}
          </View>

          {/* Botones de filtro + buscar */}
          <View style={styles.searchControls}>
            <TouchableOpacity
              style={styles.filterToggleBtn}
              onPress={() => setShowFilters(f => !f)}
            >
              <Filter size={14} color={showFilters ? theme.colors.blue600 : '#64748b'} />
              <Text style={[styles.filterToggleText, showFilters && { color: theme.colors.blue600 }]}>
                FILTROS
              </Text>
            </TouchableOpacity>

            {(nombre || rama || categoria) && (
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                <Text style={styles.resetBtnText}>LIMPIAR</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.buscarBtn, isFetching && { opacity: 0.6 }]}
              onPress={handleBuscar}
              disabled={isFetching}
            >
              {isFetching
                ? <ActivityIndicator size="small" color="white" />
                : <Text style={styles.buscarBtnText}>BUSCAR</Text>}
            </TouchableOpacity>
          </View>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <View style={styles.filtersPanel}>
              {/* Rama */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupLabel}>
                  <Trophy size={10} color={theme.colors.blue600} /> RAMA
                </Text>
                <View style={styles.pillsRow}>
                  {[
                    { label: 'TODAS',       value: '' },
                    { label: 'COMPETITIVO', value: 'competitivo' },
                    { label: 'FORMATIVO',   value: 'formativo' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.pill, rama === opt.value && styles.pillActive]}
                      onPress={() => setRama(opt.value)}
                    >
                      <Text style={[styles.pillText, rama === opt.value && styles.pillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Categoría */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupLabel}>
                  <Filter size={10} color="#22c55e" /> CATEGORÍA
                </Text>
                <View style={styles.pillsRow}>
                  {[
                    { label: 'TODAS',    value: '' },
                    { label: 'INFANTIL', value: 'Infantil' },
                    { label: 'JUV. A',  value: 'JA' },
                    { label: 'JUV. B',  value: 'JB' },
                    { label: 'MAYORES', value: 'Mayores' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.pill, categoria === opt.value && styles.pillActive]}
                      onPress={() => setCategoria(opt.value)}
                    >
                      <Text style={[styles.pillText, categoria === opt.value && styles.pillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ── RESULTADOS ── */}
        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color={theme.colors.blue600} />
            <Text style={styles.loadingText}>SINCRONIZANDO BASE DE DATOS...</Text>
          </View>
        ) : (nadadores as any[]).length === 0 ? (
          <View style={styles.emptyCard}>
            <Users size={36} color="#e2e8f0" style={{ marginBottom: 14 }} />
            <Text style={styles.emptyTitle}>SIN COINCIDENCIAS</Text>
            <TouchableOpacity style={styles.emptyResetBtn} onPress={handleReset}>
              <Text style={styles.emptyResetText}>RESTABLECER BÚSQUEDA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.athletesGrid, isFetching && { opacity: 0.5 }]}>
            {(nadadores as any[]).map((n: any) => (
              <AthleteCard
                key={n._id}
                nadador={n}
                onDelete={handleDelete}
                isDeleting={deletingId === n._id}
                onPress={() => router.push(`/(profesor)/nadador/${n._id}`)}
                onEdit={() => router.push(`/(profesor)/nadadores/editar/${n._id}`)}
              />
            ))}
          </View>
        )}

      </ScrollView>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════
// ESTILOS
// ══════════════════════════════════════════════════
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 48 },

  // HEADER
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  headerLeft: { flex: 1 },
  headerAccentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  headerAccentLine: { width: 28, height: 3, backgroundColor: theme.colors.blue600, borderRadius: 2 },
  headerSub: { fontSize: 10, fontWeight: '900', color: theme.colors.blue600, letterSpacing: 1 },
  headerTitle: { fontSize: 25, fontWeight: '900', color: '#0f172a', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -1, lineHeight: 32 },
  headerTitleAccent: { color: theme.colors.blue600 },
  newBtn: {
    backgroundColor: '#0f172a', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  newBtnText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1, lineHeight: 14 },

  // STATS GRID
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '48%', backgroundColor: 'white', borderRadius: 20, padding: 12,
    borderWidth: 1, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#0f172a', fontStyle: 'italic', lineHeight: 26 },
  statLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },

  // SEARCH BAR
  searchBar: {
    backgroundColor: 'white', borderRadius: 24,
    borderWidth: 1, borderColor: '#f1f5f9',
    padding: 12, gap: 10,
    shadowColor: '#1e40af', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  searchInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f8fafc', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: {
    flex: 1, fontSize: 11, fontWeight: '900', color: '#334155', letterSpacing: 1,
  },
  searchControls: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  filterToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#f8fafc', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  filterToggleText: { fontSize: 10, fontWeight: '900', color: '#64748b', letterSpacing: 1 },
  resetBtn: {
    backgroundColor: '#fff7ed', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  resetBtnText: { fontSize: 10, fontWeight: '900', color: '#ea580c', letterSpacing: 1 },
  buscarBtn: {
    flex: 1, backgroundColor: theme.colors.blue600, borderRadius: 14,
    paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  buscarBtnText: { color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 2 },

  // FILTROS EXPANDIBLES
  filtersPanel: {
    backgroundColor: '#f8fafc', borderRadius: 16,
    padding: 14, gap: 12,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  filterGroup: { gap: 8 },
  filterGroupLabel: { fontSize: 9, fontWeight: '900', color: '#64748b', letterSpacing: 2, textTransform: 'uppercase' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10,
  },
  pillActive: { backgroundColor: theme.colors.blue600 },
  pillText: { fontSize: 10, fontWeight: '900', color: '#475569' },
  pillTextActive: { color: 'white' },

  // LOADING
  loadingBlock: { alignItems: 'center', paddingVertical: 60, gap: 14 },
  loadingText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 3 },

  // EMPTY
  emptyCard: {
    backgroundColor: 'white', borderRadius: 28,
    borderWidth: 1, borderStyle: 'dashed', borderColor: '#e2e8f0',
    paddingVertical: 48, alignItems: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', fontStyle: 'italic' },
  emptyResetBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#eff6ff', borderRadius: 20 },
  emptyResetText: { fontSize: 11, fontWeight: '900', color: theme.colors.blue600, letterSpacing: 1 },

  // ATHLETES GRID
  athletesGrid: { gap: 14 },
  athleteCard: {
    backgroundColor: 'white', borderRadius: 28, padding: 22,
    borderWidth: 1, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  athleteCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarFormativo: { backgroundColor: '#16a34a' },
  avatarCompetitivo: { backgroundColor: '#0f172a' },
  avatarText: { fontSize: 22, fontWeight: '900', color: 'white', fontStyle: 'italic' },
  badgesCol: { gap: 6, alignItems: 'flex-end' },
  categoriaBadge: {
    backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: '#dcfce7',
  },
  categoriaBadgeText: { fontSize: 9, fontWeight: '900', color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1 },
  ramaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1,
  },
  ramaBadgeFormativo: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  ramaBadgeCompetitivo: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  ramaBadgeText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },

  // Nombre + meta
  athleteNameBlock: { marginBottom: 10 },
  athleteName: {
    fontSize: 20, fontWeight: '900', color: '#0f172a',
    fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.5, lineHeight: 24,
  },
  athleteMeta: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 },

  // Badge pago
  pagoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, alignSelf: 'flex-start', marginBottom: 16,
  },
  pagoBadgeActive: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  pagoBadgeInactive: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' },
  pagoBadgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },

  // Acciones
  athleteActions: {
    flexDirection: 'row', gap: 8, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: '#f8fafc',
  },
  actionBtnPrimary: {
    flex: 1, backgroundColor: '#f8fafc', borderRadius: 14,
    height: 44, alignItems: 'center', justifyContent: 'center',
  },
  actionBtnPrimaryText: { fontSize: 11, fontWeight: '900', color: '#475569', letterSpacing: 1 },
  actionBtnIcon: {
    width: 44, height: 44, backgroundColor: '#f8fafc',
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  actionBtnIconDanger: {
    width: 44, height: 44, backgroundColor: '#f8fafc',
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
});
