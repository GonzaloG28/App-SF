import { Link } from "react-router-dom";
import { Activity, Trophy, Timer, ChevronRight, Waves } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
      
      {/* Contenedor Principal estilo "AppÑSF" */}
      <div className="max-w-6xl w-full bg-[#0f172a] rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 relative overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-800">
        
        {/* Efectos de luz de fondo (Glows) */}
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-indigo-600/10 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Lado Izquierdo: Textos y Botón */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
                  <Waves size={20} />
                </div>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Plataforma Oficial</p>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9]">
                Domina tu <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                  Rendimiento.
                </span>
              </h1>
            </div>

            <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md font-medium">
              El entorno digital exclusivo para la gestión deportiva. Analiza tus tiempos, revisa tu historial de competencias y evalúa el progreso físico en un ecosistema diseñado para atletas de alto nivel.
            </p>

            <div className="pt-4">
              <Link to="/login" className="inline-block w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group">
                  Iniciar Sesión
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>

          {/* Lado Derecho: Tarjetas Explicativas (Visible en pantallas grandes) */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 mt-12 group">
              <Activity size={28} className="text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-black text-lg mb-2 italic tracking-tight">Métricas Físicas</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Registro detallado de peso, altura y pruebas de especialidad para cada nadador.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 mb-12 group">
              <Timer size={28} className="text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-black text-lg mb-2 italic tracking-tight">Marcas y Tiempos</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Historial completo de marcas personales, progresión y análisis de rendimiento.
              </p>
            </div>
            
            <div className="col-span-2 bg-gradient-to-r from-blue-600/20 to-transparent p-8 rounded-[2.5rem] border border-blue-500/20 flex items-center justify-between">
              <div>
                <h3 className="text-white font-black text-xl mb-1 italic tracking-tight">Gestión de Torneos</h3>
                <p className="text-blue-200/60 text-sm font-medium">Resultados y convocatorias centralizadas.</p>
              </div>
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
                <Trophy size={28} />
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;