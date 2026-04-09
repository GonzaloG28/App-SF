import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../api/axios"
import { useState, useMemo, memo } from "react"
import {
  Trophy, BarChart3, Calendar, Weight, Dumbbell,
  Ruler, Fingerprint, Target, ShieldCheck,
  Clock, Zap, ChevronRight,
  Mail, Check, X, AlertCircle, Lock, GraduationCap
} from "lucide-react"

// ── CAMBIO DE CORREO ─────────────────────────────────────────────────
const CambiarCorreo = ({ perfil }) => {
  const queryClient = useQueryClient()
  const [editando, setEditando] = useState(false)
  const [correo, setCorreo] = useState("")
  const [error, setError] = useState("")

  const { puedeEditar, diasRestantes, fechaDisponible } = useMemo(() => {
    const lastChange = perfil?.user?.lastEmailChange
    if (!lastChange) return { puedeEditar: true, diasRestantes: 0, fechaDisponible: null }
    const MS = 14 * 24 * 60 * 60 * 1000
    const pasados = Date.now() - new Date(lastChange).getTime()
    if (pasados >= MS) return { puedeEditar: true, diasRestantes: 0, fechaDisponible: null }
    const dias = Math.ceil((MS - pasados) / (24 * 60 * 60 * 1000))
    const fecha = new Date(new Date(lastChange).getTime() + MS)
      .toLocaleDateString("es-ES", { day: "2-digit", month: "long" })
    return { puedeEditar: false, diasRestantes: dias, fechaDisponible: fecha }
  }, [perfil?.user?.lastEmailChange])

  const mutation = useMutation({
    mutationFn: () => api.put("/nadadores/perfil", { correo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miPerfil"] })
      queryClient.invalidateQueries({ queryKey: ["miPerfilNadador"] })
      setEditando(false); setCorreo(""); setError("")
    },
    onError: (err) => setError(err.response?.data?.message || "Error al actualizar")
  })

  const handleGuardar = () => {
    if (!correo.trim()) return setError("Escribe el nuevo correo")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError("Correo inválido")
    if (correo === perfil?.user?.correo) return setError("Es el mismo correo actual")
    setError(""); mutation.mutate()
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-blue-600 shrink-0" />
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Correo electrónico</span>
        </div>
        {!puedeEditar && (
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full shrink-0">
            <Clock size={11} />
            <span className="text-[10px] font-black uppercase tracking-wider">{diasRestantes}d restantes</span>
          </div>
        )}
      </div>

      <div className={`flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border-2 ${editando ? "border-blue-200 bg-blue-50/30" : "border-slate-100 bg-slate-50"}`}>
        <span className="text-xs sm:text-sm font-bold text-slate-700 flex-1 min-w-0 truncate">{perfil?.user?.correo || "—"}</span>
        {!editando && (
          puedeEditar
            ? <button onClick={() => setEditando(true)} className="shrink-0 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800">Cambiar</button>
            : <div className="flex items-center gap-1 text-slate-400 shrink-0"><Lock size={13} /><span className="text-[10px] font-black uppercase hidden xs:inline">Bloqueado</span></div>
        )}
      </div>

      {!puedeEditar && (
        <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-relaxed px-1">
          Podrás cambiar tu correo el <span className="font-black text-slate-600">{fechaDisponible}</span>. Solo 1 cambio cada 14 días.
        </p>
      )}

      {editando && (
        <div className="space-y-3">
          <input type="email" placeholder="Nuevo correo" value={correo}
            onChange={e => { setCorreo(e.target.value); setError("") }}
            className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
            autoFocus
          />
          {error && <div className="flex items-center gap-2 text-orange-600 text-[11px] font-black uppercase"><AlertCircle size={13} className="shrink-0" /> <span className="break-words">{error}</span></div>}
          <div className="flex flex-col xs:flex-row gap-2">
            <button onClick={handleGuardar} disabled={mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
            >
              {mutation.isPending ? "Guardando..." : <><Check size={14} /> Confirmar</>}
            </button>
            <button onClick={() => { setEditando(false); setCorreo(""); setError("") }}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-medium px-1">Después no podrás cambiar el correo por 14 días.</p>
        </div>
      )}
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────
const MiPerfil = () => {
  const { data: nadador, isLoading, isError, error } = useQuery({
    queryKey: ["miPerfilNadador"],
    queryFn: () => api.get("/nadadores/perfil").then(r => r.data),
  })

  const { data: convocatorias = [] } = useQuery({
    queryKey: ["misConvocatoriasPerfil"],
    queryFn: () => api.get("/convocatorias/mis-convocatorias").then(r => r.data),
    enabled: !!nadador,
    staleTime: 1000 * 60 * 5,
  })

  const proximasConv = convocatorias
    .filter(c => new Date(c.fechaFin) >= new Date())
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
    .slice(0, 2)

  const fechaFormateada = useMemo(() => {
    if (!nadador?.fechaNacimiento) return "No registrado"
    return new Date(nadador.fechaNacimiento).toLocaleDateString("es-ES", {
      year: "numeric", month: "2-digit", day: "2-digit"
    })
  }, [nadador?.fechaNacimiento])

  if (isLoading) return <ProfileSkeleton />
  if (isError) return <ErrorState error={error} />

  const esFormativo = nadador.rama === "formativo"

  return (
    <div className="space-y-5 animate-fade-in pb-8 max-w-[100vw] overflow-x-hidden px-2 sm:px-0">

      {/* HEADER ADAPTATIVO */}
      <header className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-3 border-b border-slate-100 pb-5">
        <div className="min-w-0 w-full sm:w-auto">
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-1 block italic">Perfil</span>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none truncate">Mi Perfil</h2>
        </div>
        <div className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-2xl border-2 text-[10px] sm:text-[11px] font-black uppercase w-full sm:w-auto justify-center sm:justify-start ${
            nadador.pagoAlDia
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-orange-50 border-orange-200 text-orange-700"
          }`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${nadador.pagoAlDia ? "bg-emerald-500 animate-pulse" : "bg-orange-400"}`} />
            <span className="truncate">{nadador.pagoAlDia ? "Cuenta Activa" : "Cuenta Inactiva"}</span>
            {nadador.fechaUltimoPago && nadador.pagoAlDia && (
              <span className="opacity-60 font-bold normal-case text-[9px] sm:text-[10px] shrink-0">
                · {new Date(nadador.fechaUltimoPago).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}
              </span>
            )}
          </div>
      </header>

      {/* HERO RESPONSIVE */}
      <section className="relative group overflow-hidden bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-100 shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-blue-500/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 md:gap-8 text-center sm:text-left">
          
          <div className="relative shrink-0">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-4xl md:text-5xl font-black italic text-white shadow-xl ${
              esFormativo
                ? "bg-gradient-to-br from-green-500 to-green-700 shadow-green-600/20"
                : "bg-gradient-to-br from-blue-600 to-green-500 shadow-blue-600/20"
            }`}>
              {nadador.user?.nombre?.charAt(0) || "N"}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-xl shadow-lg">
              <Zap size={14} fill="currentColor" className="text-green-400" />
            </div>
          </div>

          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em]">
                <Target size={11} className="shrink-0" /> 
                <span className="truncate">{nadador.categoria || "Sin Categoría"}</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] border ${
                esFormativo
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
                {esFormativo ? <GraduationCap size={11} className="shrink-0" /> : <Trophy size={11} className="shrink-0" />}
                <span className="truncate">Rama {esFormativo ? "Formativa" : "Competitiva"}</span>
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] italic leading-tight sm:leading-[0.9] text-slate-900 uppercase break-words w-full">
              {nadador.user?.nombre} <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent ml-1 sm:ml-0">{nadador.apellido}</span>
            </h1>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:flex lg:flex-wrap justify-center sm:justify-start gap-3 pt-3 border-t border-slate-100 mt-2">
                <DataLabel icon={Fingerprint} label="RUT"  value={nadador.rut || "N/A"} />
                <DataLabel icon={Calendar} title="Edad"     value={`${nadador.edad || "--"} años`} />
                <DataLabel icon={Mail}    label="Correo" value={`${nadador.user?.correo || "--"}`} />
            </div>
          </div>
        </div>
      </section>

      {/* MÉTRICAS ADAPTATIVAS (1 columna en móvil pequeño, 3 en pantallas más grandes) */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5">
        <StatCard icon={Calendar} title="Nacimiento" value={fechaFormateada} colorTheme="blue" />
        <StatCard icon={Weight}   title="Masa"     value={`${nadador.peso || "--"} kg`}    colorTheme="green" />
        <StatCard icon={Ruler}    title="Estatura" value={`${nadador.altura || "--"} cm`}  colorTheme="blue"  />
      </div>

      {/* CONTENIDO PRINCIPAL FLEXIBLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Columna principal — 2/3 */}
        <div className="lg:col-span-2 space-y-5 min-w-0">
          <CambiarCorreo perfil={nadador} />

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 shrink-0">
                  <Trophy size={16} />
                </div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tighter uppercase italic truncate">Próximas competencias</h3>
              </div>
              <Link to="/nadador/calendario" className="text-[9px] sm:text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shrink-0">
                Ver Todo
              </Link>
            </div>
            <div className="space-y-3">
              {proximasConv.length > 0 ? (
                proximasConv.map(c => <ConvocatoriaRow key={c._id} conv={c} />)
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 px-4">
                  <p className="text-slate-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest italic break-words">Sin convocatorias próximas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna lateral — 1/3 */}
        <div className="space-y-4 min-w-0">
          {/* Módulos */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Accesos Rápidos</h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 gap-2.5">
              <ActionLink to="/nadador/competencias"   title="Mis Competencias"    icon={Trophy}    />
              <ActionLink to="/nadador/mis-tiempos"    title="Mis marcas"  icon={BarChart3}  />
              <ActionLink to="/nadador/entrenamientos" title="Entrenamientos" icon={Dumbbell}  />
              <ActionLink to="/nadador/calendario"     title="Calendario"    icon={Calendar}   />
            </div>
          </div>

          {/* Especialidades */}
          {nadador.pruebasEspecialidad?.length > 0 && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Especialidades</h3>
              <div className="flex flex-wrap gap-2">
                {nadador.pruebasEspecialidad.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-black text-slate-700 uppercase tracking-wider truncate">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SUB-COMPONENTES ───────────────────────────────────────────────────

const ConvocatoriaRow = ({ conv }) => {
  const inicio  = new Date(conv.fechaInicio)
  const fin     = new Date(conv.fechaFin)
  const hoy     = new Date()
  const enCurso = inicio <= hoy && fin >= hoy
  const diasHasta = Math.ceil((inicio - hoy) / (1000 * 60 * 60 * 24))

  return (
    <div className="flex flex-row items-center gap-3 p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-white transition-all group">
      <div className={`shrink-0 w-10 sm:w-11 text-center p-1 sm:p-1.5 rounded-xl ${enCurso ? "bg-green-500 text-white" : "bg-blue-50 text-blue-700"}`}>
        <p className="text-[8px] sm:text-[9px] font-black uppercase">{inicio.toLocaleString("es-ES",{month:"short"})}</p>
        <p className="text-base sm:text-lg font-black leading-none">{inicio.getDate()}</p>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-slate-800 uppercase text-[10px] sm:text-[11px] tracking-tight truncate">{conv.nombre}</h4>
        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">{conv.lugar}</p>
      </div>
      {enCurso
        ? <span className="text-[8px] sm:text-[9px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full uppercase shrink-0">En curso</span>
        : diasHasta > 0
          ? <div className="text-right shrink-0 hidden xs:block"><p className="text-base sm:text-lg font-black text-blue-600 italic leading-none">{diasHasta}</p><p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase">días</p></div>
          : null
      }
    </div>
  )
}

const DataLabel = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 min-w-0 w-full xs:w-auto">
    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
      <Icon size={13} />
    </div>
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">{label}</span>
      <span className="text-[11px] sm:text-xs font-black text-slate-700 uppercase italic leading-tight truncate">{value}</span>
    </div>
  </div>
)

const StatCard = memo(({ title, value, icon: Icon, colorTheme }) => {
  const themes = {
    blue:  "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-emerald-600 bg-emerald-50 border-emerald-100",
  }
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group min-w-0">
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:rotate-6 transition-transform border shrink-0 ${themes[colorTheme]}`}>
        <Icon size={15} className="sm:w-[17px] sm:h-[17px]" strokeWidth={2.5} />
      </div>
      <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1 truncate">{title}</p>
      <p className="text-base sm:text-lg font-black text-slate-900 italic tracking-tighter uppercase tabular-nums truncate">{value}</p>
    </div>
  )
})

const ActionLink = ({ to, title, icon: Icon }) => (
  <Link to={to} className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white border border-slate-100 transition-all hover:border-blue-200 hover:shadow-md active:scale-[0.98] min-w-0">
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <div className="p-1.5 sm:p-2 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-lg transition-all shrink-0">
        <Icon size={14} className="sm:w-[15px] sm:h-[15px]" strokeWidth={2.5} />
      </div>
      <span className="font-black text-slate-700 text-[10px] sm:text-[11px] uppercase tracking-wider truncate">{title}</span>
    </div>
    <ChevronRight size={13} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
  </Link>
)

const BadgeLight = ({ icon: Icon, label, highlight = false }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shrink-0 max-w-full ${
    highlight ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400"
  }`}>
    <Icon size={12} className={`shrink-0 ${highlight ? "text-emerald-500" : "text-slate-400"}`} />
    <span className="truncate">{label}</span>
  </div>
)

const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-5 pb-8 px-2 sm:px-0">
    <div className="h-8 bg-slate-100 w-full max-w-[160px] rounded-2xl" />
    <div className="h-48 sm:h-36 bg-slate-100 rounded-2xl" />
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
      <div className="h-20 bg-slate-100 rounded-2xl" />
      <div className="h-20 bg-slate-100 rounded-2xl" />
      <div className="h-20 bg-slate-100 rounded-2xl" />
    </div>
  </div>
)

const ErrorState = ({ error }) => (
  <div className="max-w-xl mx-auto mt-16 p-6 sm:p-8 bg-white rounded-2xl border border-red-100 text-center shadow-xl m-4">
    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-6"><ShieldCheck size={32} /></div>
    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter">Error de Conexión</h2>
    <p className="text-slate-500 text-[10px] sm:text-xs mb-8 font-bold uppercase tracking-[0.2em] break-words">{error?.message}</p>
    <button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest transition-all">Reintentar</button>
  </div>
)

export default MiPerfil
