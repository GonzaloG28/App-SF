// ═══════════════════════════════════════════════════
// MisCompetencias.tsx — versión React Native
// Replica del diseño web MisCompetencias.jsx
// ═══════════════════════════════════════════════════
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator,
  LayoutAnimation, UIManager, Platform
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/shared/AppLayout';
import api from '../../services/api';
import { theme } from '../../constants/theme';
import {
  Trophy, Search, Calendar, Waves,
  ChevronDown, Loader2, XCircle, Zap
} from 'lucide-react-native';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── UTILS ─────────────────────────────────────────
const formatFechaCorta = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
  });

// ── COMPONENTE PRINCIPAL ──────────────────────────
export default function MisCompetencias() {
  const { user } = useAuth();
  const [expandedComp, setExpandedComp] = useState<string | null>(null);
  const [searchNombre, setSearchNombre] = useState('');
  const [orden, setOrden] = useState<'asc' | 'desc'>('desc');

  const { data: perfil } = useQuery({
    queryKey: ['miPerfil'],
    queryFn: async () => (await api.get('/nadadores/perfil')).data,
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const { data: respCompetencias, isLoading: loadingComp } = useQuery({
    queryKey: ['misCompetencias', perfil?._id],
    queryFn: () => api.get(`/competencias/${perfil._id}`).then(r => r.data),
    enabled: !!perfil?._id,
  });

  const competencias: any[] = useMemo(() => {
    const lista = Array.isArray(respCompetencias)
      ? respCompetencias
      : (respCompetencias?.competencias || respCompetencias?.data || []);
    return lista;
  }, [respCompetencias]);

  const competenciasProcesadas = useMemo(() => {
    let lista = [...competencias];
    if (searchNombre) {
      lista = lista.filter(c =>
        c.nombre.toLowerCase().includes(searchNombre.toLowerCase())
      );
    }
    lista.sort((a, b) => {
      const fa = new Date(a.fecha).getTime();
      const fb = new Date(b.fecha).getTime();
      return orden === 'desc' ? fb - fa : fa - fb;
    });
    return lista;
  }, [competencias, searchNombre, orden]);

  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedComp(prev => (prev === id ? null : id));
  };

  const userName = perfil?.user?.nombre || user?.nombre || 'Atleta';
  const userEmail = perfil?.user?.correo  || user?.correo  || '';
  const initials  = [perfil?.user?.nombre?.charAt(0), perfil?.apellido?.charAt(0)]
    .filter(Boolean).join('').toUpperCase() || 'AT';

  if (loadingComp) {
    return (
      <AppLayout role="nadador" title="Competencias" userName={userName} userEmail={userEmail} initials={initials}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.blue600} />
          <Text style={styles.loadingText}>SINCRONIZANDO BASE DE DATOS...</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      role="nadador"
      title="Competencias"
      subtitle="Registro de Competencias"
      userName={userName}
      userEmail={userEmail}
      initials={initials}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeBrand}>ÑSF</Text>
              <Text style={styles.headerSubtitle}>REGISTRO DE COMPETENCIAS</Text>
            </View>
            <Text style={styles.mainTitle}>
              MIS{' '}
              <Text style={styles.mainTitleAccent}>COMPETENCIAS</Text>
            </Text>
          </View>
          <View style={styles.counterBox}>
            <Text style={styles.counterLabel}>EVENTOS</Text>
            <Text style={styles.counterNumber}>{competencias.length}</Text>
          </View>
        </View>

        {/* ── TOOLBAR ── */}
        <View style={styles.toolbar}>
          {/* Buscador */}
          <View style={styles.searchBox}>
            <Search size={15} color="#cbd5e1" />
            <TextInput
              placeholder="BUSCAR COMPETENCIA..."
              placeholderTextColor="#cbd5e1"
              value={searchNombre}
              onChangeText={setSearchNombre}
              style={styles.searchInput}
              autoCapitalize="characters"
            />
            {searchNombre !== '' && (
              <TouchableOpacity onPress={() => setSearchNombre('')}>
                <XCircle size={16} color="#f97316" />
              </TouchableOpacity>
            )}
          </View>

          {/* Controles */}
          <View style={styles.toolbarControls}>
            <TouchableOpacity
              style={styles.ordenBtn}
              onPress={() => setOrden(o => (o === 'desc' ? 'asc' : 'desc'))}
            >
              <Text style={styles.ordenBtnText}>
                {orden === 'desc' ? 'RECIENTES ↓' : 'ANTIGUAS ↑'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LISTADO ── */}
        {competenciasProcesadas.length > 0 ? (
          competenciasProcesadas.map(c => (
            <CompetenciaAcordeon
              key={c._id}
              competencia={c}
              isExpanded={expandedComp === c._id}
              onToggle={() => handleToggle(c._id)}
            />
          ))
        ) : (
          <EmptyState />
        )}

      </ScrollView>
    </AppLayout>
  );
}

