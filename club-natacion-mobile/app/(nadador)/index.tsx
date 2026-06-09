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
  Activity, ChevronRight, Trophy, Ruler, Weight,
  ArrowUpRight, Calendar, Timer, History, Waves, Award, Flame
} from 'lucide-react-native';

export default function DashboardNadador() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: perfil, isLoading: loadPerfil } = useQuery({
    queryKey: ['miPerfil'],
    queryFn: async () => (await api.get('/nadadores/perfil')).data,
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const { data: convocatorias = [] } = useQuery({
    queryKey: ['misConvocatoriasPerfil'],
    queryFn: () => api.get('/convocatorias/mis-convocatorias').then(r => r.data),
    enabled: !!perfil,
    staleTime: 1000 * 60 * 5,
  });

  const { data: competencias = [], isLoading: loadComp } = useQuery({
    queryKey: ['misCompetenciasDashboard', perfil?._id],
    queryFn: async () => {
      const res = await api.get(`/competencias/${perfil._id}`);
      return Array.isArray(res.data) ? res.data : (res.data?.competencias || []);
    },
    enabled: !!perfil?._id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: entrenamientos = [], isLoading: loadEntreno } = useQuery({
    queryKey: ['misEntrenamientosDashboard'],
    queryFn: async () => {
      const res = await api.get('/entrenamiento/mis-entrenamientos');
      return Array.isArray(res.data) ? res.data : (res.data?.entrenamientos || []);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = 
  (loadPerfil && !perfil) || 
  (loadComp && competencias.length === 0) || 
  (loadEntreno && entrenamientos.length === 0);

  const userName = perfil?.user?.nombre || user?.nombre || 'Atleta';
  const userEmail = perfil?.user?.correo || user?.correo || '';
  const initials = [perfil?.user?.nombre?.charAt(0), perfil?.apellido?.charAt(0)]
    .filter(Boolean).join('').toUpperCase() || 'AT';

  const hoy = new Date();
  const proximasConv = convocatorias
    .filter((c: any) => new Date(c.fechaFin) >= hoy)
    .sort((a: any, b: any) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
    .slice(0, 1);

  const proximasComp = competencias.filter((c: any) => new Date(c.fecha) >= hoy);
  const pasadasComp = competencias
    .filter((c: any) => new Date(c.fecha) < hoy)
    .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const ultimoEntreno = entrenamientos[0];
  const mejorPrueba = perfil?.pruebasEspecialidad?.[0] || '100m Libre';

  if (isLoading) {
    return (
      <AppLayout role="nadador" title="Cargando..." userName={userName} userEmail={userEmail} initials={initials}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.blue600} />
          <Text style={styles.loadingText}>Sincronizando datos...</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      role="nadador"
      title={`Hola, ${userName.split(' ')[0]}`}
      subtitle="Centro de Atletas"
      userName={userName}
      userEmail={userEmail}
      initials={initials}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.heroTopText}>Panel del Atleta</Text>
          </View>
          <Text style={styles.heroName}>{perfil?.user?.nombre || userName}</Text>
          <Text style={styles.heroLastName}>{perfil?.apellido || ''}</Text>

          {/* Categoría */}
          <TouchableOpacity
            style={styles.categoryPill}
            onPress={() => router.push('/(nadador)/perfil')}
          >
            <View style={styles.categoryIcon}>
              <Activity size={18} color={theme.colors.blue500} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.categoryLabel}>Categoría</Text>
              <Text style={styles.categoryValue}>{perfil?.categoria || 'ÉLITE'}</Text>
            </View>
            <ChevronRight size={16} color={theme.colors.slate300} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* PRÓXIMO EVENTO */}
        <TouchableOpacity
          style={styles.eventCard}
          onPress={() => router.push('/(nadador)/calendario')}
        >
          <View style={styles.eventCardBg}>
            <Calendar size={120} color="white" opacity={0.08} style={styles.eventBgIcon} />
          </View>
          <View style={styles.eventCardContent}>
            <View style={styles.eventBadge}>
              <Timer size={12} color={theme.colors.green500} strokeWidth={3} />
              <Text style={styles.eventBadgeText}>Siguiente Competencia</Text>
            </View>

            {proximasConv.length > 0 ? (
              <>
                <Text style={styles.eventName} numberOfLines={2}>
                  {proximasConv[0].nombre}
                </Text>
                <View style={styles.eventStats}>
                  <View style={styles.eventStat}>
                    <Text style={styles.eventStatLabel}>Días restantes</Text>
                    {(() => {
                      const inicio = new Date(proximasConv[0].fechaInicio);
                      const fin = new Date(proximasConv[0].fechaFin);
                      if (hoy >= inicio && hoy <= fin) {
                        return <Text style={[styles.eventStatValue, { color: theme.colors.green500, fontSize: 18 }]}>En curso</Text>;
                      }
                      const dias = Math.ceil((inicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                      return <Text style={styles.eventStatValue}>{dias}</Text>;
                    })()}
                  </View>
                  <View style={styles.eventStat}>
                    <Text style={styles.eventStatLabel}>Lugar</Text>
                    <Text style={styles.eventStatValue} numberOfLines={1}>{proximasConv[0].lugar}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noEvent}>
                <Text style={styles.noEventTitle}>Temporada en Espera</Text>
                <Text style={styles.noEventSub}>Sin competencias programadas</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* ESPECIALIDAD & BIOMETRÍA */}
        <View style={styles.row}>
          {/* Especialidad */}
          <TouchableOpacity
            style={styles.specialtyCard}
            onPress={() => router.push('/(nadador)/tiempos')}
          >
            <Flame size={60} color="#EA580C" opacity={0.15} style={styles.flameBg} />
            <Text style={styles.specialtyLabel}>Especialidad principal</Text>
            <Text style={styles.specialtyValue}>{mejorPrueba}</Text>
            <View style={styles.specialtyLink}>
              <Text style={styles.specialtyLinkText}>Analizar Progreso</Text>
              <ArrowUpRight size={12} color={theme.colors.blue500} strokeWidth={3} />
            </View>
          </TouchableOpacity>

          {/* Bio */}
          <View style={styles.bioCol}>
            <TouchableOpacity
              style={styles.bioCard}
              onPress={() => router.push('/(nadador)/perfil')}
            >
              <Ruler size={20} color={theme.colors.blue500} strokeWidth={2.5} />
              <Text style={styles.bioLabel}>Estatura</Text>
              <Text style={styles.bioValue}>
                {perfil?.altura || '--'}
                <Text style={styles.bioUnit}> cm</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bioCard}
              onPress={() => router.push('/(nadador)/perfil')}
            >
              <Weight size={20} color={theme.colors.green500} strokeWidth={2.5} />
              <Text style={styles.bioLabel}>Masa</Text>
              <Text style={styles.bioValue}>
                {perfil?.peso || '--'}
                <Text style={styles.bioUnit}> kg</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ÚLTIMO ENTRENAMIENTO */}
        <TouchableOpacity
          style={styles.trainCard}
          onPress={() => router.push('/(nadador)/entrenamientos')}
        >
          <View style={styles.trainCardHeader}>
            <View style={styles.trainCardHeaderLeft}>
              <Activity size={14} color={theme.colors.green500} strokeWidth={3} />
              <Text style={styles.trainCardHeaderText}>Entrenamiento Reciente</Text>
            </View>
            <View style={styles.trainCardHeaderIcon}>
              <ArrowUpRight size={16} color={theme.colors.slate400} strokeWidth={3} />
            </View>
          </View>

          {ultimoEntreno ? (
            <>
              <Text style={styles.trainTitle} numberOfLines={1}>
                {ultimoEntreno.titulo || 'Sesión General'}
              </Text>
              <View style={styles.trainDate}>
                <Calendar size={13} color={theme.colors.blue600} />
                <Text style={styles.trainDateText}>
                  {new Date(ultimoEntreno.fecha).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.noData}>
              <Waves size={32} color={theme.colors.slate200} />
              <Text style={styles.noDataText}>Esperando datos de sesión</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ÚLTIMAS COMPETENCIAS */}
        <View style={styles.compCard}>
          <View style={styles.compCardHeader}>
            <View style={styles.compCardHeaderLeft}>
              <View style={styles.compCardIcon}>
                <History size={18} color={theme.colors.blue500} strokeWidth={2.5} />
              </View>
              <Text style={styles.compCardTitle}>Últimas Competencias</Text>
            </View>
          </View>

          {pasadasComp.length > 0 ? (
            pasadasComp.slice(0, 3).map((comp: any, idx: number) => (
              <View key={idx} style={styles.compItem}>
                <View style={styles.compItemIcon}>
                  <Award size={18} color="#F97316" strokeWidth={2.5} />
                </View>
                <View style={styles.compItemInfo}>
                  <Text style={styles.compItemName} numberOfLines={1}>{comp.nombre}</Text>
                  <Text style={styles.compItemDate}>
                    {new Date(comp.fecha).toLocaleDateString()} • Piscina {comp.piscina}M
                  </Text>
                </View>
                <ChevronRight size={16} color={theme.colors.slate600} />
              </View>
            ))
          ) : (
            <View style={styles.noDataDark}>
              <Text style={styles.noDataDarkText}>
                No se han registrado tiempos de competencia
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12
  },
  loadingText: {
    fontSize: 11, fontWeight: '900', color: theme.colors.slate400,
    textTransform: 'uppercase', letterSpacing: 3,
  },

  // HERO
  hero: {
    backgroundColor: theme.colors.slate100,
    borderRadius: 50,
    padding: 24,
    gap: 4,
  },
  heroTopRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12
  },
  onlineDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: theme.colors.green500,
  },
  heroTopText: {
    fontSize: 10, fontWeight: '900', color: theme.colors.slate400,
    textTransform: 'uppercase', letterSpacing: 4,
  },
  heroName: {
    fontSize: 30, fontWeight: '900', color: theme.colors.slate900,
    fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -1, lineHeight: 44,
  },
  heroLastName: {
    fontSize: 30, fontWeight: '900', color: theme.colors.blue500,
    fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -1, lineHeight: 44,
    marginBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 999, paddingVertical: 8, paddingHorizontal: 8,
    paddingRight: 20, gap: 12, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: theme.colors.slate100,
  },
  categoryIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.colors.slate900,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 10, fontWeight: '900', color: theme.colors.slate400,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  categoryValue: {
    fontSize: 14, fontWeight: '900', color: theme.colors.slate900,
    textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -0.5,
  },

  // EVENTO
  eventCard: {
    backgroundColor: theme.colors.blue600,
    borderRadius: 28, padding: 24, overflow: 'hidden', minHeight: 200,
  },
  eventCardBg: { position: 'absolute', top: 0, right: 0, padding: 16 },
  eventBgIcon: { opacity: 0.08 },
  eventCardContent: { gap: 12 },
  eventBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
    alignSelf: 'flex-start',
  },
  eventBadgeText: {
    fontSize: 10, fontWeight: '900', color: theme.colors.white,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  eventName: {
    fontSize: 28, fontWeight: '900', color: theme.colors.white,
    fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.5, lineHeight: 30,
  },
  eventStats: { flexDirection: 'row', gap: 12 },
  eventStat: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20,
  },
  eventStatLabel: {
    fontSize: 10, fontWeight: '900', color: 'rgba(147,197,253,1)',
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4,
  },
  eventStatValue: {
    fontSize: 28, fontWeight: '900', color: theme.colors.white, fontStyle: 'italic',
  },
  noEvent: { paddingVertical: 20 },
  noEventTitle: {
    fontSize: 24, fontWeight: '900', color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic', textTransform: 'uppercase',
  },
  noEventSub: {
    fontSize: 11, fontWeight: '700', color: 'rgba(219,234,254,0.7)',
    textTransform: 'uppercase', letterSpacing: 2, marginTop: 8,
  },

  // ESPECIALIDAD & BIO
  row: { flexDirection: 'row', gap: 12 },
  specialtyCard: {
    flex: 1, backgroundColor: theme.colors.slate900,
    borderRadius: 24, padding: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: '#1E293B',
    justifyContent: 'flex-end', minHeight: 160,
  },
  flameBg: { position: 'absolute', bottom: -10, right: -10 },
  specialtyLabel: {
    fontSize: 10, fontWeight: '900', color: theme.colors.slate500,
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6,
  },
  specialtyValue: {
    fontSize: 20, fontWeight: '900', color: theme.colors.blue400 || '#60A5FA',
    fontStyle: 'italic', textTransform: 'uppercase',
  },
  specialtyLink: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12,
  },
  specialtyLinkText: {
    fontSize: 10, fontWeight: '900', color: theme.colors.blue500,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  bioCol: { gap: 12, width: '42%' },
  bioCard: {
    backgroundColor: theme.colors.white, borderRadius: 24, padding: 16,
    borderWidth: 1, borderColor: theme.colors.slate100, gap: 4, flex: 1,
  },
  bioLabel: {
    fontSize: 10, fontWeight: '900', color: theme.colors.slate400,
    textTransform: 'uppercase', letterSpacing: 2, marginTop: 6,
  },
  bioValue: {
    fontSize: 22, fontWeight: '900', color: theme.colors.slate900, fontStyle: 'italic',
  },
  bioUnit: {
    fontSize: 11, fontWeight: '700', color: theme.colors.blue600,
    textTransform: 'uppercase', fontStyle: 'normal',
  },

  // ENTRENAMIENTO
  trainCard: {
    backgroundColor: theme.colors.white, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: theme.colors.slate100, gap: 12,
  },
  trainCardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  trainCardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trainCardHeaderText: {
    fontSize: 10, fontWeight: '900', color: theme.colors.slate400,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  trainCardHeaderIcon: {
    width: 36, height: 36, backgroundColor: theme.colors.slate50,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  trainTitle: {
    fontSize: 22, fontWeight: '900', color: theme.colors.slate900,
    fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.5,
  },
  trainDate: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.colors.blue50, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE', alignSelf: 'flex-start',
  },
  trainDateText: {
    fontSize: 10, fontWeight: '900', color: '#1E40AF',
    textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic',
  },

  // COMPETENCIAS
  compCard: {
    backgroundColor: '#0a0f1d', borderRadius: 24, padding: 20, gap: 12,
  },
  compCardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  compCardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  compCardIcon: {
    width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  compCardTitle: {
    fontSize: 13, fontWeight: '900', color: theme.colors.white,
    textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: 2,
  },
  compItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  compItemIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(249,115,22,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  compItemInfo: { flex: 1 },
  compItemName: {
    fontSize: 12, fontWeight: '900', color: theme.colors.white,
    textTransform: 'uppercase', fontStyle: 'italic',
  },
  compItemDate: {
    fontSize: 10, fontWeight: '700', color: theme.colors.slate500,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 2,
  },
  noData: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  noDataText: {
    fontSize: 10, fontWeight: '900', color: theme.colors.slate300,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  noDataDark: {
    paddingVertical: 24, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)', borderRadius: 20,
    borderStyle: 'dashed', alignItems: 'center',
  },
  noDataDarkText: {
    fontSize: 10, fontWeight: '900', color: theme.colors.slate600,
    textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic',
    textAlign: 'center', paddingHorizontal: 16,
  },
});