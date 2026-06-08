import React, { useState, useMemo, memo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trophy, Calendar, Weight, Dumbbell,
  Ruler, Fingerprint, Target, ShieldCheck,
  Clock, Zap, ChevronRight,
  Mail, Check, X, AlertCircle, Lock, GraduationCap
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/shared/AppLayout';
import api from '../../services/api';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ── SUB-COMPONENTE: CAMBIAR CORREO ────────────────────────────────────
const CambiarCorreo = ({ perfil }: { perfil: any }) => {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(false);
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");

  const { puedeEditar, diasRestantes, fechaDisponible } = useMemo(() => {
    const lastChange = perfil?.user?.lastEmailChange;
    if (!lastChange) return { puedeEditar: true, diasRestantes: 0, fechaDisponible: null };
    
    const MS = 14 * 24 * 60 * 60 * 1000;
    const pasados = Date.now() - new Date(lastChange).getTime();
    
    if (pasados >= MS) return { puedeEditar: true, diasRestantes: 0, fechaDisponible: null };
    
    const dias = Math.ceil((MS - pasados) / (24 * 60 * 60 * 1000));
    const fecha = new Date(new Date(lastChange).getTime() + MS)
      .toLocaleDateString("es-ES", { day: "2-digit", month: "long" });
      
    return { puedeEditar: false, diasRestantes: dias, fechaDisponible: fecha };
  }, [perfil?.user?.lastEmailChange]);

  const mutation = useMutation({
    mutationFn: () => api.put("/nadadores/perfil", { correo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miPerfil"] });
      queryClient.invalidateQueries({ queryKey: ["miPerfilNadador"] });
      setEditando(false);
      setCorreo("");
      setError("");
    },
    onError: (err: any) => setError(err.response?.data?.message || "Error al actualizar")
  });

  const handleGuardar = () => {
    if (!correo.trim()) return setError("Escribe el nuevo correo");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError("Correo inválido");
    if (correo === perfil?.user?.correo) return setError("Es el mismo correo actual");
    setError("");
    mutation.mutate();
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.iconLabelGroup}>
          <Mail size={16} color="#3b82f6" />
          <Text style={styles.blockSectionTitle}>CORREO ELECTRÓNICO</Text>
        </View>
        {!puedeEditar && (
          <View style={styles.lockBadge}>
            <Clock size={11} color="#ea580c" />
            <Text style={styles.lockBadgeText}>{diasRestantes}D RESTANTES</Text>
          </View>
        )}
      </View>

      <View style={[styles.displayInputRow, editando && styles.displayInputRowActive]}>
        <Text style={styles.displayText} numberOfLines={1}>
          {perfil?.user?.correo || "—"}
        </Text>
        {!editando && (
          puedeEditar ? (
            <TouchableOpacity onPress={() => setEditando(true)}>
              <Text style={styles.changeBtnText}>CAMBIAR</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.lockIconGroup}>
              <Lock size={13} color="#94a3b8" />
              <Text style={styles.lockInlineText}>BLOQUEADO</Text>
            </View>
          )
        )}
      </View>

      {!puedeEditar && (
        <Text style={styles.restrictionNotice}>
          Podrás cambiar tu correo el <Text style={{ fontWeight: '900', color: '#475569' }}>{fechaDisponible}</Text>. Solo 1 cambio cada 14 días.
        </Text>
      )}

      {editando && (
        <View style={{ gap: 10, marginTop: 4 }}>
          <TextInput
            placeholder="Nuevo correo electrónico"
            placeholderTextColor="#94a3b8"
            value={correo}
            onChangeText={(txt) => { setCorreo(txt); setError(""); }}
            style={styles.nativeInput}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />
          
          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={13} color="#ea580c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={[styles.btnConfirm, mutation.isPending && { opacity: 0.6 }]} 
              onPress={handleGuardar}
              disabled={mutation.isPending}
            >
              <Check size={14} color="white" />
              <Text style={styles.btnConfirmText}>{mutation.isPending ? "GUARDANDO..." : "CONFIRMAR"}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnCancel} 
              onPress={() => { setEditando(false); setCorreo(""); setError(""); }}
            >
              <X size={16} color="#475569" />
            </TouchableOpacity>
          </View>
          <Text style={styles.restrictionNotice}>Luego de confirmar, la edición se congelará por 14 días.</Text>
        </View>
      )}
    </View>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────
export default function MiPerfil() {
  const { user } = useAuth();

  const { data: nadador, isLoading, isError, error } = useQuery({
    queryKey: ["miPerfilNadador"],
    queryFn: () => api.get("/nadadores/perfil").then(r => r.data),
    enabled: !!user,
  });

  const { data: convocatorias = [] } = useQuery({
    queryKey: ["misConvocatoriasPerfil"],
    queryFn: () => api.get("/convocatorias/mis-convocatorias").then(r => r.data),
    enabled: !!nadador,
    staleTime: 1000 * 60 * 5,
  });

  const proximasConv = useMemo(() => {
    if (!Array.isArray(convocatorias)) return [];
    return convocatorias
      .filter((c: any) => new Date(c.fechaFin) >= new Date())
      .sort((a: any, b: any) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
      .slice(0, 2);
  }, [convocatorias]);

  const fechaFormateada = useMemo(() => {
    if (!nadador?.fechaNacimiento) return "No registrado";
    return new Date(nadador.fechaNacimiento).toLocaleDateString("es-ES", {
      year: "numeric", month: "2-digit", day: "2-digit", timeZone: 'UTC'
    });
  }, [nadador?.fechaNacimiento]);

  // Fallbacks de sesión idénticos para el AppLayout
  const userName = nadador?.user?.nombre || user?.nombre || 'Atleta';
  const userEmail = nadador?.user?.correo || user?.correo || '';
  const initials = [nadador?.user?.nombre?.charAt(0), nadador?.apellido?.charAt(0)]
    .filter(Boolean).join('').toUpperCase() || 'AT';

  if (isLoading) {
    return (
      <AppLayout role="nadador" title="Mi Perfil" userName={userName} userEmail={userEmail} initials={initials}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.blue600} />
          <Text style={styles.loadingText}>SINCRONIZANDO EXPEDIENTE...</Text>
        </View>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout role="nadador" title="Mi Perfil" userName={userName} userEmail={userEmail} initials={initials}>
        <View style={styles.errorCard}>
          <View style={styles.errorIconBadge}><ShieldCheck size={32} color="#ef4444" /></View>
          <Text style={styles.errorTitle}>ERROR DE CONEXIÓN</Text>
          <Text style={styles.errorSubtitle}>{(error as any)?.message || "No se pudo recuperar tu perfil técnico."}</Text>
        </View>
      </AppLayout>
    );
  }

  const esFormativo = nadador.rama === "formativo";

  return (
    <AppLayout
      role="nadador"
      title="Mi Perfil"
      subtitle="Ficha Técnica Deportiva"
      userName={userName}
      userEmail={userEmail}
      initials={initials}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER ADAPTATIVO NATIVO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerIndicator}>ATLETA</Text>
            <Text style={styles.mainTitle}>MI <Text style={{ color: theme.colors.blue600 }}>PERFIL</Text></Text>
          </View>
          
          <View style={[styles.statusBadge, nadador.pagoAlDia ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
            <View style={[styles.statusDot, { backgroundColor: nadador.pagoAlDia ? '#10b981' : '#f97316' }]} />
            <Text style={[styles.statusBadgeText, { color: nadador.pagoAlDia ? '#047857' : '#c2410c' }]}>
              {nadador.pagoAlDia ? "CUENTA ACTIVA" : "REVISAR CUENTA"}
            </Text>
          </View>
        </View>

        {/* HERO CARD DE ATLETA */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRow}>
            <View style={[
              styles.avatarContainer, 
              esFormativo ? { backgroundColor: '#22c55e' } : { backgroundColor: theme.colors.blue600 }
            ]}>
              <Text style={styles.avatarLetter}>{nadador.user?.nombre?.charAt(0) || "N"}</Text>
              <View style={styles.zapBadge}>
                <Zap size={10} color="#22c55e" fill="#22c55e" />
              </View>
            </View>

            <View style={styles.heroMainInfo}>
              <View style={styles.badgesInlineContainer}>
                <View style={styles.tagBadge}>
                  <Target size={10} color="#3b82f6" />
                  <Text style={styles.tagBadgeText}>{nadador.categoria || "SIN CATEGORÍA"}</Text>
                </View>
                <View style={[styles.tagBadge, esFormativo ? { borderColor: '#bbf7d0' } : { borderColor: '#bfdbfe' }]}>
                  <Text style={[styles.tagBadgeText, esFormativo ? { color: '#15803d' } : { color: '#1d4ed8' }]}>
                    RAMA {esFormativo ? "FORMATIVA" : "COMPETITIVA"}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.athleteName} numberOfLines={2}>
                {nadador.user?.nombre} <Text style={styles.athleteLastName}>{nadador.apellido}</Text>
              </Text>
            </View>
          </View>

          {/* GRID METADATA INFERIOR */}
          <View style={styles.metadataGrid}>
            <DataLabel icon={Fingerprint} label="RUT" value={nadador.rut || "N/A"} />
            <DataLabel icon={Calendar} label="EDAD" value={`${nadador.edad || "--"} AÑOS`} />
          </View>
        </View>

        {/* MÉTRICAS ADAPTATIVAS (3 CARDS) */}
        <View style={styles.metricsRow}>
          <StatCard icon={Calendar} title="NACIMIENTO" value={fechaFormateada} colorTheme="blue" />
          <StatCard icon={Weight} title="MASA" value={`${nadador.peso || "--"} KG`} colorTheme="green" />
          <StatCard icon={Ruler} title="ESTATURA" value={`${nadador.altura || "--"} CM`} colorTheme="blue" />
        </View>

        {/* COMPONENTE FUNCIONAL DE CORREO ELECTRÓNICO */}
        <CambiarCorreo perfil={nadador} />

        {/* PRÓXIMAS COMPETENCIAS */}
        <View style={styles.card}>
          <View style={styles.competitionsHeader}>
            <View style={styles.iconLabelGroup}>
              <View style={styles.trophyWrapper}><Trophy size={14} color="white" /></View>
              <Text style={styles.blockSectionTitle}>PRÓXIMAS COMPETENCIAS</Text>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            {proximasConv.length > 0 ? (
              proximasConv.map((c: any) => <ConvocatoriaRow key={c._id} conv={c} />)
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>SIN CONVOCATORIAS PRÓXIMAS</Text>
              </View>
            )}
          </View>
        </View>

        {/* ESPECIALIDADES DE ESTILO */}
        {nadador.pruebasEspecialidad?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.accessSectionTitle}>ESPECIALIDADES DE PISTA</Text>
            <View style={styles.specialtiesWrapper}>
              {nadador.pruebasEspecialidad.map((p: string, i: number) => (
                <View key={i} style={styles.specialtyPill}>
                  <View style={styles.specialtyDot} />
                  <Text style={styles.specialtyText}>{p.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </AppLayout>
  );
}

// ── AUX COMPONENTES DE DISEÑO EN LÍNEA ──────────────────────────────────
const ConvocatoriaRow = ({ conv }: { conv: any }) => {
  const inicio = new Date(conv.fechaInicio);
  const fin = new Date(conv.fechaFin);
  const hoy = new Date();
  const enCurso = inicio <= hoy && fin >= hoy;
  const diasHasta = Math.ceil((inicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <View style={styles.convRow}>
      <View style={[styles.convDateBlock, enCurso ? { backgroundColor: '#10b981' } : { backgroundColor: '#eff6ff' }]}>
        <Text style={[styles.convMonth, enCurso ? { color: 'white' } : { color: '#1d4ed8' }]}>
          {inicio.toLocaleString("es-ES", { month: "short", timeZone: 'UTC' }).toUpperCase()}
        </Text>
        <Text style={[styles.convDay, enCurso ? { color: 'white' } : { color: '#1e293b' }]}>
          {inicio.getUTCDate()}
        </Text>
      </View>

      <View style={{ flex: 1, paddingRight: 6 }}>
        <Text style={styles.convName} numberOfLines={1}>{conv.nombre.toUpperCase()}</Text>
        <Text style={styles.convPlace} numberOfLines={1}>{conv.lugar.toUpperCase()}</Text>
      </View>

      {enCurso ? (
        <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>VIVO</Text></View>
      ) : diasHasta > 0 ? (
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.daysCount}>{diasHasta}</Text>
          <Text style={styles.daysLabel}>DÍAS</Text>
        </View>
      ) : null}
    </View>
  );
};

const DataLabel = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <View style={styles.dataLabelBox}>
    <View style={styles.dataLabelIconBox}><Icon size={12} color="#94a3b8" /></View>
    <View style={{ flex: 1 }}>
      <Text style={styles.dataLabelLabel}>{label}</Text>
      <Text style={styles.dataLabelValue} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const StatCard = memo(({ title, value, icon: Icon, colorTheme }: { title: string, value: string, icon: any, colorTheme: 'blue' | 'green' }) => {
  const isBlue = colorTheme === 'blue';
  return (
    <View style={styles.statCardBox}>
      <View style={[styles.statCardIconBg, isBlue ? { backgroundColor: '#eff6ff', borderColor: '#dbeafe' } : { backgroundColor: '#ecfdf5', borderColor: '#d1fae5' }]}>
        <Icon size={14} color={isBlue ? '#2563eb' : '#059669'} strokeWidth={2.5} />
      </View>
      <Text style={styles.statCardTitle}>{title}</Text>
      <Text style={styles.statCardValue} numberOfLines={1}>{value}</Text>
    </View>
  );
});

// ── HOJA DE ESTILOS DE MÁXIMO RENDIMIENTO (STYLESHEET) ─────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 60 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', paddingVertical: 80, gap: 14 },
  loadingText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2 },
  
  // Header principal
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 14, marginBottom: 16 },
  headerIndicator: { color: theme.colors.blue600, fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  mainTitle: { fontSize: 26, fontWeight: '900', fontStyle: 'italic', color: theme.colors.slate900 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1.5, gap: 6 },
  statusBadgeActive: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  statusBadgeInactive: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: 9, fontWeight: '900' },

  // Hero Card de deportista
  heroCard: { backgroundColor: 'white', borderRadius: 24, padding: 16, borderColor: '#F1F5F9', shadowColor: '#1e293b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, marginBottom: 12 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarContainer: { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 8 },
  avatarLetter: { fontSize: 32, fontWeight: '900', color: 'white', fontStyle: 'italic' },
  zapBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#0f172a', padding: 5, borderRadius: 8 },
  heroMainInfo: { flex: 1, gap: 4 },
  badgesInlineContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagBadgeText: { fontSize: 8, fontWeight: '900', color: '#64748b' },
  athleteName: { fontSize: 22, fontWeight: '900', fontStyle: 'italic', color: theme.colors.slate900, textTransform: 'uppercase' },
  athleteLastName: { color: '#64748b', fontWeight: '800' },
  metadataGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 12, paddingTop: 12, gap: 12 },
  dataLabelBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dataLabelIconBox: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderStyle: 'solid', borderWidth: 1, borderColor: '#edf2f7' },
  dataLabelLabel: { fontSize: 8, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
  dataLabelValue: { fontSize: 11, fontWeight: '900', color: '#334155', fontStyle: 'italic' },

  // Tarjetas de Métricas (Masa, Estatura, Nacimiento)
  metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCardBox: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  statCardIconBg: { width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 8 },
  statCardTitle: { fontSize: 8, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 2 },
  statCardValue: { fontSize: 13, fontWeight: '900', color: '#0f172a', fontStyle: 'italic' },

  // Estructura de Bloque / Cards generales
  card: { backgroundColor: 'white', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  blockSectionTitle: { fontSize: 10, fontWeight: '900', color: '#64748b', letterSpacing: 1.5 },
  lockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#ffedd5' },
  lockBadgeText: { fontSize: 9, fontWeight: '900', color: '#c2410c' },
  
  // Input estático simulado e input nativo real
  displayInputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#f1f5f9' },
  displayInputRowActive: { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  displayText: { fontSize: 13, fontWeight: '700', color: '#334155', flex: 1, marginRight: 8 },
  changeBtnText: { fontSize: 10, fontWeight: '900', color: theme.colors.blue600, letterSpacing: 1 },
  lockIconGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lockInlineText: { fontSize: 9, fontWeight: '900', color: '#94a3b8' },
  restrictionNotice: { fontSize: 10, color: '#94a3b8', fontWeight: '500', marginTop: 6, lineHeight: 14 },
  nativeInput: { backgroundColor: 'white', borderWidth: 2, borderColor: '#bfdbfe', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, fontWeight: '700', color: '#1e293b' },
  
  // Alertas y Botones del editor inline
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  errorText: { fontSize: 10, fontWeight: '900', color: '#ea580c', textTransform: 'uppercase' },
  actionButtonsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btnConfirm: { flex: 1, backgroundColor: '#1e293b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  btnConfirmText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  btnCancel: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },

  // Soportes de listas de Convocatorias
  competitionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  trophyWrapper: { padding: 6, backgroundColor: theme.colors.blue600, borderRadius: 8 },
  convRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  convDateBlock: { width: 40, paddingVertical: 6, alignItems: 'center', borderRadius: 10 },
  convMonth: { fontSize: 8, fontWeight: '900' },
  convDay: { fontSize: 15, fontWeight: '900', marginTop: -2 },
  convName: { fontSize: 12, fontWeight: '900', color: '#1e293b' },
  convPlace: { fontSize: 9, fontWeight: '700', color: '#94a3b8', marginTop: 1 },
  liveBadge: { backgroundColor: '#10b981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  liveBadgeText: { color: 'white', fontSize: 8, fontWeight: '900' },
  daysCount: { fontSize: 16, fontWeight: '900', color: theme.colors.blue600, fontStyle: 'italic', height: 16 },
  daysLabel: { fontSize: 8, fontWeight: '900', color: '#94a3b8' },
  emptyStateContainer: { paddingVertical: 24, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 16 },
  emptyStateText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },

  // Especialidades
  accessSectionTitle: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, marginBottom: 12 },
  specialtiesWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specialtyPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderColor: '#edf2f7' },
  specialtyDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#3b82f6' },
  specialtyText: { fontSize: 10, fontWeight: '900', color: '#475569' },

  // Tarjeta de errores catastróficos
  errorCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, alignItems: 'center', marginTop: 40, borderColor: '#fee2e2' },
  errorIconBadge: { padding: 14, backgroundColor: '#fef2f2', borderRadius: 16, marginBottom: 12, transform: [{ rotate: '-4deg' }] },
  errorTitle: { fontSize: 16, fontWeight: '900', color: '#1e293b', fontStyle: 'italic' },
  errorSubtitle: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textAlign: 'center', marginTop: 4 }
});