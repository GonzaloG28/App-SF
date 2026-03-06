import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getNadadorById } from "../../api/profesor.api"
import { 
  User, 
  ArrowLeft, 
  Trophy, 
  BarChart3, 
  Calendar, 
  Weight, 
  Ruler, 
  Fingerprint, 
  Waves, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  RefreshCcw
} from "lucide-react"

const NadadorProfile = () => {
  const { id } = useParams()

  // 1. OBTENCIÓN DE DATOS CON CACHÉ INTELIGENTE
  const {
    data: nadador,
    isLoading,
    isError,
    error,
    isFetching // Para saber si se está actualizando en segundo plano
  } = useQuery({
    queryKey: ["nadador", id],
    queryFn: async () => {
      const res = await getNadadorById(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // Los datos biométricos no cambian tan seguido (10 min de frescura)
    cacheTime: 1000 * 60 * 30, // Mantener en memoria 30 min
  })

  // LOADER DE ESTADO INICIAL
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <div className="relative">
          <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
          <Waves className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-100 -z-10 animate-pulse" size={80} />
        </div>
        <p className="font-black text-[10px] uppercase tracking-[0.4em] mt-8">Sincronizando Expediente...</p>
      </div>
    )
  }

  // MANEJO DE ERRORES
  if (isError) {
    return (
      <div className="max-w-2xl mx-auto mt-20 bg-white border border-red-100 p-12 rounded-[3rem] text-center shadow-xl shadow-red-900/5">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-slate-900 text-2xl font-black mb-2 italic tracking-tighter">ERROR DE ACCESO</h2>
        <p className="text-slate-500 text-sm font-medium mb-8">
          {error?.response?.status === 404 
            ? "El nadador solicitado no existe en la base de datos." 
            : "No se pudo establecer conexión con el servidor de registros."}
        </p>
        <Link 
          to="/profesor/nadadores" 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all inline-block"
        >
          Regresar al Equipo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex items-center justify-between">
        <Link 
          to="/profesor/nadadores" 
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Equipo
        </Link>
        
        {/* Indicador de actualización en segundo plano */}
        {isFetching ? (
          <div className="flex items-center gap-2 text-blue-400 animate-pulse">
            <RefreshCcw size={12} className="animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Actualizando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <ShieldCheck size={12} />
            Perfil Verificado ÑSF
          </div>
        )}
      </div>

      {/* HEADER DE IDENTIDAD (DARK MODE STYLE) */}
      <div className="bg-[#0f172a] rounded-[3.5rem] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden group">
        {/* Decoración de fondo interactiva */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-blue-600/20 transition-colors duration-700"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          {/* Avatar Pro con Inicial */}
          <div className="w-36 h-36 rounded-[3rem] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center text-6xl font-black shadow-2xl border-4 border-white/10 transform transition-transform group-hover:scale-105 duration-500">
            {nadador.user?.nombre?.charAt(0)}
          </div>

          <div className="text-center md:text-left space-y-4">
            <div className="inline-block bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              {nadador.categoria || 'Nivel Club'}
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic leading-none">
              {nadador.user?.nombre} <span className="text-blue-500">{nadador.apellido}</span>
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
              <span className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <Fingerprint size={16} className="text-blue-500" /> {nadador.rut}
              </span>
              <span className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <Calendar size={16} className="text-blue-500" /> {nadador.edad} años
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE MÉTRICAS BIOMÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Calendar} title="Fecha Nacimiento" value={nadador.fechaNacimiento ? new Date(nadador.fechaNacimiento).toLocaleDateString('es-ES', {year: 'numeric', month: 'short', day: '2-digit'}) : "No reg."} color="blue" />
        <StatCard icon={Weight} title="Peso Corporal" value={`${nadador.peso || '--'} kg`} color="indigo" />
        <StatCard icon={Ruler} title="Estatura" value={`${nadador.altura || '--'} cm`} color="emerald" />
        <StatCard icon={Trophy} title="Estado Plantel" value="ACTIVO" color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* ESPECIALIDADES */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Waves size={20} />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">Pruebas de Especialidad</h3>
            </div>

            <div className="flex flex-wrap gap-4">
              {nadador.pruebasEspecialidad?.length > 0 ? (
                nadador.pruebasEspecialidad.map((prueba, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-slate-50 text-slate-600 px-6 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-900/5 transition-all cursor-default"
                  >
                    {prueba}
                  </div>
                ))
              ) : (
                <div className="w-full py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-bold italic">Sin especialidades registradas.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-50">
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Última actualización: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* ACCIONES RÁPIDAS / NAVEGACIÓN */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Análisis de Datos</h3>
          
          <Link
            to={`/profesor/nadador/${id}/competencias`}
            className="group flex items-center justify-between bg-white hover:bg-blue-600 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-white/20 group-hover:text-white transition-colors">
                <Trophy size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-800 group-hover:text-white text-md uppercase tracking-tight">Competencias</span>
                <span className="text-[9px] font-bold text-slate-400 group-hover:text-blue-100 uppercase tracking-widest">Historial completo</span>
              </div>
            </div>
            <ExternalLink size={20} className="text-slate-300 group-hover:text-white transition-colors" />
          </Link>

          <Link
            to={`/profesor/nadador/${id}/ranking`}
            className="group flex items-center justify-between bg-white hover:bg-amber-500 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-white/20 group-hover:text-white transition-colors">
                <BarChart3 size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-800 group-hover:text-white text-md uppercase tracking-tight">Ranking Pruebas</span>
                <span className="text-[9px] font-bold text-slate-400 group-hover:text-amber-100 uppercase tracking-widest">Mejores Marcas</span>
              </div>
            </div>
            <ExternalLink size={20} className="text-slate-300 group-hover:text-white transition-colors" />
          </Link>
        </div>

      </div>
    </div>
  )
}

// Componente StatCard con hover mejorado
const StatCard = ({ title, value, icon: Icon, color }) => {
  const themes = {
    blue: "text-blue-600 bg-blue-50",
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50"
  }
  
  return (
    <div className="group bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
      <div className={`w-12 h-12 ${themes[color]} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12`}>
        <Icon size={24} />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-800 tabular-nums">{value}</p>
    </div>
  )
}

export default NadadorProfile