import { useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPruebasDisponibles, getRankingIndividual } from "../api/pruebas.api";
import { 
  Trophy, Filter, Calendar, Timer, 
  ChevronLeft, Award, Waves, Search,
  Loader2, Star, AlertCircle, ArrowUpRight
} from "lucide-react";

const RankingNadador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [filtros, setFiltros] = useState({
    estilo: "Libre",
    distancia: 50,
    piscina: 25,
    orden: "asc"
  });

  // 1. OBTENCIÓN DE PRUEBAS DISPONIBLES (Optimizado con staleTime largo)
  const { data: disponibles } = useQuery({
    queryKey: ["pruebas-disponibles", id],
    queryFn: () => getPruebasDisponibles(id).then(res => res.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hora (las pruebas disponibles cambian poco)
  });

  // 2. OBTENCIÓN DEL RANKING (Uso de placeholderData para transiciones suaves)
  const { data: ranking, isLoading, isError, isFetching } = useQuery({
    queryKey: ["ranking", id, filtros],
    queryFn: () => getRankingIndividual(id, filtros).then(res => res.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos de validez
    placeholderData: (previousData) => previousData, // Mantiene la tabla visible mientras carga la nueva
  });

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    const parsedValue = (name === "distancia" || name === "piscina") ? Number(value) : value;
    setFiltros(prev => ({ ...prev, [name]: parsedValue }));
  }, []);

  if (isError) return (
    <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-red-500 gap-6">
      <div className="p-6 bg-red-50 rounded-[2rem] animate-bounce">
        <AlertCircle size={48} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Fallo en el Sistema</h2>
        <p className="text-slate-500 font-medium">No se pudo sincronizar el ranking con la base de datos.</p>
      </div>
      <button 
        onClick={() => window.location.reload()} 
        className="px-10 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200"
      >
        Reintentar Conexión
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-4 md:p-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-24">
      
      {/* HEADER DE RENDIMIENTO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-amber-500/10 rounded-full flex items-center gap-2 text-amber-600">
              <Trophy size={14} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Personal Best Tracker</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter leading-none">
            RANKING <span className="text-blue-600">PANEL</span>
          </h1>
        </div>
        
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all shadow-sm"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Perfil
        </button>
      </header>

      {/* PANEL DE FILTROS INTELIGENTE */}
      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Selector de Estilo */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              <Waves size={12} className="text-blue-400" /> Estilo Técnico
            </label>
            <select 
              name="estilo" 
              value={filtros.estilo} 
              onChange={handleFilterChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-black text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-white/10"
            >
              <option className="bg-slate-900" value="Libre">Libre</option>
              <option className="bg-slate-900" value="Espalda">Espalda</option>
              <option className="bg-slate-900" value="Pecho">Pecho</option>
              <option className="bg-slate-900" value="Mariposa">Mariposa</option>
              <option className="bg-slate-900" value="Combinado">Combinado</option>
            </select>
          </div>

          {/* Selector de Distancia */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              <Search size={12} className="text-blue-400" /> Distancia
            </label>
            <select 
              name="distancia" 
              value={filtros.distancia} 
              onChange={handleFilterChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-black text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-white/10"
            >
              {[25, 50, 100, 200, 400, 800, 1500].map(d => (
                <option key={d} className="bg-slate-900" value={d}>{d} metros</option>
              ))}
            </select>
          </div>

          {/* Selector de Piscina */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              <Filter size={12} className="text-blue-400" /> Vaso (Piscina)
            </label>
            <select 
              name="piscina" 
              value={filtros.piscina} 
              onChange={handleFilterChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-black text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-white/10"
            >
              <option className="bg-slate-900" value={25}>Corta (25m)</option>
              <option className="bg-slate-900" value={50}>Larga (50m)</option>
            </select>
          </div>

          {/* Selector de Orden */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              <Timer size={12} className="text-blue-400" /> Prioridad de Datos
            </label>
            <select 
              name="orden" 
              value={filtros.orden} 
              onChange={handleFilterChange}
              className="w-full bg-blue-600 border-none rounded-2xl px-5 py-4 font-black text-white text-sm shadow-xl shadow-blue-900/40 focus:ring-2 focus:ring-blue-400 transition-all appearance-none cursor-pointer"
            >
              <option value="asc">Mejores Marcas</option>
              <option value="desc">Cronología Reciente</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLA DE RESULTADOS (RANKING) */}
      <div className={`bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100 transition-all duration-500 ${isFetching && !isLoading ? 'opacity-60 scale-[0.99] grayscale' : 'opacity-100'}`}>
        {isLoading ? (
          <div className="p-32 text-center space-y-4">
             <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando Marcas...</p>
          </div>
        ) : ranking?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="pl-12 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                  <th className="px-8 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tiempo Final</th>
                  <th className="px-8 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Competición</th>
                  <th className="pr-12 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ranking.map((prueba, index) => (
                  <tr 
                    key={prueba._id} 
                    className={`group transition-all duration-300 ${prueba.esRecordPersonal ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="pl-12 py-10">
                      {prueba.esRecordPersonal ? (
                        <div className="w-12 h-12 bg-blue-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg shadow-blue-200 rotate-3 group-hover:rotate-0 transition-transform">
                          <Award size={24} />
                        </div>
                      ) : (
                        <span className="text-3xl font-black text-slate-100 group-hover:text-blue-100 italic tabular-nums transition-colors">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-8 py-10">
                      <div className="flex flex-col items-center">
                        <span className={`text-4xl font-black italic tracking-tighter tabular-nums leading-none ${prueba.esRecordPersonal ? 'text-blue-700' : 'text-slate-900'}`}>
                          {prueba.tiempo}
                        </span>
                        {prueba.esRecordPersonal && (
                          <div className="flex items-center gap-1 mt-2 text-[8px] font-black text-blue-600 uppercase tracking-tighter bg-blue-100 px-2 py-0.5 rounded-full">
                            <Star size={10} fill="currentColor" /> Personal Best
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-8 py-10">
                      <div className="space-y-1">
                        <p className="font-black text-slate-800 text-xl italic tracking-tight uppercase leading-none group-hover:text-blue-600 transition-colors">
                          {prueba.competencia?.nombre || "Control Técnico"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                          {filtros.estilo} • {filtros.distancia}m • {filtros.piscina}m Pool
                        </p>
                      </div>
                    </td>

                    <td className="pr-12 py-10 text-right">
                      <div className="inline-flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] group-hover:bg-white group-hover:border-blue-100 transition-all">
                        <Calendar size={14} className="text-slate-400 group-hover:text-blue-500" />
                        <span className="text-slate-600 font-black text-[11px] tabular-nums uppercase">
                          {prueba.fecha ? new Date(prueba.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : "---"}
                        </span>
                        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-500" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-32 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200">
              <Waves size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black italic text-slate-300 uppercase tracking-tighter">Vault Vacío</h3>
              <p className="text-slate-400 text-sm font-medium">No hay marcas registradas para estos criterios técnicos.</p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ANALYTICS */}
      <footer className="flex justify-center pt-6">
        <div className="bg-slate-900 px-10 py-5 rounded-[2rem] border border-white/5 shadow-2xl flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1,2,3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full bg-blue-600/20 border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-blue-500/20 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-6 w-[1px] bg-white/10" />
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            Database Sync: <span className="text-emerald-500">Active</span> • 2026 Sports Engine
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RankingNadador;