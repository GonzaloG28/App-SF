// ═══════════════════════════════════════════════════
// (profesor)/index.tsx — DashboardProfesor
// Replica exacta del diseño web DashboardProfesor.jsx
// ═══════════════════════════════════════════════════
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/shared/AppLayout';
import api from '../../services/api';
import { theme } from '../../constants/theme';
import {
  Users, Trophy, Calendar, UserPlus,
  CheckCircle, Clock, ChevronRight,
  Waves, MapPin, Dumbbell, GraduationCap
} from 'lucide-react-native';

// ══════════════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════════════
type ColorKey = 'blue' | 'green' | 'orange' | 'red' | 'purple';

// ══════════════════════════════════════════════════
// SUB-COMPONENTE: STAT CARD
// ══════════════════════════════════════════════════
const colorMap: Record<ColorKey, { bg: string; border: string; text: string }> = {
  blue:   { bg: '#eff6ff', border: '#dbeafe', text: '#2563eb' },
  green:  { bg: '#ecfdf5', border: '#d1fae5', text: '#059669' },
  orange: { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' },
  red:    { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  purple: { bg: '#f5f3ff', border: '#ede9fe', text: '#7c3aed' },
};

const StatCard = ({
  label, value, sub, icon: Icon, color, onPress,
}: {
  label: string; value: string | number; sub?: string;
  icon: any; color: ColorKey; onPress?: () => void;
}) => {
  const c = colorMap[color];
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.82}>
      <View style={[styles.statIconBox, { backgroundColor: c.bg, borderColor: c.border }]}>
        <Icon size={18} color={c.text} strokeWidth={2.5} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={styles.statSub} numberOfLines={1}>{sub}</Text> : null}
    </TouchableOpacity>
  );
};

// ══════════════════════════════════════════════════
// SUB-COMPONENTE: DIST ROW
// ══════════════════════════════════════════════════
const DistRow = ({ label, value, total, icon: Icon }: {
  label: string; value: number; total: number; icon: any;
}) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <View style={styles.distRow}>
      <Icon size={13} color="rgba(255,255,255,0.6)" />
      <View style={{ flex: 1 }}>
        <View style={styles.distRowTop}>
          <Text style={styles.distRowLabel}>{label}</Text>
          <Text style={styles.distRowLabel}>{value}</Text>
        </View>
        <View style={styles.distBarBg}>
          <View style={[styles.distBarFill, { width: `${pct}%` as any }]} />
        </View>
      </View>
    </View>
  );
};

