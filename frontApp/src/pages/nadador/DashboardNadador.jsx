import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import { useAuth } from "../../context/AutHContext";
import { 
  Lock, Activity, ChevronRight, Save, 
  Loader2, Star, Hash, Trophy, Ruler, Weight,
  Zap, ArrowUpRight
} from "lucide-react";

const DashboardNadador = () => {
  const { user, passwordCambiadoExitosamente } = useAuth();
  const [showModal, setShowModal] = useState(localStorage.getItem("debeCambiarPassword") === "true");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const { data: perfil, isLoading } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => {
      const res = await api.get("/nadadores/perfil"); 
      return res.data;
    },
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async (pass) => api.put("/users/cambiar-password", { passwordNueva: pass }),
    onSuccess: () => {
      passwordCambiadoExitosamente();
      setShowModal(false);
    }
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordNueva !== confirmarPassword) return alert("Las contraseñas no coinciden");
    mutation.mutate(passwordNueva);
  };

  if (isLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-blue-600 relative z-10" size={48} strokeWidth={3} />
        <div className="absolute inset-0 blur-2xl bg-blue-500/20 animate-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sincronizando Perfil</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* MODAL DE SEGURIDAD REDISEÑADO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Lock size={30} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Seguridad</h2>
            <p className="text-slate-500 text-sm mb-8 mt-2 leading-relaxed font-medium">
              Hola <span className="text-blue-600 font-black">{perfil?.user?.nombre}</span>, para proteger tus datos de rendimiento, actualiza tu contraseña inicial.
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <input 
                  type="password" 
                  placeholder="Nueva Contraseña"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                  required
                />
              </div>
              <input 
                type="password" 
                placeholder="Confirmar Contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                required
              />
              <button 
                disabled={mutation.isPending}
                className="w-full bg-[#0f172a] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all flex justify-center items-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Actualizar Acceso
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      <div className={`transition-all duration-700 ${showModal ? "opacity-10 pointer-events-none blur-xl scale-95" : "opacity-100"}`}>
        
        {/* HERO SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-blue-500/20">
                Performance Dashboard
              </span>
              <div className="h-[1px] w-12 bg-slate-200" />
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
              {perfil?.user?.nombre} <br />
              <span className="text-blue-600 not-italic">{perfil?.apellido}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
              <Hash size={20} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Identificación ID</p>
              <p className="text-sm font-black text-slate-700 tracking-tight">{perfil?.rut}</p>
            </div>
          </div>
        </header>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-10">
          
          {/* CARD: MÉTRICAS FÍSICAS */}
          <div className="md:col-span-4 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity size={20} strokeWidth={2.5} />
                </div>
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400">Biomecánica</h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] relative overflow-hidden group/item">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
                    <Ruler size={12} /> Estatura
                  </p>
                  <p className="text-4xl font-black text-slate-800 italic">
                    {perfil?.altura}<span className="text-blue-600 text-sm ml-1">M</span>
                  </p>
                </div>
                <ArrowUpRight className="absolute top-4 right-4 text-slate-200 group-hover/item:text-blue-500 transition-colors" size={24} />
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] relative overflow-hidden group/item">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
                    <Weight size={12} /> Masa Corporal
                  </p>
                  <p className="text-4xl font-black text-slate-800 italic">
                    {perfil?.peso}<span className="text-blue-600 text-sm ml-1">KG</span>
                  </p>
                </div>
                <ArrowUpRight className="absolute top-4 right-4 text-slate-200 group-hover/item:text-blue-500 transition-colors" size={24} />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Specialty</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {perfil?.pruebasEspecialidad?.map((prueba, index) => (
                  <span key={index} className="px-4 py-2 bg-[#0f172a] text-white text-[9px] font-black rounded-xl uppercase tracking-wider hover:bg-blue-600 transition-colors cursor-default">
                    {prueba}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CARD: CTA HISTORIAL (DARK) */}
          <div className="md:col-span-8 bg-[#0f172a] rounded-[3.5rem] relative overflow-hidden flex flex-col p-12 group">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-20 -mb-20" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-2xl mb-8">
                  <Zap size={18} className="text-blue-400 fill-blue-400" />
                  <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em]">Data Analytics ready</span>
                </div>
                
                <h2 className="text-5xl md:text-6xl font-black text-white italic leading-[0.9] tracking-tighter mb-6 max-w-xl">
                  DOMINA TUS <br />
                  <span className="text-blue-500">PROPIAS MARCAS.</span>
                </h2>
                <p className="text-slate-400 text-lg font-medium max-w-sm leading-relaxed mb-10">
                  Hemos procesado tus últimos tiempos en piscina. Tu progresión visual está disponible ahora.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-auto">
                <Link 
                  to="/nadador/mis-tiempos" 
                  className="group/btn relative px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/20"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Analizar Progresión <ChevronRight size={18} strokeWidth={3} />
                  </span>
                </Link>
                
                <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[#0f172a] bg-slate-800 flex items-center justify-center text-blue-400">
                        <Trophy size={16} />
                     </div>
                   ))}
                   <div className="w-12 h-12 rounded-2xl border-4 border-[#0f172a] bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
                     +12
                   </div>
                </div>
              </div>
            </div>
            
            {/* Marca de agua / Icono gigante al fondo */}
            <Trophy className="absolute -bottom-10 -right-10 text-white/[0.03] w-80 h-80 rotate-12 pointer-events-none" strokeWidth={1} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNadador;