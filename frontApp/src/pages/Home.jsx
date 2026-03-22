import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Trophy, Timer, ChevronRight, Waves } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, logout } = useAuth();
  // useNavigate se mantiene por si lo necesitas más adelante
  const navigate = useNavigate();

  useEffect(() => {
    // Solo ejecutar si no hay usuario pero sí hay token huérfano
    const token = localStorage.getItem("token");
    if (token && !user) {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← Solo al montar, no en cada render. Evita loop si logout cambia referencia.

  return (
    
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden selection:bg-green-500/20">

      <div className="max-w-7xl w-full bg-white/80 backdrop-blur-md rounded-[2.5rem] md:rounded-[4rem] p-6 sm:p-10 lg:p-12 xl:p-16 relative overflow-hidden shadow-2xl shadow-slate-200/50 border border-white my-auto">

        <div
          className="absolute top-0 right-0 w-[20rem] h-[20rem] md:w-[40rem] md:h-[40rem] bg-green-400/15 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"
          style={{ willChange: "transform" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[15rem] h-[15rem] md:w-[30rem] md:h-[30rem] bg-blue-500/15 rounded-full blur-[100px] -ml-10 -mb-10 pointer-events-none"
          style={{ willChange: "transform" }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 xl:gap-16 items-center">

          {/* — Columna izquierda — */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 rotate-3 shrink-0">
                  <Waves size={24} />
                </div>
                <div>
                  <p className="text-green-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] leading-none mb-1">
                    Plataforma Oficial
                  </p>
                  <h2 className="text-slate-900 text-base md:text-lg font-bold tracking-tighter">
                    App<span className="text-blue-600">ÑSF</span>
                  </h2>
                </div>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-black text-slate-900 italic tracking-tighter leading-[0.9] w-full">
                DOMINA TU <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-blue-600">
                  RENDIMIENTO.
                </span>
              </h1>
            </div>

            <p className="text-slate-600 text-sm md:text-base xl:text-lg leading-relaxed max-w-lg font-medium">
              Ecosistema digital de alto rendimiento. Gestiona métricas, tiempos y progresos
              en un entorno diseñado exclusivamente para atletas y entrenadores de élite.
            </p>

            <div className="pt-2 w-full max-w-xs sm:max-w-none">
              <Link to="/login" className="block w-full sm:inline-block group">
                <button
                  type="button"
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-3 group-hover:-translate-y-1"
                >
                  Acceder al Panel
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>

          {/* — Columna derecha: tarjetas - */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 lg:mt-0">

            {/* Tarjeta Métricas */}
            <div className="bg-slate-50 p-6 xl:p-8 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 group flex flex-col justify-center">
              <Activity
                size={24}
                className="text-green-600 mb-4 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-slate-900 font-black text-sm xl:text-base mb-2 italic uppercase tracking-tight">
                Métricas
              </h3>
              <p className="text-slate-500 text-xs xl:text-sm leading-relaxed">
                Control antropométrico y de especialidad por atleta.
              </p>
            </div>

            {/* Tarjeta Tiempos */}
            <div className="bg-slate-50 p-6 xl:p-8 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 group flex flex-col justify-center">
              <Timer
                size={24}
                className="text-blue-600 mb-4 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-slate-900 font-black text-sm xl:text-base mb-2 italic uppercase tracking-tight">
                Tiempos
              </h3>
              <p className="text-slate-500 text-xs xl:text-sm leading-relaxed">
                Historial de marcas y progresión técnica detallada.
              </p>
            </div>

            {/* Tarjeta Torneos */}
            <div className="sm:col-span-2 bg-gradient-to-r from-blue-50 to-green-50 p-6 xl:p-8 rounded-[2.5rem] border border-blue-100/50 flex items-center justify-between group hover:shadow-md transition-all sm:mt-6">
              <div className="max-w-[70%]">
                <h3 className="text-slate-900 font-black text-base xl:text-lg mb-1 italic uppercase tracking-tight">
                  Gestión de Torneos
                </h3>
                <p className="text-slate-500 text-[9px] xl:text-[10px] font-bold uppercase tracking-widest">
                  Resultados centralizados
                </p>
              </div>
              <div className="w-12 h-12 xl:w-14 xl:h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 group-hover:rotate-12 group-hover:scale-110 transition-all shrink-0">
                <Trophy size={20} className="xl:w-6 xl:h-6" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;