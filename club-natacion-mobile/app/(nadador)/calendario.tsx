// ═══════════════════════════════════════════════════
// CalendarioNadador.tsx — versión React Native
// Replica del diseño web CalendarioNadador.jsx
// ═══════════════════════════════════════════════════
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/shared/AppLayout';
import api from '../../services/api';
import { theme } from '../../constants/theme';
import {
  ChevronLeft, ChevronRight, MapPin,
  Clock, Waves, ArrowBigRight,
  AlignCenter
} from 'lucide-react-native';

// ── CONSTANTES ────────────────────────────────────
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];
const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

// ── COMPONENTE PRINCIPAL ──────────────────────────
export default function CalendarioNadador() {
  const { user } = useAuth();
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [añoActual, setAñoActual] = useState(hoy.getFullYear());

  const { data: perfil } = useQuery({
    queryKey: ['miPerfil'],
    queryFn: async () => (await api.get('/nadadores/perfil')).data,
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const { data: convocatorias = [], isLoading } = useQuery({
    queryKey: ['misConvocatorias'],
    queryFn: () => api.get('/convocatorias/mis-convocatorias').then(r => r.data),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Navegación de mes — no retroceder al pasado
  const irMesAnterior = () => {
    const nuevaFecha = new Date(añoActual, mesActual - 1, 1);
    const hoyInicio  = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    if (nuevaFecha < hoyInicio) return;
    if (mesActual === 0) { setMesActual(11); setAñoActual(a => a - 1); }
    else setMesActual(m => m - 1);
  };

  const irMesSiguiente = () => {
    if (mesActual === 11) { setMesActual(0); setAñoActual(a => a + 1); }
    else setMesActual(m => m + 1);
  };

  const esMesActual = mesActual === hoy.getMonth() && añoActual === hoy.getFullYear();

  // Días del mes con espacios vacíos iniciales
  const diasDelMes = useMemo(() => {
    const primer  = new Date(añoActual, mesActual, 1);
    const ultimo  = new Date(añoActual, mesActual + 1, 0);
    const diasVac = primer.getDay();
    const dias: (number | null)[] = [];
    for (let i = 0; i < diasVac; i++) dias.push(null);
    for (let d = 1; d <= ultimo.getDate(); d++) dias.push(d);
    return dias;
  }, [mesActual, añoActual]);

  // Convocatorias que caen en el mes mostrado
  const convocatoriasMes = useMemo(() =>
    (convocatorias as any[]).filter(c => {
      const inicio    = new Date(c.fechaInicio);
      const fin       = new Date(c.fechaFin);
      const mesMostr  = new Date(añoActual, mesActual, 1);
      const finMes    = new Date(añoActual, mesActual + 1, 0);
      return inicio <= finMes && fin >= mesMostr;
    }),
    [convocatorias, mesActual, añoActual]
  );

  // Qué días tienen evento
  const diasConEvento = useMemo(() => {
    const set = new Set<number>();
    convocatoriasMes.forEach((c: any) => {
      const inicio = new Date(c.fechaInicio);
      const fin    = new Date(c.fechaFin);
      const cur    = new Date(inicio);
      while (cur <= fin) {
        if (cur.getMonth() === mesActual && cur.getFullYear() === añoActual) {
          set.add(cur.getDate());
        }
        cur.setDate(cur.getDate() + 1);
      }
    });
    return set;
  }, [convocatoriasMes, mesActual, añoActual]);

  const userName = perfil?.user?.nombre || user?.nombre || 'Atleta';
  const userEmail = perfil?.user?.correo  || user?.correo  || '';
  const initials  = [perfil?.user?.nombre?.charAt(0), perfil?.apellido?.charAt(0)]
    .filter(Boolean).join('').toUpperCase() || 'AT';

  if (isLoading) {
    return (
      <AppLayout role="nadador" title="Calendario" userName={userName} userEmail={userEmail} initials={initials}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.blue600} />
          <Text style={styles.loadingText}>SINCRONIZANDO EVENTOS...</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      role="nadador"
      title="Calendario"
      subtitle="Próximas Competencias"
      userName={userName}
      userEmail={userEmail}
      initials={initials}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeBrand}>ÑSF</Text>
            <Text style={styles.headerSubtitle}>PRÓXIMAS COMPETENCIAS</Text>
          </View>
          <Text style={styles.mainTitle}>
            CALENDARIO{' '}
            <Text style={styles.mainTitleAccent}>DE COMPETENCIAS</Text>
          </Text>
        </View>

        {/* ── CALENDARIO MENSUAL ── */}
        <View style={styles.calCard}>

          {/* Navegación de mes */}
          <View style={styles.calNavRow}>
            <TouchableOpacity
              onPress={irMesAnterior}
              disabled={esMesActual}
              style={[styles.navBtn, esMesActual && styles.navBtnDisabled]}
            >
              <ChevronLeft size={18} color={esMesActual ? '#cbd5e1' : '#64748b'} />
            </TouchableOpacity>

            <Text style={styles.calMonthTitle}>
              {MESES[mesActual].toUpperCase()} {añoActual}
            </Text>

            <TouchableOpacity onPress={irMesSiguiente} style={styles.navBtn}>
              <ChevronRight size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Encabezado de días */}
          <View style={styles.calDaysHeader}>
            {DIAS.map(d => (
              <Text key={d} style={styles.calDayLabel}>{d}</Text>
            ))}
          </View>

          {/* Grilla de días */}
          <View style={styles.calGrid}>
            {diasDelMes.map((dia, i) => {
              const esHoy      = dia === hoy.getDate() && esMesActual;
              const tieneEvt   = !!dia && diasConEvento.has(dia);
              const esPasado   = !!dia && new Date(añoActual, mesActual, dia) <
                new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

              return (
                <View
                  key={i}
                  style={[
                    styles.calCell,
                    esHoy      && styles.calCellHoy,
                    tieneEvt && !esHoy && styles.calCellEvento,
                  ]}
                >
                  {dia !== null && (
                    <>
                      <Text style={[
                        styles.calCellText,
                        esHoy    && styles.calCellTextHoy,
                        tieneEvt && !esHoy && styles.calCellTextEvento,
                        esPasado && !esHoy && styles.calCellTextPasado,
                      ]}>
                        {dia}
                      </Text>
                      {tieneEvt && (
                        <View style={[
                          styles.eventDot,
                          esHoy ? styles.eventDotHoy : styles.eventDotGreen,
                        ]} />
                      )}
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── LISTA DE CONVOCATORIAS DEL MES ── */}
        <Text style={styles.listLabel}>
          COMPETENCIAS EN {MESES[mesActual].toUpperCase()}
        </Text>

        {convocatoriasMes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Waves size={32} color="#e2e8f0" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>SIN CONVOCATORIAS ESTE MES</Text>
          </View>
        ) : (
          (convocatoriasMes as any[]).map((c: any) => (
            <ConvocatoriaCard key={c._id} convocatoria={c} />
          ))
        )}

      </ScrollView>
    </AppLayout>
  );
}

// ── SUB-COMPONENTE: TARJETA DE CONVOCATORIA ───────
const ConvocatoriaCard = ({ convocatoria }: { convocatoria: any }) => {
  const inicio  = new Date(convocatoria.fechaInicio);
  const fin     = new Date(convocatoria.fechaFin);
  const hoy     = new Date();
  const dias    = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const enCurso = inicio <= hoy && fin >= hoy;
  const proxima = inicio > hoy;
  const diasRestantes = Math.ceil((inicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <View style={[styles.convCard, enCurso && styles.convCardEnCurso]}>
      <View style={styles.convCardInner}>

        {/* Bloque de fecha */}
        <View style={[styles.convDateBlock, enCurso ? styles.convDateBlockActive : styles.convDateBlockDefault]}>
          <Text style={[styles.convMonth, enCurso && { color: 'white' }]}>
            {inicio.toLocaleString('es-ES', { month: 'short', timeZone: 'UTC' }).toUpperCase()}
          </Text>
          <Text style={[styles.convDay, enCurso && { color: 'white' }]}>
            {inicio.getUTCDate()}
          </Text>
        </View>

        {/* Información principal */}
        <View style={styles.convInfo}>
          <View style={styles.convNameRow}>
            <Text style={styles.convName} numberOfLines={1}>{convocatoria.nombre}</Text>
            {enCurso && (
              <View style={styles.enCursoBadge}>
                <Text style={styles.enCursoBadgeText}>En curso</Text>
              </View>
            )}
          </View>

          {convocatoria.descripcion && (
            <View style={styles.convDescRow}>
              <ArrowBigRight size={13} color="#475569" />
              <Text style={styles.convDesc} numberOfLines={2}>{convocatoria.descripcion}</Text>
            </View>
          )}

          <View style={styles.convMetaRow}>
            <View style={styles.convMetaItem}>
              <MapPin size={11} color="#94a3b8" />
              <Text style={styles.convMetaText}>{convocatoria.lugar}</Text>
            </View>
            <View style={styles.convMetaItem}>
              <Clock size={11} color="#94a3b8" />
              <Text style={styles.convMetaText}>{dias} {dias === 1 ? 'día' : 'días'}</Text>
            </View>
          </View>

          <Text style={styles.convFechaFin}>
            Hasta el {fin.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', timeZone: 'UTC' })}
          </Text>
        </View>

        {/* Días restantes */}
        {proxima && (
          <View style={styles.convCountdown}>
            <Text style={styles.convCountdownNum}>{diasRestantes}</Text>
            <Text style={styles.convCountdownLabel}>días</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ── ESTILOS ───────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 48 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, paddingVertical: 80 },
  loadingText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 3 },

  // Header
  header: { marginBottom: 20 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  badgeBrand: {
    backgroundColor: theme.colors.blue600, color: 'white',
    fontSize: 10, fontWeight: '900', paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 4, overflow: 'hidden',
    fontStyle: 'italic',
  },
  headerSubtitle: {
    color: theme.colors.blue600, fontSize: 10,
    fontWeight: '900', letterSpacing: 3,
  },
  mainTitle: {
    fontSize: 28, fontWeight: '900', color: '#0f172a',
    fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.5,
  },
  mainTitleAccent: { color: theme.colors.blue600 },

  // Calendario card
  calCard: {
    backgroundColor: 'white', borderRadius: 20,
    borderWidth: 1, borderColor: '#f1f5f9',
    overflow: 'hidden', marginBottom: 24,
  },
  calNavRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  navBtnDisabled: { opacity: 0.3 },
  calMonthTitle: {
    fontSize: 15, fontWeight: '900', color: '#0f172a',
    fontStyle: 'italic', letterSpacing: -0.3,
  },
  calDaysHeader: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8,
  },
  calDayLabel: {
    flex: 1, textAlign: 'center', fontSize: 10,
    fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase',
  },
  calGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 8, paddingBottom: 12,
  },
  calCell: {
    width: '14.285%', aspectRatio: 1, height: '100%',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
  },
  calCellHoy: { backgroundColor: theme.colors.blue600 },
  calCellEvento: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2, borderColor: '#bbf7d0',
  },
  calCellText: { fontSize: 13, fontWeight: '900', color: '#334155' },
  calCellTextHoy: { color: 'white' },
  calCellTextEvento: { color: '#15803d' },
  calCellTextPasado: { color: '#cbd5e1' },
  eventDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  eventDotHoy: { backgroundColor: 'white' },
  eventDotGreen: { backgroundColor: '#22c55e' },

  // Lista de convocatorias
  listLabel: {
    fontSize: 10, fontWeight: '900', color: '#94a3b8',
    letterSpacing: 2, marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: 'white', borderRadius: 20,
    borderWidth: 1, borderStyle: 'dashed', borderColor: '#e2e8f0',
    paddingVertical: 48, alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2 },

  // Tarjeta de convocatoria
  convCard: {
    backgroundColor: 'white', borderRadius: 20,
    borderWidth: 1, borderColor: '#f1f5f9',
    marginBottom: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  convCardEnCurso: { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' },
  convCardInner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },

  convDateBlock: {
    width: 46, paddingVertical: 8,
    alignItems: 'center', borderRadius: 12,
  },
  convDateBlockActive: { backgroundColor: '#22c55e' },
  convDateBlockDefault: { backgroundColor: '#eff6ff' },
  convMonth: { fontSize: 9, fontWeight: '900', color: '#1d4ed8' },
  convDay: { fontSize: 20, fontWeight: '900', color: '#1e293b', lineHeight: 24 },

  convInfo: { flex: 1 },
  convNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  convName: { fontSize: 14, fontWeight: '900', color: '#0f172a', fontStyle: 'italic', textTransform: 'uppercase' },

  enCursoBadge: { backgroundColor: '#22c55e', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  enCursoBadgeText: { color: 'white', fontSize: 9, fontWeight: '900' },

  convDescRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  convDesc: { fontSize: 12, fontWeight: '700', color: '#475569', fontStyle: 'italic', flex: 1 },

  convMetaRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  convMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  convMetaText: { fontSize: 11, fontWeight: '700', color: '#64748b' },

  convFechaFin: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginTop: 2 },

  convCountdown: { alignItems: 'center', justifyContent: 'center', minWidth: 40 },
  convCountdownNum: { fontSize: 22, fontWeight: '900', color: theme.colors.blue600, fontStyle: 'italic', lineHeight: 26 },
  convCountdownLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8' },
});
