import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getNadadorById } from "../../api/profesor.api"
import {
  ArrowLeft, Trophy, BarChart3, Calendar, Weight,
  Ruler, Fingerprint, Waves, ExternalLink,
  ShieldCheck, RefreshCcw, Target, Zap, AlertCircle,
  GraduationCap, Mail, UserRound, Phone, ShieldAlert
} from "lucide-react"

const NadadorDetalle = () => {
  const { id } = useParams()

  const { data: nadador, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["nadador", id],
    queryFn:  async () => (await getNadadorById(id)).data,
    enabled:  !!id,
    staleTime: 1000 * 60 * 10,
  })

  const fechaFormateada = useMemo(() => {
    if (!nadador?.fechaNacimiento) return "No registrado"
    return new Date(nadador.fechaNacimiento).toLocaleDateString("es-ES", {
      year: "numeric", month: "2-digit", day: "2-digit"
    })
  }, [nadador?.fechaNacimiento])

  if (isLoading) return <LoadingState />
  if (isError || !nadador) return <ErrorState error={error} />

  const esFormativo = nadador.rama === "formativo"

  return (
    <div className="max-w-5xl mx-auto space-y-5 md:space-y-8 animate-fade-in pb-8 px-4 sm:px-6 lg:px-8">

      {/* NAV */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <Link to="/profesor/nadadores" className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-black text-[11px] uppercase tracking-[0.2em] hidden sm:block">Plantel</span>
        </Link>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {isFetching && (
            <div className="flex items-center gap-1.5 text-blue-500 shrink-0">
              <RefreshCcw size={11} className="animate-spin" />
              <span className="text-[10px] font-black uppercase hidden md:block">Sincronizando</span>
            </div>
          )}
          <div className={`shrink-0 inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border-2 text-[10px] sm:text-[11px] font-black uppercase ${
            nadador.pagoAlDia
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-orange-50 border-orange-200 text-orange-700"
          }`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${nadador.pagoAlDia ? "bg-emerald-500 animate-pulse" : "bg-orange-400"}`} />
            <span className="truncate max-w-[120px] sm:max-w-none">{nadador.pagoAlDia ? "Cuenta Activa" : "Cuenta Inactiva"}</span>
            {nadador.fechaUltimoPago && nadador.pagoAlDia && (
              <span className="opacity-60 font-bold normal-case text-[10px] hidden sm:inline">
                · {new Date(nadador.fechaUltimoPago).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="relative group overflow-hidden bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 border border-slate-100 shadow-lg">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-10">
          {/* Avatar */}
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

          {/* Info */}
          <div className="text-center sm:text-left space-y-3 flex-1 min-w-0 w-full">
            {/* Badges */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap">
                <Target size={11} /> {nadador.categoria || "Sin Categoría"}
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border whitespace-nowrap ${
                esFormativo
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
                {esFormativo ? <GraduationCap size={11} /> : <Trophy size={11} />}
                Rama {esFormativo ? "Formativa" : "Competitiva"}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] italic leading-[0.9] text-slate-900 uppercase break-words">
              {nadador.user?.nombre} <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                {nadador.apellido}
              </span>
            </h1>

            <div className="flex flex-wrap justify-center sm:justify-start gap-3 md:gap-4 pt-3 border-t border-slate-100">
              <DataLabel icon={Fingerprint} label="RUT"  value={nadador.rut || "N/A"} />
              <DataLabel icon={Calendar}    label="Edad" value={`${nadador.edad || "--"} años`} />
              <DataLabel icon={Mail}    label="Correo" value={`${nadador.user?.correo || "--"}`} isEmail />
            </div>
          </div>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5">
        <MetricCard icon={Calendar} title="Nacimiento" value={fechaFormateada} color="blue" />
        <MetricCard icon={Weight}   title="Masa"       value={nadador.peso   ? `${nadador.peso} kg`   : "--"} color="indigo" />
        <MetricCard icon={Ruler}    title="Estatura"   value={nadador.altura ? `${nadador.altura} cm` : "--"} color="emerald" className="col-span-2 sm:col-span-1" />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">

        {/* ESPECIALIDADES */}
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 shrink-0">
              <Waves size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg md:text-xl italic truncate">Especialidades</h3>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">Enfoque Técnico</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {nadador.pruebasEspecialidad?.length > 0 ? (
              nadador.pruebasEspecialidad.map((prueba, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-white transition-all">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] sm:text-[11px] break-words">{prueba}</span>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center">
                <p className="text-slate-400 font-bold italic text-xs sm:text-sm uppercase tracking-widest">Sin especialidades definidas</p>
              </div>
            )}
          </div>
        </div>

        {/* ACCIONES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4 h-full">
          <SidebarAction
            to={`/profesor/nadador/${id}/competencias`}
            icon={Trophy}
            title="Competencias"
            subtitle="Ver historial"
            color="blue"
          />
          <SidebarAction
            to={`/profesor/nadador/${id}/ranking`}
            icon={BarChart3}
            title="Ranking"
            subtitle="Top tiempos"
            color="emerald"
          />
          <Link
            to={`/profesor/nadadores/editar/${id}`}
            className="sm:col-span-2 lg:col-span-1 group flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all h-full min-h-[60px]"
          >
            <span className="font-black text-[11px] uppercase tracking-wider">Editar Perfil</span>
          </Link>
        </div>
      </div>

      {/* SECCIÓN MENORES DE EDAD */}
      {nadador.edad < 18 && (
        <div className="bg-amber-50 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 border border-amber-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200 shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-amber-900 uppercase tracking-tighter text-lg md:text-xl italic text-left truncate">Info. Apoderado</h3>
              <p className="text-[10px] md:text-[11px] font-bold text-amber-600 uppercase tracking-widest text-left truncate">Atleta menor de edad</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white/60 p-4 rounded-2xl border border-amber-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <UserRound size={18} />
              </div>
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest truncate">Apoderado</span>
                <span className="font-black text-slate-800 uppercase italic text-xs sm:text-sm truncate">{nadador.nombreApoderado || "No registrado"}</span>
              </div>
            </div>

            <div className="bg-white/60 p-4 rounded-2xl border border-amber-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Mail size={18} />
              </div>
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest truncate">Correo</span>
                <span className="font-black text-slate-800 lowercase text-xs sm:text-sm truncate block w-full">{nadador.correoApoderado || "No registrado"}</span>
              </div>
            </div>

            <div className="bg-white/60 p-4 rounded-2xl border border-amber-100 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Phone size={18} />
              </div>
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest truncate">Emergencia</span>
                <a href={`tel:${nadador.telefonoApoderado}`} className="font-black text-blue-600 hover:text-blue-700 uppercase italic text-xs sm:text-sm transition-colors truncate">
                  {nadador.telefonoApoderado || "No registrado"}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DataLabel = ({ icon: Icon, label, value, isEmail = false }) => (
  <div className="flex items-center gap-2 max-w-full">
    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
      <Icon size={13} />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">{label}</span>
      <span className={`text-[11px] sm:text-xs font-black text-slate-700 leading-tight truncate ${isEmail ? 'lowercase' : 'uppercase italic'}`}>
        {value}
      </span>
    </div>
  </div>
)

const MetricCard = ({ title, value, icon: Icon, color, className = "" }) => {
  const styles = {
    blue:   "text-blue-600 bg-blue-50 border-blue-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald:"text-emerald-600 bg-emerald-50 border-emerald-100",
    amber:  "text-amber-600 bg-amber-50 border-amber-100"
  }
  return (
    <div className={`bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-center items-center sm:items-start text-center sm:text-left ${className}`}>
      <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform ${styles[color]} border shrink-0`}>
        <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
      </div>
      <div className="w-full min-w-0">
        <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 truncate">{title}</p>
        <p className="text-sm sm:text-base md:text-lg font-black text-slate-900 italic tracking-tighter uppercase leading-tight truncate">{value}</p>
      </div>
    </div>
  )
}

