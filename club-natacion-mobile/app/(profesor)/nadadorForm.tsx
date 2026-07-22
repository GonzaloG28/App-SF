// ═══════════════════════════════════════════════════
// (profesor)/nadadores/[id].tsx  — crear o editar nadador
// Replica exacta del diseño web NadadorForm.jsx
// Usar como:
//   (profesor)/nadadores/nuevo.tsx        → isEdit=false
//   (profesor)/nadadores/editar/[id].tsx  → isEdit=true
// ═══════════════════════════════════════════════════
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/shared/AppLayout';
import api from '../../services/api';
import { theme } from '../../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  User, Mail, Calendar, Weight, Ruler, Fingerprint,
  Waves, ArrowLeft, Save, Info, AlertTriangle,
  CheckCircle, Edit3, Lock, Trophy, GraduationCap,
  Phone, ShieldCheck
} from 'lucide-react-native';

// ══════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════
const calcularEdad = (fecha: Date | string | null): number => {
  if (!fecha) return 99;
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad  = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

const formatRut = (value: string): string => {
  const clean = value.replace(/[^0-9kK]/g, '');
  if (clean.length <= 1) return clean;
  const dv   = clean.slice(-1);
  let body   = clean.slice(0, -1);
  body       = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${dv}`;
};

// ══════════════════════════════════════════════════
// SUB-COMPONENTE: FIELD
// ══════════════════════════════════════════════════
const Field = ({
  label, name, icon: Icon, value, onChangeText, error,
  placeholder, disabled = false, hint, description,
  keyboardType = 'default',
}: {
  label: string; name: string; icon: any; value: string;
  onChangeText: (v: string) => void; error?: string;
  placeholder?: string; disabled?: boolean; hint?: string;
  description?: string; keyboardType?: any;
}) => (
  <View style={[styles.fieldWrap, disabled && { opacity: 0.55 }]}>
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {description && <Text style={styles.fieldDescription}>{description}</Text>}
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
    <View style={[styles.fieldInputWrap, error ? styles.fieldInputError : null]}>
      <View style={styles.fieldIcon}>
        <Icon size={16} color={disabled ? '#cbd5e1' : '#94a3b8'} />
      </View>
      <TextInput
        style={[styles.fieldInput, disabled && { color: '#94a3b8' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        placeholderTextColor="#cbd5e1"
        editable={!disabled}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {error && <AlertTriangle size={15} color="#f97316" style={{ marginRight: 12 }} />}
    </View>
    {hint && <Text style={styles.fieldHint}>{hint}</Text>}
  </View>
);

// ══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════
export default function NadadorForm() {
  const { user }    = useAuth();
  const router      = useRouter();
  const queryClient = useQueryClient();
  const params      = useLocalSearchParams<{ id?: string }>();
  const id          = params.id;
  const isEdit      = !!id && id !== 'nuevo';

  const [errors,         setErrors]         = useState<Record<string, string>>({});
  const [serverError,    setServerError]    = useState('');
  const [rama,           setRama]           = useState<'competitivo' | 'formativo'>('competitivo');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState({
    nombre: '', apellido: '', correo: '',
    fechaNacimiento: null as Date | null,
    peso: '', altura: '', rut: '',
    pruebasEspecialidad: '',
    nombreApoderado: '', correoApoderado: '', telefonoApoderado: '',
  });

  const originalData = useRef<any>(null);

  const esMenor = form.fechaNacimiento
    ? calcularEdad(form.fechaNacimiento) < 18
    : false;

  // ── Query edición ────────────────────────────
  const { isLoading } = useQuery({
    queryKey: ['nadador', id],
    queryFn: () => api.get(`/nadadores/${id}`).then(r => r.data),
    enabled: isEdit,
    staleTime: Infinity,
    select: (data: any) => {
      const d = data.data || data;
      const orig = {
        nombre:              d.user?.nombre              || '',
        apellido:            d.apellido                  || '',
        correo:              d.user?.correo              || '',
        fechaNacimiento:     d.fechaNacimiento ? new Date(d.fechaNacimiento) : null,
        peso:                d.peso?.toString()          || '',
        altura:              d.altura?.toString()        || '',
        rut:                 d.rut                       || '',
        pruebasEspecialidad: d.pruebasEspecialidad?.join(', ') || '',
        nombreApoderado:     d.nombreApoderado            || '',
        correoApoderado:     d.correoApoderado            || '',
        telefonoApoderado:   d.telefonoApoderado          || '',
      };
      if (!originalData.current) {
        originalData.current = { ...orig, rama: d.rama || 'competitivo' };
        setRama(d.rama || 'competitivo');
      }
      return d;
    },
  });

  // ── Mutation ─────────────────────────────────
  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit
        ? api.put(`/nadadores/${id}`, payload)
        : api.post('/nadadores', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nadadores'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['nadador', id] });
      router.replace('/(profesor)/nadadores');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || '';
      if (msg.toLowerCase().includes('rut'))
        setErrors(e => ({ ...e, rut: 'RUT ya registrado' }));
      else if (msg.toLowerCase().includes('correo'))
        setErrors(e => ({ ...e, correo: 'Email ya en uso' }));
      else
        setServerError(msg || 'Error en el servidor. Reintente.');
    },
  });

  // ── Validación ───────────────────────────────
  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isEdit) {
      if (form.correo && !emailRx.test(form.correo)) errs.correo = 'Email inválido';
      if (form.correoApoderado && !emailRx.test(form.correoApoderado))
        errs.correoApoderado = 'Email inválido';
      const algoCambio = Object.values(form).some(v => v !== '' && v !== null);
      const ramaCambio = rama !== originalData.current?.rama;
      if (!algoCambio && !ramaCambio) {
        setServerError('Modifica al menos un campo para guardar.');
        return false;
      }
    } else {
      if (!form.nombre.trim())           errs.nombre          = 'Requerido';
      if (!form.apellido.trim())         errs.apellido        = 'Requerido';
      if (!emailRx.test(form.correo))    errs.correo          = 'Email inválido';
      if (!form.fechaNacimiento)         errs.fechaNacimiento = 'Falta fecha';
      if (!form.rut.trim())              errs.rut             = 'RUT requerido';
      if (esMenor) {
        if (!form.correoApoderado.trim())
          errs.correoApoderado = 'Requerido (menor de edad)';
        else if (!emailRx.test(form.correoApoderado))
          errs.correoApoderado = 'Email inválido';
        if (!form.telefonoApoderado.trim())
          errs.telefonoApoderado = 'Requerido (menor de edad)';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, isEdit, rama, esMenor]);

  // ── Submit ───────────────────────────────────
  const handleSubmit = () => {
    setServerError('');
    if (!validate()) return;

    if (isEdit) {
      const cambios: any = { rama };
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== null) cambios[key] = val;
      });
      if (cambios.pruebasEspecialidad)
        cambios.pruebasEspecialidad = cambios.pruebasEspecialidad
          .split(',').map((p: string) => p.trim()).filter(Boolean);
      if (cambios.fechaNacimiento instanceof Date)
        cambios.fechaNacimiento = cambios.fechaNacimiento.toISOString();
      mutation.mutate(cambios);
    } else {
      mutation.mutate({
        ...form,
        rama,
        peso:   form.peso   ? Number(form.peso)   : 0,
        altura: form.altura ? Number(form.altura) : 0,
        pruebasEspecialidad: form.pruebasEspecialidad
          .split(',').map(p => p.trim()).filter(Boolean),
        fechaNacimiento: form.fechaNacimiento?.toISOString(),
      });
    }
  };

  // ── Helpers de form ──────────────────────────
  const set = (key: keyof typeof form) => (v: string) =>
    setForm(p => ({ ...p, [key]: v }));

  const orig = originalData.current;
  const userName  = (user as any)?.nombre || 'Profesor';
  const userEmail = (user as any)?.correo || '';
  const initials  = (user as any)?.nombre?.charAt(0)?.toUpperCase() || 'P';

  if (isLoading) {
    return (
      <AppLayout role="profesor" title="Cargando..." userName={userName} userEmail={userEmail} initials={initials}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.blue600} />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      role="profesor"
      title={isEdit ? 'Editar Atleta' : 'Nuevo Atleta'}
      subtitle={isEdit ? 'Solo llena los campos a cambiar' : 'Ficha de Rendimiento'}
      userName={userName}
      userEmail={userEmail}
      initials={initials}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── HERO HEADER OSCURO ── */}
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <View style={styles.heroInner}>
              <View style={styles.heroLeft}>
                <View style={[styles.heroAvatar, isEdit ? styles.heroAvatarEdit : styles.heroAvatarNew]}>
                  {isEdit ? <Save size={26} color="white" /> : <User size={26} color="white" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>
                    {isEdit ? 'EDITAR ' : 'NUEVO '}
                    <Text style={styles.heroTitleAccent}>ATLETA</Text>
                  </Text>
                  <Text style={styles.heroSub}>
                    {isEdit ? 'Solo llena los campos que quieres cambiar' : 'Ficha de Rendimiento'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <ArrowLeft size={15} color="#94a3b8" />
                <Text style={styles.backBtnText}>VOLVER</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── SELECTOR DE RAMA ── */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Waves size={14} color={theme.colors.blue600} />
              <Text style={styles.cardTitle}>RAMA DEL NADADOR</Text>
            </View>
            <View style={styles.ramaGrid}>
              {([
                { value: 'competitivo', label: 'COMPETITIVO', sub: 'Compite en torneos',    Icon: Trophy,        activeStyle: styles.ramaBtnCompetitivoActive, color: '#1d4ed8' },
                { value: 'formativo',   label: 'FORMATIVO',   sub: 'Aprendiendo a nadar',   Icon: GraduationCap, activeStyle: styles.ramaBtnFormativoActive,   color: '#15803d' },
              ] as const).map(({ value, label, sub, Icon, activeStyle, color }) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.ramaBtn, rama === value && activeStyle]}
                  onPress={() => setRama(value)}
                  activeOpacity={0.8}
                >
                  <Icon size={22} color={rama === value ? color : '#cbd5e1'} />
                  <Text style={[styles.ramaBtnLabel, rama === value && { color }]}>{label}</Text>
                  <Text style={styles.ramaBtnSub}>{sub}</Text>
                  {rama === value && <CheckCircle size={14} color={color} style={{ marginTop: 2 }} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── AVISO EDICIÓN ── */}
          {isEdit && (
            <View style={styles.editNotice}>
              <Edit3 size={16} color={theme.colors.blue600} />
              <Text style={styles.editNoticeText}>
                LOS CAMPOS VACÍOS MANTIENEN SU VALOR ACTUAL. SOLO SE ACTUALIZAN LOS CAMPOS QUE COMPLETES.
              </Text>
            </View>
          )}

          {/* ── ERROR SERVIDOR ── */}
          {serverError !== '' && (
            <View style={styles.serverError}>
              <AlertTriangle size={18} color="white" />
              <Text style={styles.serverErrorText}>{serverError.toUpperCase()}</Text>
            </View>
          )}

          {/* ── IDENTIDAD ── */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Fingerprint size={14} color={theme.colors.blue600} />
              <Text style={[styles.cardTitle, { color: theme.colors.blue600 }]}>IDENTIDAD</Text>
            </View>
            <Field
              label="RUT" name="rut" icon={isEdit ? Lock : Fingerprint}
              value={form.rut} onChangeText={v => { const f = formatRut(v); if (f.length <= 12) set('rut')(f); }}
              error={errors.rut}
              placeholder={isEdit ? (orig?.rut || 'No editable') : '12.345.678-9'}
              disabled={isEdit}
              hint={isEdit ? 'El RUT no puede modificarse' : undefined}
            />
            <Field
              label="EMAIL" name="correo" icon={Mail}
              value={form.correo} onChangeText={set('correo')}
              error={errors.correo}
              placeholder={isEdit ? (orig?.correo || 'correo@ejemplo.com') : 'atleta@club.cl'}
              keyboardType="email-address"
            />
          </View>

          {/* ── BIOMETRÍA ── */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Info size={14} color="#10b981" />
              <Text style={[styles.cardTitle, { color: '#10b981' }]}>BIOMETRÍA</Text>
            </View>
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Field label="PESO (KG)" name="peso" icon={Weight}
                  value={form.peso} onChangeText={set('peso')}
                  error={errors.peso}
                  placeholder={isEdit ? (orig?.peso || 'kg') : '70'}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="ALTURA (CM)" name="altura" icon={Ruler}
                  value={form.altura} onChangeText={set('altura')}
                  error={errors.altura}
                  placeholder={isEdit ? (orig?.altura || 'cm') : '180'}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Date picker */}
            <View style={styles.fieldWrap}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>FECHA DE NACIMIENTO</Text>
                {errors.fechaNacimiento && (
                  <Text style={styles.fieldError}>{errors.fechaNacimiento}</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.dateBtn, errors.fechaNacimiento ? styles.fieldInputError : null]}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={16} color="#94a3b8" />
                <Text style={[styles.dateBtnText, !form.fechaNacimiento && { color: '#cbd5e1' }]}>
                  {form.fechaNacimiento
                    ? form.fechaNacimiento.toLocaleDateString('es-ES')
                    : isEdit
                      ? (orig?.fechaNacimiento
                          ? new Date(orig.fechaNacimiento).toLocaleDateString('es-ES')
                          : 'Dejar vacío para no cambiar')
                      : 'DD / MM / AAAA'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.fechaNacimiento || new Date(2005, 0, 1)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) setForm(p => ({ ...p, fechaNacimiento: date }));
                  }}
                />
              )}
            </View>
          </View>

          {/* ── DATOS DEL PERFIL ── */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Waves size={14} color={theme.colors.blue600} />
              <Text style={styles.cardTitle}>DATOS DEL PERFIL</Text>
            </View>
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Field label="NOMBRES" name="nombre" icon={User}
                  value={form.nombre} onChangeText={set('nombre')}
                  error={errors.nombre}
                  placeholder={isEdit ? (orig?.nombre || 'Nombre actual') : 'Juan Andrés'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="APELLIDOS" name="apellido" icon={User}
                  value={form.apellido} onChangeText={set('apellido')}
                  error={errors.apellido}
                  placeholder={isEdit ? (orig?.apellido || 'Apellido actual') : 'Pérez Soto'}
                />
              </View>
            </View>
            <Field
              label="PRUEBAS DE ESPECIALIDAD" name="pruebasEspecialidad" icon={Waves}
              value={form.pruebasEspecialidad} onChangeText={set('pruebasEspecialidad')}
              error={errors.pruebasEspecialidad}
              placeholder={isEdit ? (orig?.pruebasEspecialidad || 'Especialidades actuales') : '100m Mariposa, 50m Pecho...'}
              description="Separar con comas"
            />
          </View>

          {/* ── APODERADO (si es menor o edición) ── */}
          {(esMenor || orig?.correoApoderado || isEdit) && (
            <View style={[styles.card, esMenor && styles.cardApoderado]}>
              <View style={styles.apoderadoHeader}>
                <View style={[styles.apoderadoIconBox, esMenor ? styles.apoderadoIconBoxActive : styles.apoderadoIconBoxDefault]}>
                  <ShieldCheck size={16} color={esMenor ? '#f97316' : '#94a3b8'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: esMenor ? '#ea580c' : '#64748b' }]}>
                    DATOS DEL APODERADO
                  </Text>
                  <Text style={styles.apoderadoSub}>
                    {esMenor
                      ? '⚠ Obligatorio — el nadador es menor de edad'
                      : 'Opcional si el nadador es mayor de 18 años'}
                  </Text>
                </View>
              </View>
              <Field label="NOMBRE DEL APODERADO" name="nombreApoderado" icon={User}
                value={form.nombreApoderado} onChangeText={set('nombreApoderado')}
                error={errors.nombreApoderado}
                placeholder="Nombre completo del apoderado"
              />
              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Field label="CORREO APODERADO" name="correoApoderado" icon={Mail}
                    value={form.correoApoderado} onChangeText={set('correoApoderado')}
                    error={errors.correoApoderado}
                    placeholder="apoderado@email.com"
                    keyboardType="email-address"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="TELÉFONO" name="telefonoApoderado" icon={Phone}
                    value={form.telefonoApoderado} onChangeText={set('telefonoApoderado')}
                    error={errors.telefonoApoderado}
                    placeholder="+56 9 1234 5678"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>
          )}

          {/* ── BOTÓN SUBMIT ── */}
          <TouchableOpacity
            style={[styles.submitBtn, isEdit ? styles.submitBtnEdit : styles.submitBtnNew, mutation.isPending && { opacity: 0.55 }]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
            activeOpacity={0.85}
          >
            {mutation.isPending
              ? <ActivityIndicator size="small" color="white" />
              : <CheckCircle size={20} color="white" strokeWidth={3} />}
            <Text style={styles.submitBtnText}>
              {mutation.isPending ? 'PROCESANDO...' : isEdit ? 'GUARDAR CAMBIOS' : 'INSCRIBIR NADADOR'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════
// ESTILOS
// ══════════════════════════════════════════════════
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 48 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // HERO
  heroCard: {
    backgroundColor: '#0f172a', borderRadius: 24, padding: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  heroGlow: { position: 'absolute', top: -40, right: -40, width: 120, height: 120, backgroundColor: 'rgba(59,130,246,0.2)', borderRadius: 60 },
  heroInner: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  heroAvatar: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroAvatarNew: { backgroundColor: '#2563eb' },
  heroAvatarEdit: { backgroundColor: '#10b981' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: 'white', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.5 },
  heroTitleAccent: { color: '#60a5fa' },
  heroSub: { fontSize: 10, fontWeight: '700', color: '#475569', letterSpacing: 1, marginTop: 3 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexShrink: 0,
  },
  backBtnText: { fontSize: 10, fontWeight: '900', color: '#64748b', letterSpacing: 1 },

  // CARDS
  card: {
    backgroundColor: 'white', borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: '#f1f5f9', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  cardApoderado: { borderWidth: 2, borderColor: '#fed7aa' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 10, fontWeight: '900', color: '#334155', textTransform: 'uppercase', letterSpacing: 2 },

  // RAMA
  ramaGrid: { flexDirection: 'row', gap: 10 },
  ramaBtn: {
    flex: 1, alignItems: 'center', gap: 4, padding: 14,
    borderRadius: 16, borderWidth: 2, borderColor: '#f1f5f9', backgroundColor: '#f8fafc',
  },
  ramaBtnCompetitivoActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  ramaBtnFormativoActive:   { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  ramaBtnLabel: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  ramaBtnSub:   { fontSize: 9,  fontWeight: '600', color: '#94a3b8', textAlign: 'center' },

  // NOTICES
  editNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 16, padding: 14,
  },
  editNoticeText: { flex: 1, fontSize: 10, fontWeight: '900', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 16 },
  serverError: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f97316', borderRadius: 16, padding: 14 },
  serverErrorText: { flex: 1, fontSize: 10, fontWeight: '900', color: 'white', textTransform: 'uppercase', letterSpacing: 1 },

  // FIELDS
  fieldWrap: { gap: 6 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingHorizontal: 2 },
  fieldLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 },
  fieldDescription: { fontSize: 9, fontWeight: '700', color: theme.colors.blue600, textTransform: 'uppercase' },
  fieldError: { fontSize: 9, fontWeight: '900', color: '#f97316', textTransform: 'uppercase' },
  fieldInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderWidth: 2, borderColor: '#f1f5f9', borderRadius: 14, overflow: 'hidden',
  },
  fieldInputError: { borderColor: '#fb923c', backgroundColor: '#fff7ed' },
  fieldIcon: { paddingHorizontal: 12, paddingVertical: 14 },
  fieldInput: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1e293b', paddingVertical: 13, paddingRight: 12 },
  fieldHint: { fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 2 },

  // DATE
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f8fafc', borderWidth: 2, borderColor: '#f1f5f9',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
  },
  dateBtnText: { fontSize: 13, fontWeight: '700', color: '#1e293b' },

  // TWO COL
  twoCol: { flexDirection: 'row', gap: 10 },

  // APODERADO
  apoderadoHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  apoderadoIconBox: { padding: 8, borderRadius: 12 },
  apoderadoIconBoxActive: { backgroundColor: '#fff7ed' },
  apoderadoIconBoxDefault: { backgroundColor: '#f8fafc' },
  apoderadoSub: { fontSize: 10, fontWeight: '600', color: '#64748b', marginTop: 2 },

  // SUBMIT
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 18, borderRadius: 20,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  submitBtnNew:  { backgroundColor: '#0f172a', shadowColor: '#1e293b' },
  submitBtnEdit: { backgroundColor: '#10b981', shadowColor: '#10b981' },
  submitBtnText: { color: 'white', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic' },
});
