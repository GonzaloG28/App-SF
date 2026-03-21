import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { 
  Trophy, BarChart3, Calendar, Weight, 
  Ruler, Fingerprint, Waves, Target, ShieldCheck,
  Clock, Flame, ArrowUpRight, Zap, ChevronRight
} from "lucide-react";
import { memo } from "react";

const MiPerfil = () => {
  const { data: nadador, isLoading, isError, error } = useQuery({
    queryKey: ["miPerfilNadador"],
    queryFn: () => api.get("/nadadores/perfil").then(res => res.data),
  });

  const { data: competencias } = useQuery({
    queryKey: ["misCompetenciasProximas"],
    queryFn: () => api.get("/competencias").then(res => res.data),
    enabled: !!nadador
  });

  if (isLoading) return <ProfileSkeleton />;

  if (isError) return <ErrorState error={error} />;

  const proximasCompetencias = competencias?.filter(c => new Date(c.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 2) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-12">
      
      {/* HEADER TÉCNICO COMPACTO */}
      <header className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-1 block italic">User profile</span>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Mi Perfil</h2>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Cuenta Activa</span>
        </div>
      </header>

      {/* HERO CARD: REDISEÑO CLARO Y COMPACTO */}
      <section className="relative group overflow-hidden bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-blue-900/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-5xl md:text-6xl font-black italic text-white shadow-xl shadow-blue-600/20 transform rotate-2 group-hover:rotate-0 transition-transform duration-500 uppercase">
              {nadador.user?.nombre?.charAt(0)}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2.5 rounded-2xl shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Zap size={18} fill="currentColor" className="text-emerald-400" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-4 flex-1">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
                <Target size={12} /> {nadador.categoria || 'Nivel Club'}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-[-0.04em] italic leading-[0.9] text-slate-900 uppercase">
                {nadador.user?.nombre} <br />
                <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                  {nadador.apellido}
                </span>
              </h1>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4 border-t border-slate-100">
              <BadgeLight icon={Fingerprint} label={nadador.rut} />
              <BadgeLight icon={Waves} label="Federado" highlight />
            </div>
          </div>
        </div>
      </section>

      {/* MÉTRICAS FÍSICAS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={Calendar} title="Edad" value={`${nadador.edad} Años`} colorTheme="blue" />
        <StatCard icon={Weight} title="Masa" value={`${nadador.peso} Kg`} colorTheme="green" />
        <StatCard icon={Ruler} title="Estatura" value={`${nadador.altura} Cm`} colorTheme="blue" />
        <StatCard icon={Flame} title="Progreso" value="94%" colorTheme="orange" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                  <Trophy size={20} />
                </div>
                <h3 className="font-black text-slate-900 text-xl tracking-tighter uppercase italic">Próximas Pruebas</h3>
              </div>
              <Link to="/nadador/competencias" className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">Ver Historial</Link>
            </div>

            <div className="space-y-3">
              {proximasCompetencias.length > 0 ? (
                proximasCompetencias.map((comp) => (
                  <CompetitionRow key={comp._id} comp={comp} />
                ))
              ) : (
                <EmptyEvents />
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Módulos de Análisis</h3>
            <div className="space-y-3">
              <ActionLink to="/nadador/competencias" title="Mis Logros" icon={Trophy} />
              <ActionLink to="/nadador/mis-tiempos" title="Estadísticas" icon={BarChart3} />
              <ActionLink to="/nadador/entrenamientos" title="Rutinas" icon={Clock} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-emerald-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <Target className="absolute -right-6 -bottom-6 opacity-10 group-hover:rotate-12 transition-transform duration-1000" size={160} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Objetivo Actual</h4>
            <p className="text-2xl font-black italic uppercase leading-[0.9] mb-6">Potencia de <br/> Viraje</p>
            <button className="w-full bg-white/20 backdrop-blur-md text-white border border-white/30 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2">
              Ver Plan <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const StatCard = memo(({ title, value, icon: Icon, colorTheme }) => {
  const themes = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-emerald-600 bg-emerald-50 border-emerald-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
  };
  return (
    <div className="bg-white rounded-[2.2rem] p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform border ${themes[colorTheme]}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-xl font-black text-slate-900 italic tracking-tighter uppercase tabular-nums">{value}</p>
    </div>
  );
});

const ActionLink = ({ to, title, icon: Icon }) => (
  <Link to={to} className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 transition-all duration-300 hover:border-blue-200 hover:shadow-lg active:scale-[0.98]">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all duration-300 shadow-sm">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <span className="font-black text-slate-700 text-[10px] uppercase tracking-wider">{title}</span>
    </div>
    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
  </Link>
);

const BadgeLight = ({ icon: Icon, label, highlight = false }) => (
  <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
    highlight 
    ? "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm" 
    : "bg-slate-50 border-slate-100 text-slate-400"
  }`}>
    <Icon size={14} className={highlight ? "text-emerald-500" : "text-slate-400"} />
    {label}
  </div>
);

const CompetitionRow = ({ comp }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.8rem] border border-transparent hover:border-blue-200 hover:bg-white transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-slate-100 font-black text-blue-600 italic shadow-sm">
        {new Date(comp.fecha).getDate()}
      </div>
      <div>
        <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight">{comp.nombre}</h4>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{comp.piscina}M • {new Date(comp.fecha).toLocaleDateString()}</p>
      </div>
    </div>
    <span className="text-[9px] font-black bg-white text-emerald-600 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm uppercase italic">
      Días: {Math.ceil((new Date(comp.fecha) - new Date()) / (1000 * 60 * 60 * 24))}
    </span>
  </div>
);

const EmptyEvents = () => (
  <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Sin eventos próximos en radar</p>
  </div>
);

const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto py-12 animate-pulse space-y-8">
    <div className="h-10 bg-slate-100 w-48 rounded-2xl" />
    <div className="h-48 bg-slate-100 rounded-[3rem] w-full" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-[2rem]" />)}
    </div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-[3.5rem] border border-red-100 text-center shadow-2xl">
    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
      <ShieldCheck size={40} />
    </div>
    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">Fallo de Telemetría</h2>
    <p className="text-slate-500 text-xs mb-10 font-bold uppercase tracking-[0.2em]">{error?.message || "Enlace de datos caído"}</p>
    <button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl">Reintentar</button>
  </div>
);

export default MiPerfil;