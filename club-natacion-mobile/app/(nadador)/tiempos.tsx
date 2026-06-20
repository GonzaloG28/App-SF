import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Waves, Calendar, TrendingDown, Timer, Star, Zap, Filter, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/shared/AppLayout';
import api from '../../services/api';
import { theme } from '../../constants/theme';

// ==========================================
// UTILS / HELPERS
// ==========================================
const tiempoASegundos = (tiempoStr: string) => {
  if (!tiempoStr) return 0;
  const partes = tiempoStr.split(':');
  if (partes.length === 2) {
    const [min, seg] = partes;
    return parseFloat(min) * 60 + parseFloat(seg);
  }
  return parseFloat(tiempoStr);
};

const segundosATiempo = (segundos: number) => {
  const min = Math.floor(segundos / 60);
  const seg = (segundos % 60).toFixed(2);
  return min > 0 ? `${min}:${seg.padStart(5, '0')}` : seg;
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function MisTiempos() {
  const { user } = useAuth();
  
  // Estado de filtros adaptado a selectores móviles
  const [filtros, setFiltros] = useState({
    estilo: "Libre",
    distancia: 50,
    piscina: 25,
    orden: "fecha_desc"
  });

  // Helper para actualizar filtros de forma nativa
  const handleUpdateFiltro = useCallback((key: string, value: any) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  }, []);

  const formatFecha = (prueba: any) => {
    const fechaTarget = prueba.competencia?.fecha || prueba.fecha;
    if (!fechaTarget) return "S/D";
    return new Date(fechaTarget).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit',
      timeZone: 'UTC'
    });
  };

  // 1. Obtener perfil del nadador
  const { data: perfil } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => (await api.get("/nadadores/perfil")).data,
    enabled: !!user,
  });

  // 2. Obtener marcas indexadas por filtros
  const { data: ranking = [], isLoading, isFetching } = useQuery({
    queryKey: ["miRanking", perfil?._id, filtros],
    queryFn: async () => {
      const res = await api.get(`/pruebas/ranking/${perfil._id}`, { params: filtros });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!perfil?._id,
    staleTime: 1000 * 60 * 5,
  });

  // Métricas analíticas optimizadas
  const stats = useMemo(() => {
    if (!ranking || ranking.length === 0) return { mejor: "00:00", peor: "00:00", diferencia: "0.00" };

    const segundos = ranking.map((p: any) => tiempoASegundos(p.tiempo));
    const minSeg = Math.min(...segundos);
    const maxSeg = Math.max(...segundos);

    const mejorStr = ranking.find((p: any) => tiempoASegundos(p.tiempo) === minSeg)?.tiempo || "00:00";
    const peorStr = ranking.find((p: any) => tiempoASegundos(p.tiempo) === maxSeg)?.tiempo || "00:00";

    return {
      mejor: mejorStr,
      peor: peorStr,
      diferencia: (maxSeg - minSeg).toFixed(2)
    };
  }, [ranking]);

  // Transformación de datos para el gráfico de barras nativo
  const datosGrafica = useMemo(() => {
    if (!ranking || ranking.length === 0) return [];
    const procesados = [...ranking]
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .map((p: any) => ({
        segundos: tiempoASegundos(p.tiempo),
        tiempoOriginal: p.tiempo,
        esPB: p.esRecordPersonal
      }));

    const maxSegundos = Math.max(...procesados.map(d => d.segundos), 1);
    const minSegundos = Math.min(...procesados.map(d => d.segundos), 0.1);

    // Invertimos la proporción visual: a menor tiempo, más alta la barra de rendimiento
    return procesados.map(d => ({
      ...d,
      alturaProporcional: maxSegundos === minSegundos 
        ? 100 
        : Math.max(25, 100 - (((d.segundos - minSegundos) / (maxSegundos - minSegundos)) * 70))
    }));
  }, [ranking]);

  // Datos de usuario para el Layout idénticos al Dashboard
  const userName = perfil?.user?.nombre || user?.nombre || 'Atleta';
  const userEmail = perfil?.user?.correo || user?.correo || '';
  const initials = [perfil?.user?.nombre?.charAt(0), perfil?.apellido?.charAt(0)]
    .filter(Boolean).join('').toUpperCase() || 'AT';

  if (isLoading) {
    return (
      <AppLayout role="nadador" title="Cargando..." userName={userName} userEmail={userEmail} initials={initials}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.blue600} />
          <Text style={styles.loadingText}>COMPILANDO MARCAS TRACE...</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      role="nadador"
      title="Mis Marcas"
      subtitle="Progresión de Tiempos"
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
              <Text style={styles.panelSubtitle}>MÉTRICAS OFICIALES</Text>
            </View>
            <Text style={styles.mainTitle}>
              MIS <Text style={{ color: theme.colors.blue600 }}>MARCAS</Text>
            </Text>
          </View>
        </View>

        {/* PANEL DE CONTROL: FILTROS MÓVILES AVANZADOS */}
        <View style={styles.filterCard}>
          <View style={styles.glowOverlay} />
          
          {/* Fila 1: Estilo */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}><Waves size={10} color="#3b82f6" /> ESTILO</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
              {["Libre", "Espalda", "Pecho", "Mariposa", "Comb."].map((est) => (
                <TouchableOpacity 
                  key={est} 
                  style={[styles.pill, filtros.estilo === est && styles.pillActive]}
                  onPress={() => handleUpdateFiltro("estilo", est)}
                >
                  <Text style={[styles.pillText, filtros.estilo === est && styles.pillTextActive]}>{est.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Fila 2: Distancia */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}><Filter size={10} color="#10b981" /> METRAJE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
              {[25, 50, 100, 200, 400, 800, 1500].map((dist) => (
                <TouchableOpacity 
                  key={dist} 
                  style={[styles.pill, filtros.distancia === dist && styles.pillActive]}
                  onPress={() => handleUpdateFiltro("distancia", dist)}
                >
                  <Text style={[styles.pillText, filtros.distancia === dist && styles.pillTextActive]}>{dist}M</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Fila 3: Vaso / Piscina y Orden */}
          <View style={styles.multiFilterRow}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.filterLabel}><Filter size={10} color="#3b82f6" /> PISCINA</Text>
              <View style={styles.toggleRow}>
                {[{ l: "25M", v: 25 }, { l: "50M", v: 50 }].map(p => (
                  <TouchableOpacity 
                    key={p.v}
                    style={[styles.toggleBtn, filtros.piscina === p.v && styles.toggleBtnActive]}
                    onPress={() => handleUpdateFiltro("piscina", p.v)}
                  >
                    <Text style={[styles.toggleBtnText, filtros.piscina === p.v && styles.toggleBtnTextActive]}>{p.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.filterLabel}><Timer size={10} color="#f97316" /> ORDEN</Text>
              <TouchableOpacity 
                style={styles.orderSelector}
                onPress={() => handleUpdateFiltro("orden", filtros.orden === "fecha_desc" ? "tiempo_asc" : "fecha_desc")}
              >
                <Text style={styles.orderSelectorText}>
                  {filtros.orden === "fecha_desc" ? "RECIE. (FECHA ↓)" : "PB. (CRONO ↑)"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* GRÁFICO DE RENDIMIENTO NATIVO */}
        {ranking?.length > 1 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <View style={styles.chartHeaderRow}>
                  <TrendingDown size={14} color="#10b981" />
                  <Text style={styles.chartSubTitle}>LIVE PROGRESSION</Text>
                </View>
                <Text style={styles.chartMainTitle}>CURVA DE <Text style={{ color: '#3b82f6' }}>RENDIMIENTO</Text></Text>
              </View>
            </View>

            {/* Widgets Analíticos Rápidos */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>MEJOR TIEMPO</Text>
                <Text style={styles.statValue}>{stats.mejor}s</Text>
              </View>
              <View style={[styles.statBox, { borderLeftColor: '#f97316', borderLeftWidth: 3 }]}>
                <Text style={styles.statLabel}>PEOR TIEMPO</Text>
                <Text style={[styles.statValue, { color: '#cbd5e1' }]}>{stats.peor}s</Text>
                <Text style={styles.statDiff}>+{stats.diferencia}s diff</Text>
              </View>
            </View>

            {/* Canvas del Gráfico Táctil */}
            <View style={styles.chartCanvas}>
              {datosGrafica.map((item, idx) => (
                <View key={idx} style={styles.chartBarWrapper}>
                  <View style={styles.chartBarContainer}>
                    <View 
                      style={[
                        styles.chartBar, 
                        { height: `${item.alturaProporcional}%` },
                        item.esPB && styles.chartBarPB
                      ]} 
                    />
                  </View>
                  <Text style={styles.chartBarText} numberOfLines={1}>{item.tiempoOriginal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* LISTA DE REGISTROS CRONOMETRADOS */}
        <View style={[styles.listContainer, isFetching && !isLoading && { opacity: 0.5 }]}>
          {ranking.length === 0 ? (
            <View style={styles.emptyCard}>
              <Waves size={36} color={theme.colors.slate300} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>ESPERANDO REGISTROS OFICIALES</Text>
            </View>
          ) : (
            ranking.map((prueba: any, index: number) => (
              <View key={prueba._id} style={[styles.resultCard, prueba.esRecordPersonal && styles.resultCardPB]}>
                <View style={styles.resultLeft}>
                  {prueba.esRecordPersonal ? (
                    <View style={styles.pbBadgeIcon}>
                      <Trophy size={16} color="white" />
                    </View>
                  ) : (
                    <Text style={styles.rankIndex}>#{String(index + 1).padStart(2, '0')}</Text>
                  )}
                  
                  <View style={{ gap: 2 }}>
                    <Text style={styles.compName} numberOfLines={1}>
                      {prueba.competencia?.nombre || "Control Técnico"}
                    </Text>
                    <Text style={styles.compMeta}>
                      {filtros.estilo.toUpperCase()} • {filtros.distancia}M ({filtros.piscina}M)
                    </Text>
                  </View>
                </View>

                <View style={styles.resultRight}>
                  <Text style={[styles.chronoText, prueba.esRecordPersonal && styles.chronoTextPB]}>
                    {prueba.tiempo}
                  </Text>
                  <View style={styles.dateBadge}>
                    <Calendar size={10} color={theme.colors.slate400} />
                    <Text style={styles.dateText}>{formatFecha(prueba)}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </AppLayout>
  );
}

// ==========================================
// DISEÑO DE ESTILOS DE ALTA PERFORMANCE
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 80 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', paddingVertical: 60, gap: 16 },
  loadingText: { fontSize: 11, fontWeight: '900', color: theme.colors.slate400, letterSpacing: 3 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 20 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  badgeBrand: { backgroundColor: theme.colors.blue600, color: 'white', fontSize: 10, fontWeight: '900', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  panelSubtitle: { color: theme.colors.blue600, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  mainTitle: { fontSize: 36, fontWeight: '900', fontStyle: 'italic', color: theme.colors.slate900 },

  // Control Panel (Filtros)
  filterCard: { backgroundColor: '#0f172a', borderRadius: 28, padding: 20, gap: 16, marginBottom: 20, position: 'relative', overflow: 'hidden' },
  glowOverlay: { position: 'absolute', top: -40, right: -40, width: 120, height: 120, backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: 60 },
  filterGroup: { gap: 8 },
  filterLabel: { fontSize: 9, fontWeight: '900', color: '#64748b', letterSpacing: 1.5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillContainer: { gap: 8, paddingRight: 12 },
  pill: { backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderColor: '#334155' },
  pillActive: { backgroundColor: '#10b981', borderColor: 'transparent' },
  pillText: { color: '#94a3b8', fontSize: 11, fontWeight: '900' },
  pillTextActive: { color: 'white' },
  
  multiFilterRow: { flexDirection: 'row', gap: 16 },
  toggleRow: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 12, padding: 4, flex: 1 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  toggleBtnActive: { backgroundColor: theme.colors.blue600 },
  toggleBtnText: { color: '#94a3b8', fontSize: 11, fontWeight: '900' },
  toggleBtnTextActive: { color: 'white' },
  
  orderSelector: { backgroundColor: theme.colors.blue600, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  orderSelectorText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  // Chart Container
  chartCard: { backgroundColor: '#0f172a', borderRadius: 28, padding: 20, marginBottom: 20 },
  chartHeader: { marginBottom: 16 },
  chartHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  chartSubTitle: { color: '#10b981', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  chartMainTitle: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', color: 'white' },
  
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statLabel: { fontSize: 9, fontWeight: '900', color: '#3b82f6', letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '900', fontStyle: 'italic', color: 'white' },
  statDiff: { fontSize: 9, fontWeight: '700', color: '#f97316', marginTop: 2 },

  // Custom Flexbox Chart Bars
  chartCanvas: { height: 160, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  chartBarWrapper: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  chartBarContainer: { width: 8, height: '80%', justifyContent: 'flex-end', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 4, overflow: 'hidden' },
  chartBar: { width: '100%', backgroundColor: '#3b82f6', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartBarPB: { backgroundColor: '#10b981' },
  chartBarText: { color: '#64748b', fontSize: 8, fontWeight: '900', marginTop: 6, width: '100%', textAlign: 'center' },

  // List Results
  listContainer: { gap: 10 },
  resultCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  resultCardPB: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  pbBadgeIcon: { width: 36, height: 36, backgroundColor: '#10b981', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rankIndex: { fontSize: 16, fontWeight: '900', fontStyle: 'italic', color: '#cbd5e1', width: 36, textAlign: 'center' },
  compName: { fontSize: 15, fontWeight: '900', color: theme.colors.slate900, fontStyle: 'italic', textTransform: 'uppercase' },
  compMeta: { fontSize: 10, fontWeight: '700', color: theme.colors.slate400, marginTop: 1 },
  resultRight: { alignItems: 'flex-end', gap: 4 },
  chronoText: { fontSize: 24, fontWeight: '900', fontStyle: 'italic', color: theme.colors.slate900},
  chronoTextPB: { color: '#16a34a' },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f8fafc', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  dateText: { fontSize: 9, fontWeight: '900', color: '#64748b' },

  // Empty State
  emptyCard: { backgroundColor: 'white', borderRadius: 24, paddingVertical: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  emptyText: { fontSize: 11, fontWeight: '900', color: theme.colors.slate300, letterSpacing: 2 }
});