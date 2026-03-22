import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNadadores } from "../../api/profesor.api";
import { 
  Users, Trophy, Calendar, TrendingUp, 
  UserPlus, Clock, ChevronRight, Loader2, Waves 
} from "lucide-react";
import { Link } from "react-router-dom";

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
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["nadadores-dashboard"],
    queryFn: () => getNadadores({}),
    staleTime: 1000 * 60 * 5,
  });

  const nadadores = response?.data || [];
  const totalNadadores = nadadores.length;

  // Actualización de colores para las stats (Azul, Verde, Naranja)
  const stats = useMemo(() => [
    { label: "Nadadores Activos", value: totalNadadores, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Récords del Mes", value: MOCK_DATA.recordsMes, icon: Trophy, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Próximos Torneos", value: MOCK_DATA.proximosTorneos, icon: Calendar, color: "text-green-600", bg: "bg-green-50" },
    { label: "Mejora Promedio", value: MOCK_DATA.mejoraPromedio, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  ], [totalNadadores]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="font-black tracking-[0.2em] text-[11px] uppercase italic text-slate-500">Sincronizando Sistema ÑSF...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-orange-600">
        <p className="font-black italic mb-4 text-center tracking-tighter uppercase">Error de sincronización</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-[11px] font-black uppercase tracking-widest bg-orange-50 hover:bg-orange-100 text-orange-600 px-8 py-4 rounded-2xl transition-all active:scale-95 border border-orange-100"
        >
          Reintentar Conexión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER Y ACCIONES - Gradiente de marca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            Panel de <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">Gestión</span>
          </h1>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-1">High Performance Center</p>
        </div>
        
        <Link 
          to="/profesor/nadadores/nuevo" 
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] italic"
        >
          <UserPlus size={18} strokeWidth={3} />
          Nuevo Nadador
        </Link>
      </div>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 group">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all shadow-sm`}>
              <stat.icon size={28} strokeWidth={2.5} />
            </div>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em]">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-900 mt-1 tracking-tighter italic">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* ÁREA DE CONTENIDO INFERIOR */}
      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* PRÓXIMAS CITAS */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-7 sm:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] flex items-center gap-3">
                <Clock className="text-blue-600" size={18} />
                Próximas Citas
              </h3>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            
            <div className="divide-y divide-slate-50">
              {MOCK_DATA.competencias.map((comp, i) => (
                <div key={i} className="p-7 sm:p-8 hover:bg-blue-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="text-center bg-gradient-to-br from-blue-600 to-green-500 text-white rounded-2xl p-4 min-w-[75px] shadow-lg shadow-blue-500/10 transform group-hover:rotate-3 transition-transform">
                      <p className="text-[11px] font-black uppercase tracking-tighter opacity-80">{comp.mes}</p>
                      <p className="text-2xl font-black italic leading-none mt-1">{comp.dia}</p>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors italic uppercase text-sm tracking-tight">{comp.nombre}</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{comp.lugar}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all hidden sm:block" />
                </div>
              ))}
            </div>
          </section>

          {/* HITOS RECIENTES (DISEÑO MARCA) */}
          <section className="bg-slate-900 rounded-[2.5rem] p-7 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800">
            {/* Elemento decorativo de fondo */}
            <div className="absolute -right-10 -bottom-10 opacity-10 text-white rotate-12">
              <Waves size={200} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black uppercase tracking-[0.3em] text-green-500 text-[11px]">Hitos Recientes</h3>
                <Trophy size={22} className="text-orange-500 animate-bounce" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {MOCK_DATA.recentRecords.map((record, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 p-5 rounded-[2rem] backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-xs font-black shadow-lg shrink-0 italic">
                        {record.nombre[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-black uppercase italic tracking-tight">{record.nombre}</p>
                        <p className="text-[11px] text-blue-400 font-black uppercase tracking-widest mt-1">
                          {record.prueba} <span className="text-white">|</span> {record.tiempo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* MÓDULO DE ASISTENCIA - Colores suaves */}
        <aside className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] group border-dashed border-2">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="text-slate-200" size={40} />
            </div>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
              Módulo de asistencia <br />
              <span className="text-blue-500/50 italic">Próximamente disponible</span>
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default DashboardProfesor;