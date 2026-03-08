import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNadadores } from "../../api/profesor.api";
import { 
  Users, Trophy, Calendar, TrendingUp, PlusCircle, 
  UserPlus, Clock, ChevronRight, Loader2 
} from "lucide-react";
import { Link } from "react-router-dom";

// 1. EXTRAER DATOS ESTÁTICOS FUERA DEL COMPONENTE
// Así evitamos que se recreen en cada render de React, ahorrando memoria.
const MOCK_DATA = {
  recordsMes: 4,
  proximosTorneos: 1,
  mejoraPromedio: "1.2s",
  competencias: [
    { mes: "JLO", dia: "6", nombre: "Clasificatorio Nacional Categorias", lugar: "Santiago" }
  ],
  recentRecords: [
    { nombre: "Gonzalo", prueba: "50m Libre", tiempo: "25.42s" },
    { nombre: "Sofia", prueba: "200 pecho", tiempo: "2:45.10s" }
  ]
};

const DashboardProfesor = () => {
  // FETCH DE NADADORES EXISTENTES
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["nadadores-dashboard"],
    queryFn: () => getNadadores({}),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché (Excelente para no saturar Render)
  });

  const nadadores = response?.data || [];
  const totalNadadores = nadadores.length;

  // 2. MEMOIZAR ARRAY DEPENDIENTE DEL ESTADO
  // Solo se recalcula si cambia la cantidad de nadadores
  const stats = useMemo(() => [
    { label: "Nadadores Activos", value: totalNadadores, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Récords del Mes", value: MOCK_DATA.recordsMes, icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Próximos Torneos", value: MOCK_DATA.proximosTorneos, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Mejora Promedio", value: MOCK_DATA.mejoraPromedio, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ], [totalNadadores]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="font-bold animate-pulse tracking-widest text-xs uppercase">Conectando con base de datos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-500">
        <p className="font-bold mb-4 text-center">Error al sincronizar con el servidor.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-xs font-black uppercase bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl transition-colors active:scale-95"
        >
          Reintentar Conexión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER Y ACCIONES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight italic">
            Panel de <span className="text-blue-600">Gestión</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Resumen general de la plataforma</p>
        </div>
        
        <Link 
          to="/profesor/nadadores/nuevo" 
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 sm:py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
        >
          <UserPlus size={18} />
          Nuevo Nadador
        </Link>
      </div>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all`}>
              <stat.icon size={28} />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-800 mt-1 tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* ÁREA DE CONTENIDO INFERIOR */}
      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* PRÓXIMAS CITAS */}
          <section className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                <Clock className="text-blue-600" size={18} />
                Próximas Citas
              </h3>
            </div>
            
            <div className="divide-y divide-slate-50">
              {MOCK_DATA.competencias.map((comp, i) => (
                <div key={i} className="p-6 sm:p-8 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="text-center bg-blue-50 text-blue-600 rounded-2xl p-3 min-w-[70px] border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <p className="text-[10px] font-black uppercase">{comp.mes}</p>
                      <p className="text-xl font-black italic">{comp.dia}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{comp.nombre}</h4>
                      <p className="text-xs text-slate-500 font-medium">{comp.lugar}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all hidden sm:block" />
                </div>
              ))}
            </div>
          </section>

          {/* HITOS RECIENTES (DARK MODE) */}
          <section className="bg-[#0f172a] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-blue-400 text-[10px]">Hitos Recientes</h3>
                <Trophy size={20} className="text-amber-400" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {MOCK_DATA.recentRecords.map((record, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 p-4 sm:p-5 rounded-3xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black shadow-lg shrink-0">
                        {record.nombre[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{record.nombre}</p>
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-tighter truncate">
                          {record.prueba} • {record.tiempo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* MÓDULO DE ASISTENCIA */}
        <aside className="space-y-6">
          <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center h-full min-h-[250px] sm:min-h-[300px]">
            <TrendingUp className="text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium text-sm">El módulo de asistencia se activará al configurar las rutas de entrenamiento.</p>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default DashboardProfesor;