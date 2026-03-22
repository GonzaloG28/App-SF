import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../api/axios"
import { useState, useMemo, memo } from "react"
import {
  Trophy, BarChart3, Calendar, Weight,
  Ruler, Fingerprint, Waves, Target, ShieldCheck,
  Clock, Flame, ArrowUpRight, Zap, ChevronRight,
  Mail, Check, X, AlertCircle, Lock
} from "lucide-react"

// ── SECCIÓN CAMBIO DE CORREO ─────────────────────────────────────────
const CambiarCorreo = ({ perfil, onSuccess }) => {
  const queryClient = useQueryClient()
  const [editando,  setEditando]  = useState(false)
  const [correo,    setCorreo]    = useState("")
  const [error,     setError]     = useState("")

  // Calcular si puede cambiar correo
  const { puedeEditar, diasRestantes, fechaDisponible } = useMemo(() => {
    const lastChange = perfil?.user?.lastEmailChange
    if (!lastChange) return { puedeEditar: true, diasRestantes: 0, fechaDisponible: null }

    const MS_14_DIAS  = 14 * 24 * 60 * 60 * 1000
    const msPasados   = Date.now() - new Date(lastChange).getTime()

    if (msPasados >= MS_14_DIAS) return { puedeEditar: true, diasRestantes: 0, fechaDisponible: null }

    const diasRestantes   = Math.ceil((MS_14_DIAS - msPasados) / (24 * 60 * 60 * 1000))
    const fechaDisponible = new Date(new Date(lastChange).getTime() + MS_14_DIAS)
      .toLocaleDateString("es-ES", { day: "2-digit", month: "long" })

    return { puedeEditar: false, diasRestantes, fechaDisponible }
  }, [perfil?.user?.lastEmailChange])

  const mutation = useMutation({
    mutationFn: () => api.put("/nadadores/perfil", { correo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miPerfil"] })
      queryClient.invalidateQueries({ queryKey: ["miPerfilNadador"] })
      setEditando(false)
      setCorreo("")
      setError("")
      onSuccess?.()
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Error al actualizar"
      setError(msg)
    }
  })

  const handleGuardar = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!correo.trim()) return setError("Escribe el nuevo correo")
    if (!emailRegex.test(correo)) return setError("Correo inválido")
    if (correo === perfil?.user?.correo) return setError("Es el mismo correo actual")
    setError("")
    mutation.mutate()
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-blue-600" />
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Correo electrónico</span>
        </div>
        {/* Badge de cooldown */}
        {!puedeEditar && (
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full">
            <Clock size={11} />
            <span className="text-[10px] font-black uppercase tracking-wider">{diasRestantes}d restantes</span>
          </div>
        )}
      </div>

      {/* Correo actual */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${editando ? "border-blue-200 bg-blue-50/30" : "border-slate-100 bg-slate-50"}`}>
        <span className="text-sm font-bold text-slate-700 flex-1 truncate">
          {perfil?.user?.correo || "—"}
        </span>
        {!editando && (
          puedeEditar ? (
            <button
              onClick={() => setEditando(true)}
              className="shrink-0 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
            >
              Cambiar
            </button>
          ) : (
            <div className="flex items-center gap-1 text-slate-400">
              <Lock size={13} />
              <span className="text-[10px] font-black uppercase tracking-wider">Bloqueado</span>
            </div>
          )
        )}
      </div>

      {/* Información de cooldown */}
      {!puedeEditar && (
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed px-1">
          Podrás cambiar tu correo el <span className="font-black text-slate-600">{fechaDisponible}</span>. Solo se permite 1 cambio cada 14 días.
        </p>
      )}

      {/* Formulario de edición */}
      {editando && (
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Nuevo correo electrónico"
            value={correo}
            onChange={(e) => { setCorreo(e.target.value); setError("") }}
            className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
            autoFocus
          />
          {error && (
            <div className="flex items-center gap-2 text-orange-600 text-[11px] font-black uppercase">
              <AlertCircle size={13} />
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleGuardar}
              disabled={mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
            >
              {mutation.isPending ? "Guardando..." : <><Check size={14} /> Confirmar</>}
            </button>
            <button
              onClick={() => { setEditando(false); setCorreo(""); setError("") }}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-medium px-1">
            Después de este cambio, no podrás cambiar el correo por 14 días.
          </p>
        </div>
      )}
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────
const MiPerfil = () => {
  const { data: nadador, isLoading, isError, error } = useQuery({
    queryKey: ["miPerfilNadador"],
    queryFn: () => api.get("/nadadores/perfil").then(res => res.data),
  })

  const { data: competencias } = useQuery({
    queryKey: ["misCompetenciasProximas"],
    queryFn: () => api.get("/competencias").then(res => res.data),
    enabled: !!nadador
  })

  if (isLoading) return <ProfileSkeleton />
  if (isError)   return <ErrorState error={error} />

  const proximasCompetencias = competencias
    ?.filter(c => new Date(c.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 2) || []

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* HEADER */}
      <header className="flex justify-between items-end border-b border-slate-100 pb-5">
        <div>
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-1 block italic">User profile</span>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Mi Perfil</h2>
        </div>
        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-1.5 shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Cuenta Activa</span>
        </div>
      </header>

      {/* HERO */}
      <section className="relative group overflow-hidden bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 border border-slate-100 shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 md:gap-10">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-3xl md:text-5xl font-black italic text-white shadow-xl shadow-blue-600/20 group-hover:rotate-0 transition-transform duration-500 rotate-2 uppercase">
              {nadador.user?.nombre?.charAt(0)}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 md:p-2.5 rounded-xl shadow-lg -rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Zap size={14} fill="currentColor" className="text-emerald-400" />
            </div>
          </div>

          <div className="text-center sm:text-left space-y-3 flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">
              <Target size={11} /> {nadador.categoria || "Nivel Club"}
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-[-0.03em] italic leading-[0.9] text-slate-900 uppercase">
              {nadador.user?.nombre} <br />
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                {nadador.apellido}
              </span>
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-3 border-t border-slate-100">
              <BadgeLight icon={Fingerprint} label={nadador.rut} />
              <BadgeLight icon={Waves} label="Federado" highlight />
            </div>
          </div>
        </div>
      </section>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <StatCard icon={Calendar} title="Edad"     value={`${nadador.edad} Años`} colorTheme="blue"   />
        <StatCard icon={Weight}   title="Masa"     value={`${nadador.peso} Kg`}   colorTheme="green"  />
        <StatCard icon={Ruler}    title="Estatura" value={`${nadador.altura} Cm`} colorTheme="blue"   />
        <StatCard icon={Flame}    title="Progreso" value="94%"                    colorTheme="orange" />
      </div>

      <div className="grid lg:grid-cols-12 gap-5 md:gap-8">
        <div className="lg:col-span-8 space-y-5">

          {/* CAMBIO DE CORREO — nuevo componente */}
          <CambiarCorreo perfil={nadador} />

          {/* PRÓXIMAS COMPETENCIAS */}
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 md:p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                  <Trophy size={18} />
                </div>
                <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tighter uppercase italic">Próximas Pruebas</h3>
              </div>
              <Link to="/nadador/competencias" className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                Ver Todo
              </Link>
            </div>
            <div className="space-y-3">
              {proximasCompetencias.length > 0 ? (
                proximasCompetencias.map(comp => <CompetitionRow key={comp._id} comp={comp} />)
              ) : (
                <EmptyEvents />
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4 md:space-y-5">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 md:mb-6">Módulos de Análisis</h3>
            <div className="space-y-3">
              <ActionLink to="/nadador/competencias"  title="Mis Logros"    icon={Trophy}   />
              <ActionLink to="/nadador/mis-tiempos"   title="Estadísticas"  icon={BarChart3} />
              <ActionLink to="/nadador/entrenamientos" title="Rutinas"       icon={Clock}    />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <Target className="absolute -right-6 -bottom-6 opacity-10 group-hover:rotate-12 transition-transform duration-1000" size={120} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Objetivo Actual</h4>
            <p className="text-xl md:text-2xl font-black italic uppercase leading-[0.9] mb-5">Potencia de <br /> Viraje</p>
            <button className="w-full bg-white/20 backdrop-blur-md text-white border border-white/30 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2">
              Ver Plan <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── COMPONENTES AUXILIARES ───────────────────────────────────────────

const StatCard = memo(({ title, value, icon: Icon, colorTheme }) => {
  const themes = {
    blue:   "text-blue-600 bg-blue-50 border-blue-100",
    green:  "text-emerald-600 bg-emerald-50 border-emerald-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
  }
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-3 group-hover:rotate-6 transition-transform border ${themes[colorTheme]}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-lg md:text-xl font-black text-slate-900 italic tracking-tighter uppercase tabular-nums">{value}</p>
    </div>
  )
})

const ActionLink = ({ to, title, icon: Icon }) => (
  <Link to={to} className="group flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 transition-all duration-300 hover:border-blue-200 hover:shadow-lg active:scale-[0.98]">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all duration-300 shadow-sm">
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <span className="font-black text-slate-700 text-[11px] uppercase tracking-wider">{title}</span>
    </div>
    <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
  </Link>
)

const BadgeLight = ({ icon: Icon, label, highlight = false }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
    highlight ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400"
  }`}>
    <Icon size={12} className={highlight ? "text-emerald-500" : "text-slate-400"} />
    {label}
  </div>
)

