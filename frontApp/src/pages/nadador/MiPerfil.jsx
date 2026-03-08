import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { 
  Trophy, BarChart3, Calendar, Weight, 
  Ruler, Fingerprint, Waves, Loader2, 
  ChevronRight, Target, ShieldCheck, Activity
} from "lucide-react";
import { memo } from "react";

// --- SUB-COMPONENTE: TARJETA DE MÉTRICA ---
const StatCard = memo(({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={22} strokeWidth={2.5} />
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">{title}</p>
    <p className="text-2xl font-black text-slate-900 mt-2 italic tracking-tighter">{value}</p>
  </div>
));

// --- SUB-COMPONENTE: LINK DE ACCIÓN RÁPIDA ---
const ActionLink = ({ to, title, icon: Icon, theme }) => {
  const styles = {
    blue: "hover:bg-blue-600 text-blue-600 bg-blue-50/50",
    amber: "hover:bg-amber-500 text-amber-600 bg-amber-50/50"
  };

  return (
    <Link to={to} className={`group flex items-center justify-between p-6 rounded-[2.2rem] border border-slate-100 shadow-sm transition-all duration-500 ${styles[theme]} hover:shadow-xl hover:-translate-y-1`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-white/20 group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        <span className="font-black text-slate-800 group-hover:text-white text-sm uppercase tracking-tight transition-colors">{title}</span>
      </div>
      <ChevronRight size={20} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </Link>
  );
};

const MiPerfil = () => {
  const { data: nadador, isLoading, isError, error } = useQuery({
    queryKey: ["miPerfilNadador"],
    queryFn: () => api.get("/nadadores/perfil").then(res => res.data),
  });

  if (isLoading) return <ProfileSkeleton />;

  if (isError) return (
    <div className="max-w-xl mx-auto mt-20 p-10 bg-white rounded-[3rem] border-2 border-red-50 shadow-2xl text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <ShieldCheck size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2">Error de Enlace</h2>
      <p className="text-slate-500 font-medium mb-6">{error.message || "La telemetría no está disponible."}</p>
      <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors">
        Reintentar Conexión
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-700 pb-24">
      
      {/* HEADER TÉCNICO */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-blue-600 font-black text-[11px] uppercase tracking-[0.5em] mb-1">Dossier de Rendimiento</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sincronizado: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Estado: Atleta Activo</span>
        </div>
      </header>

      {/* HERO CARD: IDENTITY SYSTEM */}
      <section className="bg-[#0f172a] rounded-[3.5rem] p-1 md:p-1.5 shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
        <div className="bg-slate-900 rounded-[3.3rem] p-8 md:p-12 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            {/* Avatar con efecto de anillo de carga */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-[2.8rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="w-36 h-36 rounded-[2.8rem] bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-6xl font-black text-white border-2 border-white/10 relative z-10 italic">
                {nadador.user?.nombre?.charAt(0)}
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                  {nadador.user?.nombre} <br />
                  <span className="text-blue-500 not-italic uppercase">{nadador.apellido}</span>
                </h1>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge icon={Fingerprint} label={nadador.rut} />
                <Badge icon={Waves} label={nadador.categoria} />
                <Badge icon={Activity} label="Nivel Federado" highlight />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MÉTRICAS FÍSICAS - BENTO GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Calendar} title="Edad Cronológica" value={`${nadador.edad} AÑOS`} colorClass="text-blue-600 bg-blue-50" />
        <StatCard icon={Weight} title="Masa Corporal" value={`${nadador.peso} KG`} colorClass="text-indigo-600 bg-indigo-50" />
        <StatCard icon={Ruler} title="Envergadura" value={`${nadador.altura} CM`} colorClass="text-emerald-600 bg-emerald-50" />
        <StatCard icon={Target} title="Objetivo" value="Podio" colorClass="text-amber-600 bg-amber-50" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* ESPECIALIDADES */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 text-white rounded-2xl">
                <Waves size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase italic">Especialidades de Carrera</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">DNA Competitivo</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nadador.pruebasEspecialidad?.length > 0 ? (
              nadador.pruebasEspecialidad.map((prueba, index) => (
                <div key={index} className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] hover:border-blue-200 hover:bg-white transition-all group/item">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-black text-slate-700 uppercase tracking-widest group-hover/item:text-blue-600 transition-colors">
                    {prueba}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <p className="text-slate-400 text-sm font-medium italic">Pendiente de asignación por el Cuerpo Técnico.</p>
              </div>
            )}
          </div>
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div className="lg:col-span-4 flex flex-col justify-center gap-5">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6">Sistemas de Análisis</h3>
          <ActionLink to="/nadador/competencias" title="Logros y Trofeos" icon={Trophy} theme="blue" />
          <ActionLink to="/nadador/mis-tiempos" title="Análisis de Marcas" icon={BarChart3} theme="amber" />
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const Badge = ({ icon: Icon, label, highlight = false }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${
    highlight 
    ? "bg-blue-600 border-blue-500 text-white" 
    : "bg-white/5 border-white/10 text-blue-100/70"
  }`}>
    <Icon size={14} className={highlight ? "text-white" : "text-blue-400"} />
    {label}
  </div>
);

const ProfileSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-20 space-y-12 animate-pulse">
    <div className="h-10 bg-slate-100 w-48 rounded-xl" />
    <div className="h-72 bg-slate-100 rounded-[3.5rem] w-full" />
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[2.5rem]" />)}
    </div>
  </div>
);

export default MiPerfil;