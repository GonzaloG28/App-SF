import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Trophy, Timer, ChevronRight, Waves, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/authContext";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // OPTIMIZACIÓN DE RENDIMIENTO Y BUG FIX: 
  // Si el usuario llega al home y hay basura en el cache, limpiamos para evitar el bug del dashboard vacío.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      // Si hay token pero no hay usuario cargado en el contexto, 
      // es una sesión "zombie". Limpiamos para asegurar un login fresco.
      logout(); 
    }
  }, [user, logout]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden selection:bg-blue-500/30">
      
      {/* Contenedor Principal Adaptativo */}
      <div className="max-w-7xl w-full bg-[#0f172a]/50 backdrop-blur-md rounded-[2.5rem] md:rounded-[4rem] p-6 sm:p-10 md:p-16 relative overflow-hidden shadow-2xl border border-slate-800/50">
        
        {/* Glows Dinámicos - Optimizados para no afectar el scroll */}
        <div className="absolute top-0 right-0 w-[20rem] h-[20rem] md:w-[40rem] md:h-[40rem] bg-blue-600/10 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[15rem] h-[15rem] md:w-[30rem] md:h-[30rem] bg-indigo-600/10 rounded-full blur-[100px] -ml-10 -mb-10 pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Lado Izquierdo: Branding y Acción */}
          <div className="space-y-6 md:space-y-10 text-center lg:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 rotate-3">
                  <Waves size={24} />
                </div>
                <div>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] leading-none">Plataforma Oficial</p>
                  <h2 className="text-white text-lg font-bold tracking-tighter">App<span className="text-blue-500">ÑSF</span></h2>
                </div>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] lg:leading-[0.85]">
                DOMINA TU <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">
                  RENDIMIENTO.
                </span>
              </h1>
            </div>

            <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Ecosistema digital de alto rendimiento. Gestiona métricas, tiempos y progresos en un entorno diseñado exclusivamente para atletas y entrenadores de élite.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link to="/login" className="w-full sm:w-auto group">
                <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-3 group-hover:-translate-y-1">
                  Acceder al Panel
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>

          {/* Lado Derecho: Grid de Características (Ahora visible y ordenado en móvil) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-right-8 duration-1000">
            
            <div className="bg-slate-800/40 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] border border-slate-700/50 hover:bg-slate-800/60 transition-all group">
              <Activity size={24} className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-black text-base mb-2 italic uppercase tracking-tight">Métricas</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Control antropométrico y de especialidad por atleta.</p>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] border border-slate-700/50 hover:bg-slate-800/60 transition-all group sm:mt-8">
              <Timer size={24} className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-black text-base mb-2 italic uppercase tracking-tight">Tiempos</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Historial de marcas y progresión técnica detallada.</p>
            </div>
            
            <div className="sm:col-span-2 bg-gradient-to-r from-blue-600/10 to-transparent p-6 md:p-8 rounded-[2.5rem] border border-blue-500/20 flex items-center justify-between group">
              <div className="max-w-[70%]">
                <h3 className="text-white font-black text-lg mb-1 italic uppercase tracking-tight">Gestión de Torneos</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Resultados centralizados</p>
              </div>
              <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:rotate-12 transition-transform">
                <Trophy size={24} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;