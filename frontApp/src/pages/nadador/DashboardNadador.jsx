import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCompetenciasPorNadador } from "../../api/competencias.api"; 
import { getMisEntrenamientos } from "../../api/entrenamientos.api";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { 
  Lock, Activity, ChevronRight, Star, Hash, Trophy, 
  Ruler, Weight, Zap, ArrowUpRight, CheckCircle2, 
  Calendar, Timer, History, Waves, Award, Flame
} from "lucide-react";

// --- COMPONENTE: MODAL DE SEGURIDAD ---
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

  // QUERIES DE DATOS
  const { data: perfil, isLoading: loadPerfil } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => (await api.get("/nadadores/perfil")).data,
    enabled: !!user,
  });

  const { data: competencias = [], isLoading: loadComp } = useQuery({
    queryKey: ["misCompetenciasDashboard", perfil?._id],
    queryFn: async () => {
      const res = await getCompetenciasPorNadador(perfil._id);
      // Forzamos que siempre devuelva un array para que .filter() no falle
      return Array.isArray(res.data) ? res.data : (res.data?.competencias || []);
    },
    enabled: !!perfil?._id,
  });

  const { data: entrenamientos = [], isLoading: loadEntreno } = useQuery({
    queryKey: ["misEntrenamientosDashboard"],
    queryFn: async () => {
      const res = await getMisEntrenamientos();
      return Array.isArray(res.data) ? res.data : (res.data?.entrenamientos || []);
    },
    enabled: !!user,
  });

  if (loadPerfil || loadComp || loadEntreno) return <DashboardSkeleton />;

  // LÓGICA DE FILTRADO DE EVENTOS
  const hoy = new Date();
  const proximasComp = competencias?.filter(c => new Date(c.fecha) >= hoy).sort((a,b) => new Date(a.fecha) - new Date(b.fecha)) || [];
  const pasadasComp = competencias?.filter(c => new Date(c.fecha) < hoy).sort((a,b) => new Date(b.fecha) - new Date(a.fecha)) || [];
  const ultimoEntreno = entrenamientos?.[0]; // Asume que el backend los devuelve ordenados por fecha
  const mejorPrueba = perfil?.pruebasEspecialidad?.[0] || "100m Libre"; // Fallback por defecto

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6 animate-in fade-in duration-700">
      
      <PasswordUpdateModal 
        isOpen={isModalOpen} 
        perfil={perfil} 
        onCarreraExitosamente={() => setIsModalOpen(false)} 
      />

      <div className={`transition-all duration-700 ease-out ${isModalOpen ? "blur-2xl opacity-20 scale-95" : "opacity-100"}`}>
        
        {/* HERO: ESTILO ATLETA ELITE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Athlete Management // V.2026</span>
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 italic tracking-[-0.05em] uppercase leading-[0.85]">
              {perfil?.user?.nombre} <br />
              <span className="text-blue-600 not-italic select-none">{perfil?.apellido}</span>
            </h1>
          </div>
          
          <Link to="/nadador/perfil" className="flex items-center gap-6 p-1.5 bg-white rounded-[2rem] border border-slate-100 shadow-sm pr-8 hover:border-blue-200 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-[#0f172a] rounded-2xl flex items-center justify-center text-blue-400 shadow-xl group-hover:scale-105 transition-transform">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Categoría Actual</p>
              <p className="text-sm font-black text-slate-800 tracking-tighter uppercase">{perfil?.categoria || "ÉLITE"}</p>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors ml-2" />
          </Link>
        </header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* 1. PRÓXIMO EVENTO (HIGHLIGHT) */}
          <Link to="/nadador/competencias" className="lg:col-span-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-500 flex flex-col justify-between min-h-[320px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
              <Calendar size={200} />
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] mb-6 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                <Timer size={14} className="text-cyan-300" /> Siguiente Bloque
              </span>
              {proximasComp.length > 0 ? (
                <>
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase leading-[0.9] tracking-tighter mb-4">
                    {proximasComp[0].nombre}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black uppercase text-blue-200 tracking-widest mb-1">Días para el salto</p>
                      <p className="text-3xl font-black italic">{Math.ceil((new Date(proximasComp[0].fecha) - hoy) / (1000 * 60 * 60 * 24))}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black uppercase text-blue-200 tracking-widest mb-1">Piscina</p>
                      <p className="text-3xl font-black italic">{proximasComp[0].piscina}M</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col justify-center h-full">
                  <h2 className="text-4xl font-black italic opacity-60 uppercase">Temporada Cerrada</h2>
                  <p className="text-blue-200 font-medium mt-2">No hay competencias programadas en tu calendario.</p>
                </div>
              )}
            </div>
          </Link>

          {/* 2. MEJOR PRUEBA & BIOMETRÍA */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link to="/nadador/mis-tiempos" className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white group hover:bg-slate-900 transition-colors flex-1 flex flex-col justify-center relative overflow-hidden">
              <Flame className="absolute -right-4 -bottom-4 w-32 h-32 text-orange-500/10 group-hover:text-orange-500/20 transition-colors" />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Especialidad Principal</p>
                <h3 className="text-3xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  {mejorPrueba}
                </h3>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase">
                  Ver Evolución <ArrowUpRight size={14} />
                </div>
              </div>
            </Link>
            
            <div className="grid grid-cols-2 gap-4">
              <Link to="/nadador/perfil" className="bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-colors group">
                <Ruler className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" size={20} />
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Estatura</p>
                <p className="text-2xl font-black italic text-slate-800">{perfil?.altura}<span className="text-xs ml-1 text-blue-600">CM</span></p>
              </Link>
              <Link to="/nadador/perfil" className="bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-colors group">
                <Weight className="text-indigo-500 mb-2 group-hover:scale-110 transition-transform" size={20} />
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Masa</p>
                <p className="text-2xl font-black italic text-slate-800">{perfil?.peso}<span className="text-xs ml-1 text-indigo-600">KG</span></p>
              </Link>
            </div>
          </div>

          {/* 3. ÚLTIMO ENTRENAMIENTO */}
          <Link to="/nadador/entrenamientos" className="lg:col-span-5 bg-white rounded-[3rem] p-8 border border-slate-100 group hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" /> Último Reporte
              </h3>
              <div className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ArrowUpRight size={16} />
              </div>
            </div>

            {ultimoEntreno ? (
              <div>
                <h4 className="text-2xl font-black italic text-slate-900 uppercase leading-tight mb-4">
                  {ultimoEntreno.titulo || "Sesión de Agua"}
                </h4>
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-blue-50 transition-colors">
                    <p className="text-[9px] font-black uppercase text-slate-400">Fecha</p>
                    <p className="text-sm font-black italic text-slate-800 mt-1">{new Date(ultimoEntreno.fecha).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <Waves className="mx-auto mb-2 opacity-50" size={24} />
                <p className="text-xs font-bold uppercase">Sin registros recientes</p>
              </div>
            )}
          </Link>

          {/* 4. RESULTADOS RECIENTES */}
          <Link to="/nadador/competencias" className="lg:col-span-7 bg-[#0a0f1d] rounded-[3rem] p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full group-hover:bg-blue-500/30 transition-colors" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 text-white rounded-xl">
                  <History size={18} />
                </div>
                <h3 className="text-sm font-black uppercase italic text-white tracking-tight">Historial de Competencias</h3>
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Ver Marcas</span>
            </div>
            
            <div className="space-y-3 relative z-10">
              {pasadasComp.slice(0, 3).map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <Award size={18} className="text-amber-400" />
                    <div>
                      <p className="text-xs font-black uppercase text-white tracking-tight">{comp.nombre}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(comp.fecha).toLocaleDateString()} • Piscina {comp.piscina}M</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
              ))}
              {pasadasComp.length === 0 && (
                <p className="text-center py-6 text-slate-500 text-xs italic font-medium">Aún no tienes marcas registradas en el sistema.</p>
              )}
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

// --- SKELETON MEJORADO ---
const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-8 py-12 animate-pulse space-y-10">
    <div className="h-24 bg-slate-200 rounded-[2rem] w-3/4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 h-[320px] bg-slate-200 rounded-[3rem]" />
      <div className="lg:col-span-4 h-[320px] bg-slate-200 rounded-[3rem]" />
      <div className="lg:col-span-5 h-[280px] bg-slate-200 rounded-[3rem]" />
      <div className="lg:col-span-7 h-[280px] bg-slate-200 rounded-[3rem]" />
    </div>
  </div>
);

export default DashboardNadador;