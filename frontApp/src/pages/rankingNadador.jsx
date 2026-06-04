import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRankingIndividual } from "../api/pruebas.api";
import { 
  Trophy, Filter, Calendar, Timer, 
  ChevronLeft, Waves, Search,
  Loader2, Star, AlertCircle, Zap
} from "lucide-react";

const RankingNadador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [filtros, setFiltros] = useState({
    estilo: "Libre",
    distancia: 50,
    piscina: 25,
    orden: "fecha_desc"
  });

  const { data: ranking, isLoading, isError, isFetching } = useQuery({
    queryKey: ["ranking", id, filtros],
    queryFn: () => getRankingIndividual(id, filtros).then(res => res.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    const parsedValue = (name === "distancia" || name === "piscina") ? Number(value) : value;
    setFiltros(prev => ({ ...prev, [name]: parsedValue }));
  }, []);

  // Función auxiliar para formatear la fecha técnica
  const formatFecha = (prueba) => {
    // Priorizamos la fecha del campeonato/competencia
    const fechaTarget = prueba.competencia?.fecha || prueba.fecha;
    if (!fechaTarget) return "S/D";
    
    return new Date(fechaTarget).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: "2-digit",
      timeZone: 'UTC' // Recomendado para que no cambie el día por la zona horaria del navegador
    });
  };

  if (isError) return (
    <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-orange-600 gap-6 px-6">
      <div className="p-6 bg-orange-50 rounded-[2.5rem] animate-pulse">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase text-slate-900">Error de Conexión</h2>
      <button onClick={() => window.location.reload()} className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase">
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 p-4 md:p-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full shadow-lg">
            <Zap size={10} fill="currentColor" />
            <span className="text-[11px] font-black uppercase tracking-widest">ñsf</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 italic tracking-tighter leading-[0.85]">
            RANKING <br className="md:hidden" />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent not-italic">NADADOR</span>
          </h1>
        </div>
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-400 font-black text-[11px] uppercase tracking-widest group">
          <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-all">
            <ChevronLeft size={16} />
          </div>
          <span>Volver</span>
        </button>
      </header>

      {/* FILTROS */}
      <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {[
            { label: "Estilo", name: "estilo", icon: Waves, options: ["Libre", "Espalda", "Pecho", "Mariposa", "comb."], color: "text-blue-500" },
            { label: "Metraje", name: "distancia", icon: Search, options: [25, 50, 100, 200, 400, 800, 1500], color: "text-emerald-500" },
            { label: "Vaso", name: "piscina", icon: Filter, options: [{l: "Corta (25m)", v: 25}, {l: "Larga (50m)", v: 50}], color: "text-blue-500" }
          ].map((f) => (
            <div key={f.name} className="space-y-3">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
                <f.icon size={12} className={f.color} /> {f.label}
              </label>
              <select 
                name={f.name} value={filtros[f.name]} onChange={handleFilterChange}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-5 py-3.5 font-black text-white text-[11px] uppercase outline-none focus:border-emerald-500 transition-all"
              >
                {f.options.map(opt => (
                  <option key={opt.v || opt} value={opt.v || opt}>{opt.l || opt}</option>
                ))}
              </select>
            </div>
          ))}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
              <Calendar size={12} className="text-orange-500" /> Ordenar por
            </label>
            <select 
              name="orden" 
              value={filtros.orden} 
              onChange={handleFilterChange}
              className="w-full bg-blue-600 border-none rounded-xl px-5 py-3.5 font-black text-white text-[11px] uppercase shadow-lg shadow-blue-900/40 outline-none appearance-none cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <option value="fecha_desc">Más Recientes (Fecha ↓)</option>
              <option value="fecha_asc">Más Antiguos (Fecha ↑)</option>
              <option value="tiempo_asc">Mejores Tiempos (Crono ↑)</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className={`bg-white rounded-[2.5rem] md:rounded-[4.5rem] shadow-xl border border-slate-50 overflow-hidden transition-all ${isFetching && !isLoading ? 'opacity-50' : ''}`}>
        {isLoading ? (
          <div className="p-20 text-center space-y-4">
             <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
             <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.4em]">Sincronizando...</p>
          </div>
        ) : ranking?.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="pl-14 py-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">Posición</th>
                    <th className="px-8 py-10 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Crono</th>
                    <th className="px-8 py-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">Evento</th>
                    <th className="pr-14 py-10 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Fecha Oficial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ranking.map((prueba, index) => (
                    <tr key={prueba._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="pl-14 py-10">
                        {prueba.esRecordPersonal ? (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
                            <Trophy size={20} />
                          </div>
                        ) : (
                          <span className="text-3xl font-black text-slate-100 italic tabular-nums">#{String(index + 1).padStart(2, '0')}</span>
                        )}
                      </td>
                      <td className="px-8 py-10 text-center">
                        <span className={`text-4xl font-black italic tracking-tighter ${prueba.esRecordPersonal ? 'text-blue-700' : 'text-slate-900'}`}>{prueba.tiempo}</span>
                      </td>
                      <td className="px-8 py-10">
                        <p className="font-black text-slate-800 text-lg italic uppercase">{prueba.competencia?.nombre || "Control Técnico"}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{filtros.estilo} • {filtros.distancia}m</p>
                      </td>
                      <td className="pr-14 py-10 text-right">
                         <span className="px-4 py-2 bg-slate-50 rounded-xl text-[11px] font-black text-slate-600 tabular-nums">
                           {formatFecha(prueba)}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {ranking.map((prueba, index) => (
                <div key={prueba._id} className={`p-6 space-y-4 ${prueba.esRecordPersonal ? 'bg-blue-50/30' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-300 italic">#{String(index + 1).padStart(2, '0')}</span>
                      {prueba.esRecordPersonal && (
                        <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-tighter">
                          <Star size={8} fill="currentColor" /> Personal Best
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 uppercase">
                      <Calendar size={10} /> {formatFecha(prueba)}
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-900 uppercase italic truncate max-w-[180px]">
                        {prueba.competencia?.nombre || "Control Técnico"}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">{filtros.estilo} • {filtros.distancia}m</p>
                    </div>
                    <span className={`text-4xl font-black italic tracking-tighter leading-none ${prueba.esRecordPersonal ? 'text-blue-600' : 'text-slate-900'}`}>
                      {prueba.tiempo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-20 text-center space-y-4">
            <Waves size={40} className="mx-auto text-slate-100" />
            <p className="text-slate-300 font-black text-[11px] uppercase tracking-widest">Sin registros</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingNadador;