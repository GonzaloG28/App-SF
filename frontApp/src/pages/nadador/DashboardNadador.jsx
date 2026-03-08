import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { 
  Lock, Activity, ChevronRight, Save, 
  Star, Hash, Trophy, Ruler, Weight,
  Zap, ArrowUpRight, CheckCircle2, AlertCircle
} from "lucide-react";

// --- COMPONENTE: MODAL DE SEGURIDAD (Optimizado para no re-renderizar el dashboard) ---
const PasswordUpdateModal = memo(({ isOpen, perfil, onCarreraExitosamente }) => {
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [error, setError] = useState("");
  const { passwordCambiadoExitosamente } = useAuth();

  const mutation = useMutation({
    mutationFn: (pass) => api.put("/users/cambiar-password", { passwordNueva: pass }),
    onSuccess: () => {
      passwordCambiadoExitosamente();
      onCarreraExitosamente();
    },
    onError: () => setError("Error al actualizar. Intenta de nuevo.")
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return setError("Las contraseñas no coinciden");
    mutation.mutate(passwords.new);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500" />
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600" />
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Lock size={28} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
            Protocolo de <span className="text-blue-600">Seguridad</span>
          </h2>
          <p className="text-slate-500 text-sm mt-3 mb-8 font-medium">
            Atleta <span className="font-bold text-slate-800">{perfil?.user?.nombre}</span>, activa tu cifrado personal para acceder a la telemetría.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            placeholder="Nueva Contraseña"
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-blue-500/20 outline-none transition-all font-bold"
            onChange={e => setPasswords({...passwords, new: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Confirmar Identidad"
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-blue-500/20 outline-none transition-all font-bold"
            onChange={e => setPasswords({...passwords, confirm: e.target.value})}
            required
          />
          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
          <button 
            disabled={mutation.isPending}
            className="w-full bg-[#0f172a] hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-900/20"
          >
            {mutation.isPending ? "Procesando..." : "Sincronizar Acceso"}
            <CheckCircle2 size={18} />
          </button>
        </form>
      </div>
    </div>
  );
});

// --- COMPONENTE PRINCIPAL ---
const DashboardNadador = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(localStorage.getItem("debeCambiarPassword") === "true");

  const { data: perfil, isLoading } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => (await api.get("/nadadores/perfil")).data,
    enabled: !!user,
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
      
      <PasswordUpdateModal 
        isOpen={isModalOpen} 
        perfil={perfil} 
        onCarreraExitosamente={() => setIsModalOpen(false)} 
      />

      <div className={`transition-all duration-700 ease-out ${isModalOpen ? "blur-2xl opacity-20 scale-95" : "opacity-100"}`}>
        
        {/* HERO: ESTILO ATLETA ELITE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Athlete Profile // Ver. 2026</span>
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 italic tracking-[ -0.05em] uppercase leading-[0.85]">
              {perfil?.user?.nombre} <br />
              <span className="text-blue-600 not-italic select-none">{perfil?.apellido}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6 p-1.5 bg-white rounded-[2rem] border border-slate-100 shadow-sm pr-8">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-400 shadow-xl">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Sistema</p>
              <p className="text-sm font-black text-slate-800 tracking-tighter">OPTIMAL_PERFORMANCE</p>
            </div>
          </div>
        </header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* MÉTRICAS BIOMÉTRICAS */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Zap size={14} className="text-blue-600" /> Biometría
                </h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">LIVE</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MetricBox label="Estatura" value={perfil?.altura} unit="M" icon={Ruler} />
                <MetricBox label="Peso" value={perfil?.peso} unit="KG" icon={Weight} />
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Especialidades</p>
                <div className="flex flex-wrap gap-2">
                  {perfil?.pruebasEspecialidad?.map((p, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-[10px] font-black rounded-lg border border-slate-100 uppercase italic group-hover:border-blue-200 transition-colors">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* QUICK STAT (ID CARD) */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20">
              <Hash className="text-white/20 mb-4" size={24} />
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Identificación Atleta</p>
              <p className="text-2xl font-black italic tracking-tighter mt-1">{perfil?.rut}</p>
            </div>
          </div>

          {/* MAIN CTA: TIEMPOS Y PROGRESIÓN */}
          <div className="lg:col-span-8 bg-[#0f172a] rounded-[3rem] relative overflow-hidden p-8 md:p-14 group min-h-[450px] flex flex-col">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <Trophy size={14} className="text-amber-400" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">New Records Detected</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black text-white italic leading-[0.9] tracking-tighter">
                SUPERA TUS <br />
                <span className="text-blue-500 uppercase not-italic">LÍMITES.</span>
              </h2>
              <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
                Tu historial de marcas ha sido actualizado. Analiza tu curva de rendimiento y ajusta tu técnica.
              </p>
            </div>

            <div className="relative z-10 mt-auto flex flex-col sm:flex-row items-center gap-6">
              <Link 
                to="/nadador/mis-tiempos" 
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/40"
              >
                Ver Telemetría <ArrowUpRight size={20} />
              </Link>
              
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[#0f172a] bg-slate-800 flex items-center justify-center text-blue-400 group-hover:translate-x-1 transition-transform">
                    <Star size={16} fill="currentColor" />
                  </div>
                ))}
              </div>
            </div>
            
            <Trophy className="absolute bottom-[-10%] right-[-5%] text-white/[0.02] w-96 h-96 -rotate-12 pointer-events-none" />
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTES DE UI ---

const MetricBox = ({ label, value, unit, icon: Icon }) => (
  <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-colors group/item relative">
    <Icon className="text-slate-300 mb-3 group-hover/item:text-blue-500 transition-colors" size={18} />
    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-800 italic leading-none">
      {value}<span className="text-blue-600 text-xs ml-1 uppercase">{unit}</span>
    </p>
  </div>
);

const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-8 py-12 animate-pulse space-y-12">
    <div className="h-32 bg-slate-200 rounded-[3rem] w-3/4" />
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4 h-[400px] bg-slate-200 rounded-[3rem]" />
      <div className="col-span-8 h-[400px] bg-slate-200 rounded-[3rem]" />
    </div>
  </div>
);

export default DashboardNadador;