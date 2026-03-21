import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getNadadorById } from "../../api/profesor.api"
import { 
  ArrowLeft, Trophy, BarChart3, Calendar, Weight, 
  Ruler, Fingerprint, Waves, Loader2, ExternalLink,
  ShieldCheck, RefreshCcw, User, Target, Zap
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
  })

  const fechaFormateada = useMemo(() => {
    if (!nadador?.fechaNacimiento) return "No registrado";
    return new Date(nadador.fechaNacimiento).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: '2-digit'
    });
  }, [nadador?.fechaNacimiento]);

  if (isLoading) return <LoadingState />;

  if (isError || !nadador) return <ErrorState error={error} />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 px-4 md:px-0">
      
      {/* TOP BAR / NAV */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <Link 
          to="/profesor/nadadores" 
          className="group flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">Volver al Plantel</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isFetching && (
            <div className="flex items-center gap-2 text-blue-500 animate-pulse">
              <RefreshCcw size={12} className="animate-spin" />
              <span className="text-[9px] font-black uppercase">Sincronizando...</span>
            </div>
          )}
          <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck size={12} className="text-blue-400" />
            ID Verificado ÑSF
          </div>
        </div>
      </div>

      {/* HERO SECTION: TARJETA DE ÉLITE */}
      <div className="relative group overflow-hidden bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-blue-900/5">
  {/* Efectos de Iluminación de Fondo (Colores Marca) */}
  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none group-hover:bg-blue-500/10 transition-all duration-1000" />
  <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/5 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none" />

  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
    {/* Avatar más compacto */}
    <div className="relative shrink-0">
      <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-5xl md:text-6xl font-black italic text-white shadow-xl shadow-blue-600/20 transform rotate-2 group-hover:rotate-0 transition-transform duration-500 uppercase">
        {nadador.user?.nombre?.charAt(0) || "N"}
      </div>
      <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2.5 rounded-2xl shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
        <Zap size={18} fill="currentColor" className="text-green-400" />
      </div>
    </div>

    <div className="text-center md:text-left space-y-4 flex-1">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
          <Target size={12} /> {nadador.categoria || 'Sin Categoría'}
        </div>
        
        {/* Tipografía Ajustada para no saturar la pantalla */}
        <h1 className="text-4xl md:text-6xl font-black tracking-[-0.04em] italic leading-[0.9] text-slate-900 uppercase">
          {nadador.user?.nombre} <br />
          <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            {nadador.apellido}
          </span>
        </h1>
      </div>

      {/* Etiquetas de datos alineadas */}
      <div className="flex flex-wrap justify-center md:justify-start gap-5 pt-4 border-t border-slate-100">
        <DataLabelLight icon={Fingerprint} label="RUT" value={nadador.rut || 'N/A'} />
        <DataLabelLight icon={Calendar} label="Edad" value={`${nadador.edad || '--'} AÑOS`} />
      </div>
    </div>
  </div>
</div>

      {/* MÉTRICAS BIOMÉTRICAS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard icon={Calendar} title="Nacimiento" value={fechaFormateada} color="blue" />
        <MetricCard icon={Weight} title="Masa Corporal" value={nadador.peso ? `${nadador.peso} kg` : '--'} color="indigo" />
        <MetricCard icon={Ruler} title="Estatura" value={nadador.altura ? `${nadador.altura} cm` : '--'} color="emerald" />
        <MetricCard icon={Trophy} title="Estado Plantel" value="ACTIVO" color="amber" />
      </div>

      {/* CONTENIDO DETALLADO */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* ESPECIALIDADES: GLASSMORPHISM */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                <Waves size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl italic">Especialidades</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enfoque Técnico</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nadador.pruebasEspecialidad?.length > 0 ? (
              nadador.pruebasEspecialidad.map((prueba, index) => (
                <div key={index} className="group flex items-center gap-4 p-5 bg-slate-50 rounded-[1.8rem] border border-transparent hover:border-blue-200 hover:bg-white transition-all">
                  <span className="font-black text-slate-700 uppercase tracking-widest text-[11px]">{prueba}</span>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold italic text-sm uppercase tracking-widest">Sin especialidades definidas</p>
              </div>
            )}
          </div>
        </div>

        {/* ACCIONES DE PROFESOR */}
        <div className="flex flex-col gap-4">
          <SidebarAction 
            to={`/profesor/nadador/${id}/competencias`}
            icon={Trophy}
            title="Competencias"
            subtitle="TOP COMPETENCIAS"
            color="blue"
          />
          <SidebarAction 
            to={`/profesor/nadador/${id}/ranking`}
            icon={BarChart3}
            title="Ranking"
            subtitle="TOP TIEMPOS"
            color="emerald"
          />
        </div>

      </div>
    </div>
  )
}

// --- SUB-COMPONENTE: DATA LABEL HERO ---
const DataLabelLight = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
      <Icon size={14} />
    </div>
    <div className="flex flex-col">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-slate-700 uppercase italic leading-none">{value}</span>
    </div>
  </div>
)

// --- SUB-COMPONENTE: METRIC CARD ---
const MetricCard = ({ title, value, icon: Icon, color }) => {
  const styles = {
    blue: "text-blue-600 bg-blue-50/50 border-blue-100",
    indigo: "text-indigo-600 bg-indigo-50/50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50/50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50/50 border-amber-100"
  }
  return (
    <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 ${styles[color]} border`}>
        <Icon size={24} />
      </div>
      <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
      <p className="text-xl font-black text-slate-900 italic tracking-tighter uppercase">{value}</p>
    </div>
  )
}

// --- SUB-COMPONENTE: SIDEBAR ACTION ---
const SidebarAction = ({ to, icon: Icon, title, subtitle, color }) => (
  <Link
    to={to}
    className="group flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:bg-slate-900 transition-all duration-500"
  >
    <div className="flex items-center gap-5">
      <div className={`p-4 rounded-2xl transition-all group-hover:bg-white/10 group-hover:text-white ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <span className="font-black text-slate-900 group-hover:text-white text-lg uppercase tracking-tight italic transition-colors leading-none">{title}</span>
        <span className="text-[9px] font-bold text-slate-400 group-hover:text-blue-400 uppercase tracking-widest mt-1">{subtitle}</span>
      </div>
    </div>
    <ExternalLink size={20} className="text-slate-200 group-hover:text-white transition-all transform group-hover:translate-x-1" />
  </Link>
)

// --- ESTADOS DE CARGA Y ERROR ---
const LoadingState = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center">
    <div className="relative mb-10">
      <div className="w-24 h-24 border-8 border-slate-100 rounded-full" />
      <div className="absolute top-0 w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <Waves className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600/20" size={32} />
    </div>
    <p className="font-black text-[11px] uppercase tracking-[0.5em] text-slate-400 animate-pulse">Analizando Perfil Atlético...</p>
  </div>
)

const ErrorState = ({ error }) => (
  <div className="max-w-2xl mx-auto mt-20 bg-white p-12 rounded-[3.5rem] text-center border border-red-100 shadow-2xl">
    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
      <AlertCircle size={40} />
    </div>
    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">Acceso Interrumpido</h2>
    <p className="text-slate-500 text-sm mb-10 font-medium">No se pudo localizar el registro del atleta. Es posible que los datos hayan sido migrados o eliminados.</p>
    <Link 
      to="/profesor/nadadores" 
      className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all inline-flex items-center gap-3 shadow-xl"
    >
      <ArrowLeft size={16} /> Regresar al Panel
    </Link>
  </div>
)

export default NadadorProfile;