const SidebarAction = ({ to, icon: Icon, title, subtitle, color }) => (
  <Link to={to} className="group flex items-center justify-between bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-900 transition-all duration-500 w-full overflow-hidden">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className={`p-2 sm:p-3 rounded-xl transition-all group-hover:bg-white/10 group-hover:text-white shrink-0 ${
        color === "blue" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
      }`}>
        <Icon size={18} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-black text-slate-900 group-hover:text-white text-xs sm:text-sm md:text-base uppercase tracking-tight italic transition-colors leading-none truncate block w-full">{title}</span>
        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 group-hover:text-blue-400 uppercase tracking-widest mt-1 truncate block w-full">{subtitle}</span>
      </div>
    </div>
    <ExternalLink size={16} className="text-slate-200 group-hover:text-white transition-all group-hover:translate-x-1 shrink-0 ml-2" />
  </Link>
)

const LoadingState = () => (
  <div className="max-w-5xl mx-auto space-y-5 animate-pulse pb-8 px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
      <div className="h-8 w-24 bg-slate-100 rounded-full" />
      <div className="h-7 w-32 bg-slate-100 rounded-full" />
    </div>
    <div className="bg-white rounded-2xl p-5 border border-slate-100">
      <div className="flex gap-5">
        <div className="w-20 h-20 bg-slate-200 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-6 bg-slate-100 rounded-lg w-24" />
            <div className="h-6 bg-slate-100 rounded-lg w-28" />
          </div>
          <div className="h-8 bg-slate-200 rounded-xl w-48 max-w-full" />
          <div className="h-6 bg-slate-200 rounded-xl w-32" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
    </div>
  </div>
)

const ErrorState = ({ error }) => (
  <div className="max-w-lg mx-auto mt-12 bg-white p-6 sm:p-8 rounded-2xl text-center border border-red-100 shadow-xl mx-4">
    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-6">
      <AlertCircle size={32} />
    </div>
    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter">Acceso Interrumpido</h2>
    <p className="text-slate-500 text-xs sm:text-sm mb-8 font-medium">No se pudo localizar el registro del atleta.</p>
    <Link to="/profesor/nadadores" className="bg-slate-900 hover:bg-blue-600 text-white px-6 sm:px-8 py-4 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest transition-all inline-flex items-center gap-2 shadow-lg">
      <ArrowLeft size={14} /> Regresar al Panel
    </Link>
  </div>
)

export default NadadorDetalle