const CompetitionRow = ({ comp }) => (
  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-white transition-all group">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 font-black text-blue-600 italic shadow-sm text-sm">
        {new Date(comp.fecha).getDate()}
      </div>
      <div>
        <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight">{comp.nombre}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          {comp.piscina}M • {new Date(comp.fecha).toLocaleDateString()}
        </p>
      </div>
    </div>
    <span className="text-[10px] font-black bg-white text-emerald-600 px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-sm uppercase italic">
      {Math.ceil((new Date(comp.fecha) - new Date()) / (1000 * 60 * 60 * 24))}d
    </span>
  </div>
)

const EmptyEvents = () => (
  <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
    <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest italic">Sin eventos próximos</p>
  </div>
)

const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto py-8 animate-pulse space-y-6">
    <div className="h-8 bg-slate-100 w-40 rounded-2xl" />
    <div className="h-40 bg-slate-100 rounded-2xl" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
    </div>
  </div>
)

const ErrorState = ({ error }) => (
  <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-2xl border border-red-100 text-center shadow-xl">
    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-6">
      <ShieldCheck size={32} />
    </div>
    <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter">Error de Conexión</h2>
    <p className="text-slate-500 text-xs mb-8 font-bold uppercase tracking-[0.2em]">{error?.message || "Enlace de datos caído"}</p>
    <button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl">
      Reintentar
    </button>
  </div>
)

export default MiPerfil
