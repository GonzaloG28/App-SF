import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import api from "../../api/axios" // Tu instancia de axios
import { 
  User, Trophy, BarChart3, Calendar, Weight, 
  Ruler, Fingerprint, Waves, Loader2, ExternalLink 
} from "lucide-react"

const MiPerfil = () => {
  // 1. Obtenemos el perfil del nadador logueado
  const {
    data: nadador,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["miPerfilNadador"],
    queryFn: () => api.get("/nadadores/perfil").then(res => res.data), // Ajusta según tu ruta de backend
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <p className="font-black text-[10px] uppercase tracking-[0.4em]">Cargando tu Expediente...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto mt-20 bg-red-50 border border-red-100 p-8 rounded-[2.5rem] text-center">
        <h2 className="text-red-800 font-black mb-2">Error de Sincronización</h2>
        <p className="text-red-600 text-sm">{error.message || "No se pudo cargar tu perfil."}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER DE BIENVENIDA */}
      <div className="flex items-center justify-between">
        <h2 className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">
          Información de Atleta
        </h2>
        <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          Perfil Oficial ÑSF
        </div>
      </div>

      {/* CARD DE IDENTIDAD (DARK MODE STYLE) */}
      <div className="bg-[#0f172a] rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-5xl font-black shadow-xl border-4 border-white/10">
            {nadador.user?.nombre?.charAt(0)}
          </div>

          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">
              {nadador.user?.nombre} <span className="text-blue-400">{nadador.apellido}</span>
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <span className="flex items-center gap-2 text-blue-100/60 text-xs font-bold">
                <Fingerprint size={14} className="text-blue-400" /> {nadador.rut}
              </span>
              <span className="flex items-center gap-2 text-blue-100/60 text-xs font-bold">
                <Waves size={14} className="text-blue-400" /> {nadador.categoria}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Calendar} title="Edad" value={`${nadador.edad} Años`} color="blue" />
        <StatCard icon={Weight} title="Peso" value={`${nadador.peso} kg`} color="indigo" />
        <StatCard icon={Ruler} title="Estatura" value={`${nadador.altura} cm`} color="emerald" />
        <StatCard icon={Trophy} title="Nivel" value="Federado" color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ESPECIALIDADES */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Waves size={20} />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight">Mis Especialidades</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {nadador.pruebasEspecialidad?.length > 0 ? (
              nadador.pruebasEspecialidad.map((prueba, index) => (
                <div key={index} className="bg-slate-50 border border-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest">
                  {prueba}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm italic">Pendiente de asignación por el coach.</p>
            )}
          </div>
        </div>

        {/* ACCESO A MIS DATOS */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Progreso Deportivo</h3>
          
          <Link to="/nadador/competencias" className="group flex items-center justify-between bg-white hover:bg-blue-600 p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-white/20 group-hover:text-white transition-colors">
                <Trophy size={20} />
              </div>
              <span className="font-black text-slate-700 group-hover:text-white text-sm uppercase tracking-tight">Mis Logros</span>
            </div>
            <ExternalLink size={18} className="text-slate-300 group-hover:text-white transition-colors" />
          </Link>

          <Link to="/nadador/mis-tiempos" className="group flex items-center justify-between bg-white hover:bg-amber-500 p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-white/20 group-hover:text-white transition-colors">
                <BarChart3 size={20} />
              </div>
              <span className="font-black text-slate-700 group-hover:text-white text-sm uppercase tracking-tight">Ranking Personal</span>
            </div>
            <ExternalLink size={18} className="text-slate-300 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Subcomponente StatCard (igual al anterior)
const StatCard = ({ title, value, icon: Icon, color }) => {
  const themes = {
    blue: "text-blue-600 bg-blue-50",
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50"
  }
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
      <div className={`w-10 h-10 ${themes[color]} rounded-xl flex items-center justify-center mb-4`}>
        <Icon size={20} />
      </div>
      <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{title}</p>
      <p className="text-xl font-black text-slate-800 mt-1">{value}</p>
    </div>
  )
}

export default MiPerfil