// ── SUB-COMPONENTE: ACORDEÓN DE COMPETENCIA ───────
const CompetenciaAcordeon = ({
  competencia,
  isExpanded,
  onToggle,
}: {
  competencia: any;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const { data: respPruebas, isLoading: loadingPruebas } = useQuery({
    queryKey: ['pruebasDetalle', competencia._id],
    queryFn: () =>
      api.get(`/pruebas/${competencia._id}`).then(r => r.data),
    enabled: isExpanded,
  });

  const pruebas: any[] = useMemo(() => {
    if (!respPruebas) return [];
    return respPruebas?.pruebas || (Array.isArray(respPruebas) ? respPruebas : []);
  }, [respPruebas]);

  return (
    <View style={[styles.acordeon, isExpanded && styles.acordeonExpanded]}>

      {/* Cabecera */}
      <TouchableOpacity
        style={styles.acordeonHeader}
        onPress={onToggle}
        activeOpacity={0.75}
      >
        <View style={styles.acordeonHeaderLeft}>
          <View style={[styles.trophyIcon, isExpanded && styles.trophyIconActive]}>
            <Trophy size={18} color="white" />
          </View>
          <View style={styles.acordeonTitleBlock}>
            <Text style={styles.acordeonTitle} numberOfLines={1}>
              {competencia.nombre}
            </Text>
            <View style={styles.acordeonMeta}>
              <View style={styles.metaBadgeBlue}>
                <Calendar size={9} color={theme.colors.blue600} />
                <Text style={styles.metaBadgeTextBlue}>
                  {formatFechaCorta(competencia.fecha)}
                </Text>
              </View>
              <View style={styles.metaBadgeGreen}>
                <Waves size={9} color="#16a34a" />
                <Text style={styles.metaBadgeTextGreen}>
                  {competencia.piscina}M
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.chevronBtn, isExpanded && styles.chevronBtnActive]}>
          <ChevronDown
            size={15}
            color={isExpanded ? 'white' : '#94a3b8'}
            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
          />
        </View>
      </TouchableOpacity>

      {/* Panel expandido */}
      {isExpanded && (
        <View style={styles.acordeonBody}>
          <View style={styles.separator} />

          {loadingPruebas ? (
            <View style={styles.loadingPruebas}>
              <ActivityIndicator size="small" color={theme.colors.blue600} />
              <Text style={styles.loadingPruebasText}>ANALIZANDO MARCAS...</Text>
            </View>
          ) : pruebas.length === 0 ? (
            <View style={styles.sinPruebas}>
              <Text style={styles.sinPruebasText}>SIN PRUEBAS REGISTRADAS</Text>
            </View>
          ) : (
            <View style={styles.pruebasGrid}>
              {pruebas.map((p: any) => (
                <PruebaCard key={p._id} prueba={p} />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// ── SUB-COMPONENTE: TARJETA DE PRUEBA ─────────────
const PruebaCard = ({ prueba }: { prueba: any }) => (
  <View style={styles.pruebaCard}>
    <View style={styles.pruebaCardHeader}>
      <View style={styles.pruebaEstiloRow}>
        <View style={styles.zapIcon}>
          <Zap size={8} color="white" fill="white" />
        </View>
        <Text style={styles.pruebaEstilo}>{prueba.estilo}</Text>
      </View>
      <Text style={styles.pruebaDistancia}>{prueba.distancia}M</Text>
    </View>

    <View style={styles.pruebaTiempoBlock}>
      <Text style={styles.pruebaTiempoLabel}>TIEMPO FINAL</Text>
      <Text style={styles.pruebaTiempo}>{prueba.tiempo}</Text>
    </View>

    {prueba.parciales?.length > 0 && (
      <View style={styles.parciales}>
        {prueba.parciales.map((par: any, idx: number) => (
          <View key={idx} style={styles.parcialPill}>
            <Text style={styles.parcialText}>{par.tiempo ?? par}s</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

// ── EMPTY STATE ───────────────────────────────────
const EmptyState = () => (
  <View style={styles.emptyCard}>
    <Search size={36} color="#e2e8f0" style={{ marginBottom: 12, transform: [{ rotate: '12deg' }] }} />
    <Text style={styles.emptyTitle}>SIN REGISTROS</Text>
    <Text style={styles.emptySubtitle}>No hay marcas disponibles para este filtro</Text>
  </View>
);

// ── ESTILOS ───────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 48 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, paddingVertical: 80 },
  loadingText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 3 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 16,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  badgeBrand: {
    backgroundColor: theme.colors.blue600, color: 'white',
    fontSize: 10, fontWeight: '900', paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 4, overflow: 'hidden', fontStyle: 'italic',
  },
  headerSubtitle: { color: theme.colors.blue600, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  mainTitle: {
    fontSize: 20, fontWeight: '900', color: '#0f172a',
    fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.5,
  },
  mainTitleAccent: { color: theme.colors.blue600 },
  counterBox: { alignItems: 'center', minWidth: 70, backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  counterLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 2 },
  counterNumber: { fontSize: 22, fontWeight: '900', color: '#0f172a', fontStyle: 'italic', lineHeight: 26 },

  // Toolbar
  toolbar: {
    backgroundColor: 'white', borderRadius: 16,
    borderWidth: 1, borderColor: '#f1f5f9',
    padding: 10, gap: 8, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#f8fafc', borderRadius: 12,
  },
  searchInput: {
    flex: 1, fontSize: 11, fontWeight: '900', color: '#334155',
    letterSpacing: 1,
  },
  toolbarControls: { flexDirection: 'row', gap: 8 },
  ordenBtn: {
    flex: 1, backgroundColor: '#f8fafc', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  ordenBtnText: { fontSize: 10, fontWeight: '900', color: '#475569', letterSpacing: 1 },

  // Acordeón
  acordeon: {
    backgroundColor: 'white', borderRadius: 24,
    borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  acordeonExpanded: { borderColor: '#bfdbfe' },
  acordeonHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16, gap: 12,
  },
  acordeonHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  trophyIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  trophyIconActive: { backgroundColor: theme.colors.blue600 },
  acordeonTitleBlock: { flex: 1 },
  acordeonTitle: {
    fontSize: 16, fontWeight: '900', color: '#0f172a',
    fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.3,
  },
  acordeonMeta: { flexDirection: 'row', gap: 6, marginTop: 5 },
  metaBadgeBlue: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#eff6ff', paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, borderColor: '#dbeafe',
  },
  metaBadgeTextBlue: { fontSize: 10, fontWeight: '900', color: theme.colors.blue600 },
  metaBadgeGreen: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#f0fdf4', paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, borderColor: '#dcfce7',
  },
  metaBadgeTextGreen: { fontSize: 10, fontWeight: '900', color: '#16a34a' },
  chevronBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#f1f5f9', flexShrink: 0,
  },
  chevronBtnActive: { backgroundColor: theme.colors.blue600, borderColor: 'transparent' },

  // Body expandido
  acordeonBody: { paddingHorizontal: 16, paddingBottom: 16 },
  separator: { height: 1, backgroundColor: '#f8fafc', marginBottom: 14 },
  loadingPruebas: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  loadingPruebasText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2 },
  sinPruebas: { alignItems: 'center', paddingVertical: 20 },
  sinPruebasText: { fontSize: 10, fontWeight: '900', color: '#cbd5e1', letterSpacing: 2 },

  // Grid de pruebas (2 columnas)
  pruebasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pruebaCard: {
    width: '47.5%', backgroundColor: '#f8fafc',
    borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  pruebaCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  pruebaEstiloRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  zapIcon: {
    backgroundColor: theme.colors.blue600, padding: 4, borderRadius: 5,
  },
  pruebaEstilo: { fontSize: 11, fontWeight: '900', color: '#64748b', textTransform: 'uppercase' },
  pruebaDistancia: { fontSize: 13, fontWeight: '900', color: '#0f172a', fontStyle: 'italic' },
  pruebaTiempoBlock: { marginBottom: 10 },
  pruebaTiempoLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: 2 },
  pruebaTiempo: {
    fontSize: 26, fontWeight: '900', color: theme.colors.blue600,
    fontStyle: 'italic', letterSpacing: -0.5,
  },
  parciales: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  parcialPill: {
    backgroundColor: 'white', paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: '#f1f5f9',
  },
  parcialText: { fontSize: 11, fontWeight: '700', color: '#475569' },

  // Empty state
  emptyCard: {
    backgroundColor: 'white', borderRadius: 24,
    borderWidth: 1, borderStyle: 'dashed', borderColor: '#e2e8f0',
    paddingVertical: 48, alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a', fontStyle: 'italic', marginBottom: 4 },
  emptySubtitle: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1 },
});
