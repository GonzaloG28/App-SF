import { 
  Users, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  PlusCircle, 
  UserPlus, 
  Clock,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const DashboardProfesor = () => {
  // Estos datos luego vendrán de tus consultas a la API (useQuery)
  const stats = [
    { label: "Nadadores Activos", value: "24", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Récords del Mes", value: "12", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Próximos Torneos", value: "3", icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Mejora Promedio", value: "2.4s", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* BIENVENIDA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Resumen de Gestión</h1>
          <p className="text-slate-500 font-medium">Bienvenido de vuelta al panel de App<span className="text-blue-600">ÑSF</span></p>
        </div>
        
        <div className="flex gap-3">
          <Link to="/profesor/nadadores" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200">
            <UserPlus size={18} />
            Nuevo Nadador
          </Link>
          <Link to="/profesor/crear-entrenamiento" className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">
            <PlusCircle size={18} />
            Crear Entrenamiento
          </Link>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PRÓXIMAS COMPETENCIAS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                Próximas Competencias
              </h3>
              <Link to="/profesor/calendario" className="text-xs font-bold text-blue-600 hover:underline">Ver calendario</Link>
            </div>
            
            <div className="divide-y divide-slate-50">
              {/* Ejemplo de fila de competencia */}
              {[1, 2].map((_, i) => (
                <div key={i} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-slate-100 rounded-xl p-2 min-w-[60px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Mar</p>
                      <p className="text-xl font-black text-slate-700">{12 + i}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Copa Estadio Italiano 2024</h4>
                      <p className="text-xs text-slate-500 font-medium">Piscina 25m • Santiago, Chile</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              ))}
            </div>
          </div>

          {/* MEJORES TIEMPOS RECIENTES */}
          <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-black uppercase tracking-widest text-blue-400 text-xs mb-6">Récords Personales Recientes</h3>
              <div className="space-y-4">
                {[1, 2].map((_, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-black">G</div>
                      <div>
                        <p className="text-sm font-bold">Gonzalo Sepúlveda</p>
                        <p className="text-[10px] text-slate-400 uppercase">50m Libre • 25.42s</p>
                      </div>
                    </div>
                    <span className="text-amber-400 font-black text-xs">⭐ NUEVO PB</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          </div>
        </div>

        {/* COLUMNA DERECHA: ESTADO DE ENTRENAMIENTOS */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <h3 className="font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} />
              Actividad
            </h3>
            <div className="space-y-6">
              <p className="text-sm text-slate-500 font-medium">Asistencia promedio esta semana:</p>
              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full w-[85%] shadow-lg shadow-emerald-200"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-800">85%</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Asistencia</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-800">14</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Sesiones</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardProfesor;