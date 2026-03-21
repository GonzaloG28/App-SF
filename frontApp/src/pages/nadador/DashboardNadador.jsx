import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCompetenciasPorNadador } from "../../api/competencias.api"; 
import { getMisEntrenamientos } from "../../api/entrenamientos.api";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { 
  Lock, Activity, ChevronRight, Trophy, 
  Ruler, Weight, ArrowUpRight, CheckCircle2, 
  Calendar, Timer, History, Waves, Award, Flame
} from "lucide-react";

// --- COMPONENTE: MODAL DE SEGURIDAD (ESTILO UNIFICADO) ---
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" />
      <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-green-500" />
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm group">
            <Lock size={32} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
            Protocolo de <span className="text-blue-600">Seguridad</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4 mb-8">
            Activación de cifrado personal: {perfil?.user?.nombre}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            placeholder="NUEVA CONTRASEÑA"
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-blue-500/10 outline-none transition-all font-black text-xs uppercase tracking-widest"
            onChange={e => setPasswords({...passwords, new: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="CONFIRMAR IDENTIDAD"
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-blue-500/10 outline-none transition-all font-black text-xs uppercase tracking-widest"
            onChange={e => setPasswords({...passwords, confirm: e.target.value})}
            required
          />
          {error && <p className="text-orange-600 text-[10px] font-black uppercase text-center italic">{error}</p>}
          <button 
            disabled={mutation.isPending}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex justify-center items-center gap-3 active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-900/20 italic"
          >
            {mutation.isPending ? "PROCESANDO..." : "Sincronizar Acceso"}
            <CheckCircle2 size={18} strokeWidth={3} />
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

  const { data: perfil, isLoading: loadPerfil } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => (await api.get("/nadadores/perfil")).data,
    enabled: !!user,
  });

  const { data: competencias = [], isLoading: loadComp } = useQuery({
    queryKey: ["misCompetenciasDashboard", perfil?._id],
    queryFn: async () => {
      const res = await getCompetenciasPorNadador(perfil._id);
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

  const hoy = new Date();
  const proximasComp = competencias?.filter(c => new Date(c.fecha) >= hoy).sort((a,b) => new Date(a.fecha) - new Date(b.fecha)) || [];
  const pasadasComp = competencias?.filter(c => new Date(c.fecha) < hoy).sort((a,b) => new Date(b.fecha) - new Date(a.fecha)) || [];
  const ultimoEntreno = entrenamientos?.[0];
  const mejorPrueba = perfil?.pruebasEspecialidad?.[0] || "100m Libre";

  return (
    <div className="max-w-7xl mx-auto pb-20 pt-6 animate-in fade-in duration-700">
      
      <PasswordUpdateModal 
        isOpen={isModalOpen} 
        perfil={perfil} 
        onCarreraExitosamente={() => setIsModalOpen(false)} 
      />

      <div className={`transition-all duration-1000 ease-in-out ${isModalOpen ? "blur-3xl opacity-0 scale-90" : "opacity-100"}`}>
        
        {/* HERO: ESTILO ATLETA ELITE */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Athlete Management // Performance Center</span>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 italic tracking-tighter uppercase leading-[0.8]">
              {perfil?.user?.nombre} <br />
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent not-italic">{perfil?.apellido}</span>
            </h1>
          </div>
          
          <Link to="/nadador/perfil" className="flex items-center gap-6 p-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm pr-10 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-blue-400 shadow-xl group-hover:rotate-6 transition-transform">
              <Activity size={26} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Categoria</p>
              <p className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-none">{perfil?.categoria || "ÉLITE"}</p>
            </div>
            <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all ml-4" />
          </Link>
        </header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* 1. PRÓXIMO EVENTO - Uso de gradiente de marca */}
          <Link to="/nadador/competencias" className="lg:col-span-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[3rem] p-10 text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-600/30 transition-all duration-700 flex flex-col justify-between min-h-[350px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
              <Calendar size={220} />
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] mb-8 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full">
                <Timer size={14} className="text-green-400 animate-pulse" strokeWidth={3} /> Siguiente Competencia
              </span>
              {proximasComp.length > 0 ? (
                <>
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase leading-[0.9] tracking-tighter mb-6 group-hover:translate-x-2 transition-transform">
                    {proximasComp[0].nombre}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 group-hover:bg-white/20 transition-colors">
                      <p className="text-[9px] font-black uppercase text-blue-200 tracking-widest mb-1">Días para el salto</p>
                      <p className="text-4xl font-black italic">{Math.ceil((new Date(proximasComp[0].fecha) - hoy) / (1000 * 60 * 60 * 24))}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 group-hover:bg-white/20 transition-colors">
                      <p className="text-[9px] font-black uppercase text-blue-200 tracking-widest mb-1">Piscina</p>
                      <p className="text-4xl font-black italic">{proximasComp[0].piscina}M</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col justify-center py-10">
                  <h2 className="text-4xl font-black italic opacity-40 uppercase tracking-tighter">Temporada en Espera</h2>
                  <p className="text-blue-100 font-bold uppercase text-xs tracking-widest mt-4">Sin competencias programadas por ahora</p>
                </div>
              )}
            </div>
          </Link>

          {/* 2. MEJOR PRUEBA & BIOMETRÍA */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link to="/nadador/mis-tiempos" className="bg-slate-900 rounded-[2.5rem] p-8 text-white group hover:bg-slate-800 transition-all flex-1 flex flex-col justify-center relative overflow-hidden border border-slate-800 shadow-xl">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 text-orange-600/20 group-hover:text-orange-500/40 transition-all rotate-12">
                <Flame size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Especialidad Principal</p>
                <h3 className="text-3xl font-black italic uppercase bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
                  {mejorPrueba}
                </h3>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  Analizar Progreso <ArrowUpRight size={14} strokeWidth={3} />
                </div>
              </div>
            </Link>
            
            <div className="grid grid-cols-2 gap-4">
              <Link to="/nadador/perfil" className="bg-white p-6 rounded-[2.2rem] border border-slate-100 hover:border-blue-200 transition-all group shadow-sm">
                <Ruler className="text-blue-500 mb-3 group-hover:scale-110 group-hover:-rotate-12 transition-transform" size={22} strokeWidth={2.5} />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estatura</p>
                <p className="text-2xl font-black italic text-slate-900 leading-none">{perfil?.altura}<span className="text-[10px] ml-1 text-blue-600 uppercase not-italic">cm</span></p>
              </Link>
              <Link to="/nadador/perfil" className="bg-white p-6 rounded-[2.2rem] border border-slate-100 hover:border-green-200 transition-all group shadow-sm">
                <Weight className="text-green-500 mb-3 group-hover:scale-110 group-hover:rotate-12 transition-transform" size={22} strokeWidth={2.5} />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Masa</p>
                <p className="text-2xl font-black italic text-slate-900 leading-none">{perfil?.peso}<span className="text-[10px] ml-1 text-green-600 uppercase not-italic">kg</span></p>
              </Link>
            </div>
          </div>

          {/* 3. ÚLTIMO ENTRENAMIENTO - Diseño limpio */}
          <Link to="/nadador/entrenamientos" className="lg:col-span-5 bg-white rounded-[3rem] p-9 border border-slate-100 group hover:shadow-2xl hover:border-blue-200 transition-all duration-500 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-3">
                <Activity size={16} className="text-green-500" strokeWidth={3} /> Entrenamiento Reciente
              </h3>
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowUpRight size={18} strokeWidth={3} />
              </div>
            </div>

            {ultimoEntreno ? (
              <div>
                <h4 className="text-3xl font-black italic text-slate-900 uppercase leading-none tracking-tighter mb-6 group-hover:text-blue-600 transition-colors">
                  {ultimoEntreno.titulo || "Sesión General"}
                </h4>
                <div className="inline-flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                   <Calendar size={14} className="text-blue-600" />
                   <p className="text-[10px] font-black italic text-blue-800 uppercase tracking-widest">{new Date(ultimoEntreno.fecha).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <Waves className="mx-auto mb-4 text-slate-100" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Esperando datos de sesión</p>
              </div>
            )}
          </Link>

          {/* 4. RESULTADOS RECIENTES - Estilo Dark Mode unificado */}
          <Link to="/nadador/competencias" className="lg:col-span-7 bg-[#0a0f1d] rounded-[3rem] p-9 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-900/50 transition-all duration-500">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 text-blue-400 rounded-2xl border border-white/10 group-hover:rotate-6 transition-transform">
                  <History size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-black uppercase italic text-white tracking-widest">Ultimas Competencias</h3>
              </div>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] border-b border-blue-400/30 pb-1">Análisis de Marcas</span>
            </div>
            
            <div className="space-y-4 relative z-10">
              {pasadasComp.slice(0, 3).map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-[1.8rem] border border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                       <Award size={20} className="text-orange-500" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-white tracking-tight italic">{comp.nombre}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {new Date(comp.fecha).toLocaleDateString()} <span className="text-white/20 mx-1">•</span> Piscina {comp.piscina}M
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              ))}
              {pasadasComp.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">No se han registrado tiempos de competencia</p>
                </div>
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
  <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-12">
    <div className="space-y-4">
      <div className="h-4 bg-slate-100 rounded-full w-48" />
      <div className="h-24 bg-slate-200 rounded-[2.5rem] w-3/4" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 h-[350px] bg-slate-100 rounded-[3rem]" />
      <div className="lg:col-span-4 h-[350px] bg-slate-100 rounded-[3rem]" />
      <div className="lg:col-span-5 h-[300px] bg-slate-100 rounded-[3rem]" />
      <div className="lg:col-span-7 h-[300px] bg-slate-100 rounded-[3rem]" />
    </div>
  </div>
);

export default DashboardNadador;