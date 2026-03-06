import { useQuery } from "@tanstack/react-query";
import { getNadadores } from "../../api/profesor.api"; // Usamos tu función exportada
import { 
  Users, Trophy, Calendar, TrendingUp, PlusCircle, 
  UserPlus, Clock, ChevronRight, Loader2 
} from "lucide-react";
import { Link } from "react-router-dom";

const DashboardProfesor = () => {
  // 1. FETCH DE NADADORES EXISTENTES
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["nadadores-dashboard"],
    queryFn: () => getNadadores({}), // Llamamos a tu API
    staleTime: 1000 * 60 * 5, // Cacheamos por 5 min para no saturar tu servidor en Render
  });

  // Extraemos el array de nadadores. Tu backend devuelve directamente un array de objetos JSON o envuelto en data según axios
  const nadadores = response?.data || [];
  const totalNadadores = nadadores.length;

  // 2. DATOS SIMULADOS (Hasta que crees los modelos de Competencias y Récords en Mongoose)
  const mockData = {
    recordsMes: 4,
    proximosTorneos: 1,
    mejoraPromedio: "1.2s",
    competencias: [
      { mes: "Abr", dia: "15", nombre: "Clasificatorio Nacional", lugar: "Piscina Centro" }
    ],
    recentRecords: [
      { nombre: "Gonzalo", prueba: "50m Libre", tiempo: "25.42s" },
      { nombre: "Valentina", prueba: "100m Mariposa", tiempo: "1:05.10s" }
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="font-bold animate-pulse tracking-widest text-xs uppercase">Cargando base de datos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-red-500">
        <p className="font-bold">Error al conectar con la API de nadadores.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-xs font-black uppercase bg-red-50 px-4 py-2 rounded-xl"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const stats = [
    { label: "Nadadores Activos", value: totalNadadores, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Récords del Mes", value: mockData.recordsMes, icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Próximos Torneos", value: mockData.proximosTorneos, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Mejora Promedio", value: mockData.mejoraPromedio, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER Y ACCIONES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">Panel de <span className="text-blue-600">Gestión</span></h1>
          <p className="text-slate-500 font-medium">Resumen general de la plataforma</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link to="/profesor/nadadores/nuevo" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95">
            <UserPlus size={18} />
            Nuevo Nadador
          </Link>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-800 mt-1 tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CALENDARIO Y RÉCORDS */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                <Clock className="text-blue-600" size={18} />
                Próximas Citas
              </h3>
            </div>
            
            <div className="divide-y divide-slate-50">
              {mockData.competencias.map((comp, i) => (
                <div key={i} className="p-6 hover:bg-slate-50/80 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="text-center bg-blue-50 text-blue-600 rounded-2xl p-3 min-w-[70px] border border-blue-100">
                      <p className="text-[10px] font-black uppercase">{comp.mes}</p>
                      <p className="text-xl font-black italic">{comp.dia}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{comp.nombre}</h4>
                      <p className="text-xs text-slate-500 font-medium">{comp.lugar}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </section>

          {/* RÉCORDS RECIENTES (DARK) */}
          <section className="bg-[#0f172a] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black uppercase tracking-[0.3em] text-blue-400 text-[10px]">Hitos Recientes</h3>
                <Trophy size={20} className="text-amber-400" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {mockData.recentRecords.map((record, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 p-5 rounded-3xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black shadow-lg">
                        {record.nombre[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{record.nombre}</p>
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-tighter">{record.prueba} • {record.tiempo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: ASISTENCIA */}
        <aside className="space-y-6">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
            <TrendingUp className="text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium text-sm">El módulo de asistencia se activará cuando configures las rutas de Entrenamientos en el servidor.</p>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default DashboardProfesor;