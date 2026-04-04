import { useMemo }                       from "react"
import { useQuery }                      from "@tanstack/react-query"
import { Link }                          from "react-router-dom"
import { getNadadores }                  from "../../api/profesor.api"
import api                               from "../../api/axios"
import {
  Users, Trophy, Calendar, UserPlus,
  CheckCircle2, Clock, ChevronRight,
  Loader2, Waves, MapPin, AlertCircle,
  Dumbbell, GraduationCap
} from "lucide-react"

const DashboardProfesor = () => {

  // ── Nadadores ───────────────────────────────────────────────────────
  const { data: nadadoresRes, isLoading: loadingNad } = useQuery({
    queryKey: ["nadadores-dashboard"],
    queryFn:  () => getNadadores({}),
    staleTime: 1000 * 60 * 5,
  })

  // ── Convocatorias próximas ──────────────────────────────────────────
  const { data: convocatorias = [], isLoading: loadingConv } = useQuery({
    queryKey: ["convocatorias"],
    queryFn:  () => api.get("/convocatorias").then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

  // ── Entrenamientos ─────────────────────────────────────────────────
  const { data: entrenamientos = [], isLoading: loadingEnt } = useQuery({
    queryKey: ["entrenamientos-dashboard"],
    queryFn:  () => api.get("/entrenamiento/reporte-profesor").then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

  const isLoading = loadingNad || loadingConv || loadingEnt

  // ── Cálculos ────────────────────────────────────────────────────────
  const nadadores = nadadoresRes?.data || []

  const stats = useMemo(() => {
    const total        = nadadores.length
    const competitivos = nadadores.filter(n => n.rama !== "formativo").length
    const formativos   = nadadores.filter(n => n.rama === "formativo").length
    const pagados      = nadadores.filter(n => n.pagoAlDia).length
    const pctPago      = total > 0 ? Math.round((pagados / total) * 100) : 0

    return { total, competitivos, formativos, pagados, pctPago }
  }, [nadadores])




  const entStats = useMemo(() => {
  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const delMes = entrenamientos.filter(e => new Date(e.fecha) >= inicioMes)

  const entrenosTerminadosAl100 = delMes.filter(e => {
    const terminados = e.completados || 0
    const total = e.totalAlumnos || 0
    
    return total > 0 && terminados === total
  })

  const totalDelMes = delMes.length
  const cantCompletados = entrenosTerminadosAl100.length
  const cantPendientes = totalDelMes - cantCompletados
  
  const pct = totalDelMes > 0 
    ? Math.round((cantCompletados / totalDelMes) * 100) 
    : 0

  return {
    total: totalDelMes,
    completados: cantCompletados,
    pendientes: cantPendientes,
    pct
  }
}, [entrenamientos])



  // Próximas 3 convocatorias
  const proximasConvocatorias = useMemo(() =>
    [...convocatorias]
      .filter(c => new Date(c.fechaFin) >= new Date())
      .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
      .slice(0, 3),
    [convocatorias]
  )

  // Último entrenamiento solamente
  const ultimoEntrenamiento = useMemo(() =>
    [...entrenamientos]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null,
    [entrenamientos]
  )

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="font-black tracking-[0.2em] text-[11px] uppercase italic text-slate-400">
        Sincronizando Sistema ÑSF...
      </p>
    </div>
  )

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-100 pb-6">
        <div>
          <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">High Performance Center</p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            Panel de <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">Gestión</span>
          </h1>
        </div>
        <Link
          to="/profesor/nadadores/nuevo"
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-slate-900 text-white px-7 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] self-start sm:self-auto"
        >
          <UserPlus size={18} strokeWidth={2.5} />
          Nuevo Nadador
        </Link>
      </div>

      {/* ── STATS PRINCIPALES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">

        {/* Total nadadores */}
        <StatCard
          label="Total Plantel"
          value={stats.total}
          sub={`${stats.competitivos} comp. · ${stats.formativos} form.`}
          icon={Users}
          color="blue"
        />

        {/* Cuentas al día */}
        <StatCard
          label="Cuentas al Día"
          value={`${stats.pctPago}%`}
          sub={`${stats.pagados} de ${stats.total} nadadores`}
          icon={CheckCircle2}
          color={stats.pctPago >= 80 ? "green" : stats.pctPago >= 50 ? "orange" : "red"}
        />

        {/* Próximas convocatorias */}
        <StatCard
          label="Convocatorias"
          value={proximasConvocatorias.length}
          sub={proximasConvocatorias.length > 0 ? "eventos próximos" : "sin eventos"}
          icon={Calendar}
          color="purple"
        />

        {/* Entrenamientos del mes */}
        <StatCard
          label="Entrenos del Mes"
          value={entStats.total}
          // FIX: Ahora mostrará "X comp. · Y pend." en la tarjeta
          sub={`${entStats.completados} comp. · ${entStats.pendientes} pend.`}
          icon={Dumbbell}
          color="orange"
        />
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">

        {/* Columna izquierda — 2/3 */}
        <div className="lg:col-span-2 space-y-5">

          {/* PRÓXIMAS CONVOCATORIAS — datos reales */}
          <section className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <Calendar size={15} className="text-blue-600" /> Próximas Convocatorias
              </h3>
              <Link
                to="/profesor/calendario"
                className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
              >
                Ver todas
              </Link>
            </div>

            {proximasConvocatorias.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar size={28} className="mx-auto text-slate-200 mb-3" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin convocatorias próximas</p>
                <Link to="/profesor/convocatoria/nueva"
                  className="mt-3 inline-flex items-center gap-1.5 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:underline"
                >
                  + Crear convocatoria
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {proximasConvocatorias.map((c) => {
                  const inicio   = new Date(c.fechaInicio)
                  const fin      = new Date(c.fechaFin)
                  const dias     = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1
                  const hoy      = new Date()
                  const enCurso  = inicio <= hoy && fin >= hoy
                  const diasHasta = Math.ceil((inicio - hoy) / (1000 * 60 * 60 * 24))

                  return (
                    <Link
                      key={c._id}
                      to={`/profesor/convocatoria/${c._id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-blue-50/30 transition-all group"
                    >
                      {/* Fecha */}
                      <div className={`shrink-0 w-12 text-center p-1.5 rounded-xl ${enCurso ? "bg-green-500 text-white" : "bg-blue-50 text-blue-700"}`}>
                        <p className="text-[9px] font-black uppercase">{inicio.toLocaleString("es-ES",{month:"short"})}</p>
                        <p className="text-xl font-black leading-none">{inicio.getDate()}</p>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="font-black text-slate-900 uppercase italic text-sm tracking-tight truncate">
                            {c.nombre}
                          </p>
                          {enCurso && (
                            <span className="text-[9px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full uppercase shrink-0">En curso</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {c.lugar}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {dias} {dias === 1 ? "día" : "días"}</span>
                          <span className="flex items-center gap-1"><Users size={10} /> {c.nadadores?.length || 0}</span>
                        </div>
                      </div>

                      {/* Días restantes */}
                      {!enCurso && diasHasta > 0 && (
                        <div className="shrink-0 text-right">
                          <p className="text-xl font-black text-blue-600 italic leading-none">{diasHasta}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase">días</p>
                        </div>
                      )}
                      <ChevronRight size={14} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          {/* ÚLTIMO ENTRENAMIENTO — estilo igual al nadador */}
          <Link
            to="/profesor/entrenamientos"
            className="block bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 group hover:shadow-2xl hover:border-blue-200 transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-3">
                <Dumbbell size={15} className="text-green-500" strokeWidth={2.5} /> Último Entrenamiento
              </h3>
              <div className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </div>

            {ultimoEntrenamiento ? (() => {
              const listaAtletas = ultimoEntrenamiento.totalAlumnos || []
              const completados = ultimoEntrenamiento.completados
              const pct         = listaAtletas > 0 ? Math.round((completados / listaAtletas) * 100) : 0
              const fecha       = new Date(ultimoEntrenamiento.fecha || ultimoEntrenamiento.createdAt)
              return (
                <div>
                  <h4 className="text-2xl md:text-3xl font-black italic text-slate-900 uppercase leading-none tracking-tighter mb-5 group-hover:text-blue-600 transition-colors">
                    {ultimoEntrenamiento.titulo || "Sesión General"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                      <Calendar size={13} className="text-blue-600" />
                      <p className="text-[11px] font-black italic text-blue-800 uppercase tracking-widest">
                        {fecha.toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"})}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <Users size={13} className="text-slate-500" />
                      <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                        {listaAtletas} atletas
                      </p>
                    </div>
                  </div>
                  {/* Barra de progreso grande */}
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                      <span>{completados} completados</span>
                      <span className={`font-black text-sm italic ${pct === 100 ? "text-emerald-600" : pct >= 50 ? "text-orange-500" : "text-slate-500"}`}>{pct}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-orange-400" : "bg-blue-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                      {pct === 100 ? "✓ Completado al 100%" : `${listaAtletas - completados} pendientes`}
                    </p>
                  </div>
                </div>
              )
            })() : (
              <div className="py-8 text-center">
                <Waves className="mx-auto mb-4 text-slate-100" size={36} />
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">Sin entrenamientos registrados</p>
                <Link to="/profesor/crear-entrenamiento" onClick={e => e.stopPropagation()}
                  className="mt-3 inline-flex items-center gap-1.5 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:underline"
                >
                  + Crear entrenamiento
                </Link>
              </div>
            )}
          </Link>
        </div>

        {/* ── Columna derecha — 1/3 ── */}
        <div className="space-y-5">

          {/* RESUMEN DE PAGOS */}
          <section className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] flex items-center gap-2 mb-5">
              <CheckCircle2 size={15} className="text-emerald-600" /> Estado de Cuentas
            </h3>

            {/* Barra visual */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                <span>{stats.pagados} al día</span>
                <span>{stats.total - stats.pagados} pendientes</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    stats.pctPago >= 80 ? "bg-emerald-500" :
                    stats.pctPago >= 50 ? "bg-orange-400" : "bg-red-500"
                  }`}
                  style={{ width: `${stats.pctPago}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-emerald-700 italic">{stats.pagados}</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Al día</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-orange-700 italic">{stats.total - stats.pagados}</p>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-0.5">Pendientes</p>
              </div>
            </div>

            <Link to="/profesor/nadadores"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Ver plantel completo
            </Link>
          </section>

          {/* DISTRIBUCIÓN DEL PLANTEL */}
          <section className="bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl md:rounded-[2.5rem] p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
              <Waves size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="font-black uppercase tracking-[0.3em] text-white/80 text-[10px] mb-4">Distribución Plantel</h3>
              <div className="space-y-2.5">
                <DistRow label="Competitivos" value={stats.competitivos} total={stats.total} icon={Trophy} />
                <DistRow label="Formativos"   value={stats.formativos}   total={stats.total} icon={GraduationCap} />
              </div>
              <div className="mt-5 pt-4 border-t border-white/20 flex justify-between items-center">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Total</p>
                <p className="text-2xl font-black italic">{stats.total}</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

// ── Sub-componentes ─────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon: Icon, color }) => {
  const themes = {
    blue:   "text-blue-600 bg-blue-50 border-blue-100",
    green:  "text-emerald-600 bg-emerald-50 border-emerald-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    red:    "text-red-600 bg-red-50 border-red-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
  }
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border ${themes[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-black text-slate-900 italic leading-none">{value}</p>
      {sub && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">{sub}</p>}
    </div>
  )
}

const DistRow = ({ label, value, total, icon: Icon }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <Icon size={13} className="text-white/60 shrink-0" />
      <div className="flex-1">
        <div className="flex justify-between text-[10px] font-black text-white/80 mb-1">
          <span>{label}</span>
          <span>{value}</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

export default DashboardProfesor