// ══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════
export default function DashboardProfesor() {
  const { user } = useAuth();
  const router   = useRouter();

  // ── Queries ────────────────────────────────────
  const { data: nadadoresRes, isLoading: loadingNad } = useQuery({
    queryKey: ['nadadores-dashboard'],
    queryFn: () => api.get('/nadadores').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const { data: convocatorias = [], isLoading: loadingConv } = useQuery({
    queryKey: ['convocatorias'],
    queryFn: () => api.get('/convocatorias').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const { data: entrenamientos = [], isLoading: loadingEnt } = useQuery({
    queryKey: ['entrenamientos-dashboard'],
    queryFn: () => api.get('/entrenamiento/reporte-profesor').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = loadingNad || loadingConv || loadingEnt;

  // ── Cálculos ───────────────────────────────────
  const nadadores: any[] = useMemo(
    () => nadadoresRes?.data || nadadoresRes || [],
    [nadadoresRes]
  );

  const stats = useMemo(() => {
    const total        = nadadores.length;
    const competitivos = nadadores.filter((n: any) => n.rama !== 'formativo').length;
    const formativos   = nadadores.filter((n: any) => n.rama === 'formativo').length;
    const pagados      = nadadores.filter((n: any) => n.pagoAlDia).length;
    const pctPago      = total > 0 ? Math.round((pagados / total) * 100) : 0;
    return { total, competitivos, formativos, pagados, pctPago };
  }, [nadadores]);

  const entStats = useMemo(() => {
    const hoy       = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const delMes    = (entrenamientos as any[]).filter(e => new Date(e.fecha) >= inicioMes);
    const completados = delMes.filter(e => {
      const t = e.totalAlumnos || 0;
      return t > 0 && (e.completados || 0) === t;
    }).length;
    const total = delMes.length;
    const pct   = total > 0 ? Math.round((completados / total) * 100) : 0;
    return { total, completados, pendientes: total - completados, pct };
  }, [entrenamientos]);

  const proximasConvocatorias = useMemo(() =>
    [...(convocatorias as any[])]
      .filter(c => new Date(c.fechaFin) >= new Date())
      .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
      .slice(0, 3),
    [convocatorias]
  );

  const ultimoEntrenamiento = useMemo(() =>
    [...(entrenamientos as any[])]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null,
    [entrenamientos]
  );

  // ── Layout data ────────────────────────────────
  const userName  = (user as any)?.nombre || 'Profesor';
  const userEmail = (user as any)?.correo || '';
  const initials  = (user as any)?.nombre?.charAt(0)?.toUpperCase() || 'P';

  // ── Loading ────────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout role="profesor" title="Dashboard" userName={userName} userEmail={userEmail} initials={initials}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.blue600} />
          <Text style={styles.loadingText}>SINCRONIZANDO SISTEMA ÑSF...</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      role="profesor"
      title="Panel de Gestión"
      subtitle="Panel principal Profesor"
      userName={userName}
      userEmail={userEmail}
      initials={initials}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSub}>PANEL PRINCIPAL PROFESOR</Text>
            <Text style={styles.headerTitle}>
              PANEL DE <Text style={styles.headerAccent}>GESTIÓN</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push('/(profesor)/nadadores/nuevo')}
            activeOpacity={0.85}
          >
            <UserPlus size={17} color="white" strokeWidth={2.5} />
            <Text style={styles.newBtnText}>{'NUEVO\nNADADOR'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── STATS 2×2 ── */}
        <View style={styles.statsGrid}>
          <StatCard
            label="TOTAL PLANTEL"
            value={stats.total}
            sub={`${stats.competitivos} comp. · ${stats.formativos} form.`}
            icon={Users}
            color="blue"
            onPress={() => router.push('/(profesor)/nadadores')}
          />
          <StatCard
            label="CUENTAS AL DÍA"
            value={`${stats.pctPago}%`}
            sub={`${stats.pagados} de ${stats.total} nadadores`}
            icon={CheckCircle}
            color={stats.pctPago >= 80 ? 'green' : stats.pctPago >= 50 ? 'orange' : 'red'}
            onPress={() => router.push('/(profesor)/nadadores')}
          />
          <StatCard
            label="CONVOCATORIAS"
            value={proximasConvocatorias.length}
            sub={proximasConvocatorias.length > 0 ? 'eventos próximos' : 'sin eventos'}
            icon={Calendar}
            color="purple"
            onPress={() => router.push('/(profesor)/calendario')}
          />
          <StatCard
            label="ENTRENOS DEL MES"
            value={entStats.total}
            sub={`${entStats.completados} comp. · ${entStats.pendientes} pend.`}
            icon={Dumbbell}
            color="orange"
            onPress={() => router.push('/(profesor)/entrenamientos')}
          />
        </View>

        {/* ── PRÓXIMAS CONVOCATORIAS ── */}
        <View style={styles.card}>
          {/* Cabecera */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Calendar size={15} color={theme.colors.blue600} />
              <Text style={styles.cardHeaderTitle}>PRÓXIMAS CONVOCATORIAS</Text>
            </View>
            <TouchableOpacity
              style={styles.verTodasBtn}
              onPress={() => router.push('/(profesor)/calendario')}
            >
              <Text style={styles.verTodasText}>VER TODAS</Text>
            </TouchableOpacity>
          </View>

          {proximasConvocatorias.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Calendar size={28} color="#e2e8f0" />
              <Text style={styles.emptyText}>SIN CONVOCATORIAS PRÓXIMAS</Text>
              <TouchableOpacity onPress={() => router.push('/(profesor)/convocatoria/nueva')}>
                <Text style={styles.emptyAction}>+ CREAR CONVOCATORIA</Text>
              </TouchableOpacity>
            </View>
          ) : (
            proximasConvocatorias.map((c: any) => {
              const inicio    = new Date(c.fechaInicio);
              const fin       = new Date(c.fechaFin);
              const dias      = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              const hoy       = new Date();
              const enCurso   = inicio <= hoy && fin >= hoy;
              const diasHasta = Math.ceil((inicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <TouchableOpacity
                  key={c._id}
                  style={styles.convRow}
                  onPress={() => router.push(`/(profesor)/convocatoria/${c._id}`)}
                  activeOpacity={0.8}
                >
                  {/* Bloque de fecha */}
                  <View style={[
                    styles.convDateBlock,
                    enCurso ? styles.convDateActive : styles.convDateDefault,
                  ]}>
                    <Text style={[styles.convMonth, enCurso && { color: 'white' }]}>
                      {inicio.toLocaleString('es-ES', { month: 'short' }).toUpperCase()}
                    </Text>
                    <Text style={[styles.convDay, enCurso && { color: 'white' }]}>
                      {inicio.getDate()}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={styles.convInfo}>
                    <View style={styles.convNameRow}>
                      <Text style={styles.convName} numberOfLines={1}>{c.nombre}</Text>
                      {enCurso && (
                        <View style={styles.enCursoBadge}>
                          <Text style={styles.enCursoText}>EN CURSO</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.convMeta}>
                      <View style={styles.convMetaItem}>
                        <MapPin size={10} color="#94a3b8" />
                        <Text style={styles.convMetaText} numberOfLines={1}>{c.lugar}</Text>
                      </View>
                      <View style={styles.convMetaItem}>
                        <Clock size={10} color="#94a3b8" />
                        <Text style={styles.convMetaText}>{dias} {dias === 1 ? 'día' : 'días'}</Text>
                      </View>
                      <View style={styles.convMetaItem}>
                        <Users size={10} color="#94a3b8" />
                        <Text style={styles.convMetaText}>{c.nadadores?.length || 0}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Días restantes */}
                  {!enCurso && diasHasta > 0 && (
                    <View style={styles.countdown}>
                      <Text style={styles.countdownNum}>{diasHasta}</Text>
                      <Text style={styles.countdownLabel}>días</Text>
                    </View>
                  )}
                  <ChevronRight size={14} color="#e2e8f0" />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── ÚLTIMO ENTRENAMIENTO ── */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(profesor)/entrenamientos')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Dumbbell size={15} color="#22c55e" strokeWidth={2.5} />
              <Text style={styles.cardHeaderTitle}>ÚLTIMO ENTRENAMIENTO</Text>
            </View>
            <View style={styles.chevronBox}>
              <ChevronRight size={16} color="#94a3b8" strokeWidth={3} />
            </View>
          </View>

          {ultimoEntrenamiento ? (() => {
            const listaAtletas = ultimoEntrenamiento.estadisticas?.total || 0;
            const completados  = ultimoEntrenamiento.estadisticas?.completados || 0;
            const pct = listaAtletas > 0 ? Math.round((completados / listaAtletas) * 100) : 0;
            const fecha = new Date(ultimoEntrenamiento.fecha || ultimoEntrenamiento.createdAt);
            const barColor = pct === 100 ? '#10b981' : pct >= 50 ? '#f97316' : theme.colors.blue600;

            return (
              <View style={styles.entBody}>
                <Text style={styles.entTitle} numberOfLines={1}>
                  {ultimoEntrenamiento.titulo || 'Sesión General'}
                </Text>

                <View style={styles.entBadges}>
                  <View style={styles.entDateBadge}>
                    <Calendar size={13} color={theme.colors.blue600} />
                    <Text style={styles.entDateText}>
                      {fecha.toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.entAtletasBadge}>
                    <Users size={13} color="#64748b" />
                    <Text style={styles.entAtletasText}>{listaAtletas} ATLETAS</Text>
                  </View>
                </View>

                <View style={styles.progressBlock}>
                  <View style={styles.progressTopRow}>
                    <Text style={styles.progressLabel}>{completados} COMPLETADOS</Text>
                    <Text style={[styles.progressPct, { color: barColor }]}>{pct}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, {
                      width: `${pct}%` as any,
                      backgroundColor: barColor,
                    }]} />
                  </View>
                  <Text style={styles.progressSub}>
                    {pct === 100 ? '✓ COMPLETADO AL 100%' : `${listaAtletas - completados} PENDIENTES`}
                  </Text>
                </View>
              </View>
            );
          })() : (
            <View style={styles.emptyBlock}>
              <Waves size={36} color="#e2e8f0" />
              <Text style={styles.emptyText}>SIN ENTRENAMIENTOS REGISTRADOS</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── ESTADO DE CUENTAS ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <CheckCircle size={15} color="#10b981" strokeWidth={2.5} />
              <Text style={styles.cardHeaderTitle}>ESTADO DE CUENTAS</Text>
            </View>
          </View>

          <View style={styles.pagosBody}>
            <View style={styles.pagosBarLabels}>
              <Text style={styles.pagosBarLabel}>{stats.pagados} AL DÍA</Text>
              <Text style={styles.pagosBarLabel}>{stats.total - stats.pagados} PENDIENTES</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, {
                width: `${stats.pctPago}%` as any,
                backgroundColor: stats.pctPago >= 80 ? '#10b981' : stats.pctPago >= 50 ? '#f97316' : '#ef4444',
              }]} />
            </View>

            <View style={styles.pagosCards}>
              <View style={styles.pagosGreen}>
                <Text style={styles.pagosGreenNum}>{stats.pagados}</Text>
                <Text style={styles.pagosGreenLabel}>AL DÍA</Text>
              </View>
              <View style={styles.pagosOrange}>
                <Text style={styles.pagosOrangeNum}>{stats.total - stats.pagados}</Text>
                <Text style={styles.pagosOrangeLabel}>PENDIENTES</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.verPlantelBtn}
              onPress={() => router.push('/(profesor)/nadadores')}
            >
              <Text style={styles.verPlantelText}>VER PLANTEL COMPLETO</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── DISTRIBUCIÓN DEL PLANTEL (gradiente azul→verde) ── */}
        <View style={styles.distCard}>
          <View style={styles.distBgDecor}>
            <Waves size={120} color="white" opacity={0.08} />
          </View>
          <View style={{ position: 'relative', zIndex: 1 }}>
            <Text style={styles.distTitle}>DISTRIBUCIÓN PLANTEL</Text>
            <View style={{ gap: 10, marginBottom: 20 }}>
              <DistRow label="Competitivos" value={stats.competitivos} total={stats.total} icon={Trophy} />
              <DistRow label="Formativos"   value={stats.formativos}   total={stats.total} icon={GraduationCap} />
            </View>
            <View style={styles.distFooter}>
              <Text style={styles.distFooterLabel}>TOTAL</Text>
              <Text style={styles.distFooterValue}>{stats.total}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════
// ESTILOS
// ══════════════════════════════════════════════════
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, paddingVertical: 80 },
  loadingText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 3 },

  // HEADER
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  headerLeft: { flex: 1 },
  headerSub: { color: theme.colors.blue600, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0f172a', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.5 },
  headerAccent: { color: theme.colors.blue600 },
  newBtn: {
    backgroundColor: theme.colors.blue600, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  newBtnText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1, lineHeight: 14 },

  // STATS
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47.5%', backgroundColor: 'white', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  statIconBox: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, marginBottom: 12,
  },
  statLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  statValue: { fontSize: 26, fontWeight: '900', color: '#0f172a', fontStyle: 'italic', letterSpacing: -0.5, lineHeight: 30 },
  statSub: { fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

  // CARD GENÉRICA
  card: {
    backgroundColor: 'white', borderRadius: 24,
    borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardHeaderTitle: { fontSize: 10, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 1 },
  verTodasBtn: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  verTodasText: { fontSize: 8, fontWeight: '900', color: theme.colors.blue600, letterSpacing: 1 },
  chevronBox: { width: 32, height: 32, backgroundColor: '#f8fafc', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // EMPTY
  emptyBlock: { alignItems: 'center', paddingVertical: 36, gap: 10 },
  emptyText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' },
  emptyAction: { color: theme.colors.blue600, fontSize: 11, fontWeight: '900', letterSpacing: 1 },

  // CONVOCATORIAS
  convRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  convDateBlock: { width: 44, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  convDateActive: { backgroundColor: '#22c55e' },
  convDateDefault: { backgroundColor: '#eff6ff' },
  convMonth: { fontSize: 9, fontWeight: '900', color: '#1d4ed8', textTransform: 'uppercase' },
  convDay: { fontSize: 20, fontWeight: '900', color: '#1e293b', lineHeight: 24 },
  convInfo: { flex: 1 },
  convNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  convName: { fontSize: 13, fontWeight: '900', color: '#0f172a', fontStyle: 'italic', textTransform: 'uppercase', flex: 1 },
  enCursoBadge: { backgroundColor: '#22c55e', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  enCursoText: { color: 'white', fontSize: 8, fontWeight: '900' },
  convMeta: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  convMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  convMetaText: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
  countdown: { alignItems: 'center', minWidth: 32 },
  countdownNum: { fontSize: 20, fontWeight: '900', color: theme.colors.blue600, fontStyle: 'italic', lineHeight: 24 },
  countdownLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8' },

  // ENTRENAMIENTO
  entBody: { padding: 20, gap: 14 },
  entTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.5 },
  entBadges: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  entDateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: '#bfdbfe',
  },
  entDateText: { fontSize: 10, fontWeight: '900', color: '#1e40af', letterSpacing: 1, fontStyle: 'italic' },
  entAtletasBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9',
  },
  entAtletasText: { fontSize: 10, fontWeight: '900', color: '#475569', letterSpacing: 1 },

  // BARRA PROGRESO (reutilizada en varios bloques)
  progressBlock: { gap: 6 },
  progressTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  progressPct: { fontSize: 16, fontWeight: '900', fontStyle: 'italic' },
  progressBarBg: { height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressSub: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },

  // ESTADO DE CUENTAS
  pagosBody: { padding: 20, gap: 12 },
  pagosBarLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  pagosBarLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  pagosCards: { flexDirection: 'row', gap: 10 },
  pagosGreen: { flex: 1, backgroundColor: '#f0fdf4', borderRadius: 20, padding: 14, alignItems: 'center' },
  pagosGreenNum: { fontSize: 24, fontWeight: '900', color: '#15803d', fontStyle: 'italic' },
  pagosGreenLabel: { fontSize: 10, fontWeight: '900', color: '#16a34a', textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 },
  pagosOrange: { flex: 1, backgroundColor: '#fff7ed', borderRadius: 20, padding: 14, alignItems: 'center' },
  pagosOrangeNum: { fontSize: 24, fontWeight: '900', color: '#c2410c', fontStyle: 'italic' },
  pagosOrangeLabel: { fontSize: 10, fontWeight: '900', color: '#ea580c', textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 },
  verPlantelBtn: { backgroundColor: '#f8fafc', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  verPlantelText: { fontSize: 10, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 2 },

  // DISTRIBUCIÓN (azul)
  distCard: {
    borderRadius: 24, padding: 24, overflow: 'hidden',
    backgroundColor: theme.colors.blue600,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  distBgDecor: { position: 'absolute', bottom: -20, right: -20, opacity: 0.08 },
  distTitle: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  distRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  distRowLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.85)' },
  distBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  distBarFill: { height: '100%', backgroundColor: 'white', borderRadius: 3 },
  distFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
  },
  distFooterLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2 },
  distFooterValue: { fontSize: 24, fontWeight: '900', color: 'white', fontStyle: 'italic' },
});
