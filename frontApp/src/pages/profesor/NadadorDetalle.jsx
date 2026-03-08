import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getNadadorById } from "../../api/profesor.api"
import { 
  ArrowLeft, Trophy, BarChart3, Calendar, Weight, 
  Ruler, Fingerprint, Waves, Loader2, ExternalLink,
  ShieldCheck, RefreshCcw
} from "lucide-react"

const NadadorProfile = () => {
  const { id } = useParams()

  const {
    data: nadador,
    isLoading,
    isError,
    error,
    isFetching
  } = useQuery({
    queryKey: ["nadador", id],
    queryFn: async () => {
      const res = await getNadadorById(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, 
    cacheTime: 1000 * 60 * 30,
  })

  // Memoizar la fecha para no recalcular en cada pequeño re-render
  const fechaFormateada = useMemo(() => {
    if (!nadador?.fechaNacimiento) return "No registrado";
    return new Date(nadador.fechaNacimiento).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: '2-digit'
    });
  }, [nadador?.fechaNacimiento]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <div className="relative flex items-center justify-center">
          <Loader2 size={48} className="animate-spin text-blue-600 z-10" />
          <Waves className="absolute text-blue-50 animate-pulse scale-150" size={80} />
        </div>
        <p className="font-black text-[10px] uppercase tracking-[0.4em] mt-10 animate-pulse">
          Sincronizando Expediente...
        </p>
      </div>
    )
  }

  if (isError || !nadador) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white border border-red-100 p-8 md:p-12 rounded-[2.5rem] text-center shadow-xl shadow-red-900/5 animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-slate-900 text-xl font-black mb-2 uppercase tracking-tighter">Fallo de Autenticidad</h2>
        <p className="text-slate-500 text-sm mb-8">
          {error?.response?.status === 404 
            ? "El registro del nadador no existe o fue removido." 
            : "Error de comunicación con el servidor central."}
        </p>
        <Link 
          to="/profesor/nadadores" 
          className="bg-[#0f172a] hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all inline-block shadow-lg"
        >
          Regresar a la Lista
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 px-4 md:px-0">
      
      {/* NAVEGACIÓN Y STATUS */}
      <div className="flex items-center justify-between">
        <Link 
          to="/profesor/nadadores" 
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Panel Central
        </Link>
        
        {isFetching ? (
          <div className="flex items-center gap-2 text-blue-500 bg-blue-50 px-3 py-1 rounded-lg">
            <RefreshCcw size={12} className="animate-spin" />
            <span className="text-[9px] font-black uppercase">Actualizando</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
            <ShieldCheck size={12} />
            Registro ÑSF
          </div>
        )}
      </div>

      {/* HEADER TIPO TARJETA DEPORTIVA */}
      <div className="bg-[#0f172a] rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-blue-600/20 transition-colors" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-5xl md:text-6xl font-black shadow-2xl border-4 border-white/5 transform transition-transform group-hover:scale-105 duration-500 shrink-0 uppercase">
            {nadador.user?.nombre?.charAt(0) || "N"}
          </div>

          <div className="text-center md:text-left">
            <div className="inline-block bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">
              {nadador.categoria || 'Nivel Club'}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none mb-4">
              {nadador.user?.nombre} <span className="text-blue-500">{nadador.apellido}</span>
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
              <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Fingerprint size={14} className="text-blue-500" /> {nadador.rut || 'No registra'}
              </span>
              <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Calendar size={14} className="text-blue-500" /> {nadador.edad || '--'} Años
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MÉTRICAS BIOMÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={Calendar} title="Nacimiento" value={fechaFormateada} color="blue" />
        <StatCard icon={Weight} title="Peso Corp." value={`${nadador.peso || '--'} kg`} color="indigo" />
        <StatCard icon={Ruler} title="Estatura" value={`${nadador.altura || '--'} cm`} color="emerald" />
        <StatCard icon={Trophy} title="Plantel" value="ACTIVO" color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* LISTADO DE ESPECIALIDADES */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Waves size={20} />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">Pruebas de Especialidad</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {nadador.pruebasEspecialidad?.length > 0 ? (
              nadador.pruebasEspecialidad.map((prueba, index) => (
                <div
                  key={index}
                  className="bg-slate-50 border border-slate-100 text-slate-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:bg-white hover:text-blue-600 transition-all cursor-default shadow-sm"
                >
                  {prueba}
                </div>
              ))
            ) : (
              <div className="w-full py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 text-xs font-bold italic">Sin especialidades registradas.</p>
              </div>
            )}
          </div>
        </div>

        {/* ACCIONES SECUNDARIAS */}
        <div className="space-y-4">
          <ActionLink 
            to={`/profesor/nadador/${id}/competencias`}
            icon={Trophy}
            title="Competencias"
            subtitle="Historial de Marcas"
            color="blue"
          />
          <ActionLink 
            to={`/profesor/nadador/${id}/ranking`}
            icon={BarChart3}
            title="Ranking Pruebas"
            subtitle="Mejores Tiempos"
            color="amber"
          />
        </div>

      </div>
    </div>
  )
}

// Sub-componentes para mayor limpieza y performance
const StatCard = ({ title, value, icon: Icon, color }) => {
  const themes = {
    blue: "text-blue-600 bg-blue-50",
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50"
  }
  
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className={`w-10 h-10 ${themes[color]} rounded-xl flex items-center justify-center mb-4`}>
        <Icon size={20} />
      </div>
      <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{title}</p>
      <p className="text-lg md:text-xl font-black text-slate-800 tabular-nums truncate">{value}</p>
    </div>
  )
}

const ActionLink = ({ to, icon: Icon, title, subtitle, color }) => {
  const colors = {
    blue: "hover:bg-blue-600 group-hover:bg-blue-50",
    amber: "hover:bg-amber-500 group-hover:bg-amber-50"
  }
  
  return (
    <Link
      to={to}
      className={`group flex items-center justify-between bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-500 ${color === 'blue' ? 'hover:bg-blue-600' : 'hover:bg-amber-500'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl transition-colors ${color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-white/20 group-hover:text-white' : 'bg-amber-50 text-amber-600 group-hover:bg-white/20 group-hover:text-white'}`}>
          <Icon size={22} />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-slate-800 group-hover:text-white text-sm uppercase tracking-tight">{title}</span>
          <span className="text-[9px] font-bold text-slate-400 group-hover:text-white/70 uppercase tracking-widest">{subtitle}</span>
        </div>
      </div>
      <ExternalLink size={18} className="text-slate-300 group-hover:text-white transition-colors shrink-0" />
    </Link>
  )
}

export default NadadorProfile;