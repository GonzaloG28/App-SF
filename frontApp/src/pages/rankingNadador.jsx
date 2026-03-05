import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPruebasDisponibles, getRankingIndividual } from "../api/pruebas.api";
import { 
  Trophy, Filter, Calendar, Timer, 
  ChevronLeft, Award, Waves, Search,
  Loader2, Star
} from "lucide-react";

const RankingNadador = () => {
  const { id } = useParams();
  
  const [filtros, setFiltros] = useState({
    estilo: "Libre",
    distancia: 50,
    piscina: 25,
    orden: "asc"
  });

  const { data: disponibles } = useQuery({
    queryKey: ["pruebas-disponibles", id],
    queryFn: () => getPruebasDisponibles(id).then(res => res.data),
  });

  const { data: ranking, isLoading } = useQuery({
    queryKey: ["ranking", id, filtros],
    queryFn: () => getRankingIndividual(id, filtros).then(res => res.data),
    enabled: !!id,
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER DINÁMICO */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600">
              <Trophy size={18} />
            </div>
            <p className="text-amber-600 text-[10px] font-black uppercase tracking-[0.3em]">Hall of Fame</p>
          </div>
          <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter">
            RANKING <span className="text-blue-600">PERSONAL</span>
          </h1>
        </div>
        
        <Link 
          to={-1} 
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all shadow-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver
        </Link>
      </header>

      {/* PANEL DE FILTROS - DISEÑO "GLASS" */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <Waves size={12} className="text-blue-500" /> Estilo
            </label>
            <select 
              name="estilo" 
              value={filtros.estilo} 
              onChange={handleFilterChange}
              className="w-full bg-slate-50 border-none rounded-[1.2rem] px-5 py-4 font-black text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="Libre">Libre</option>
              <option value="Espalda">Espalda</option>
              <option value="Pecho">Pecho</option>
              <option value="Mariposa">Mariposa</option>
              <option value="Combinado">Combinado</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <Search size={12} className="text-blue-500" /> Distancia
            </label>
            <select 
              name="distancia" 
              value={filtros.distancia} 
              onChange={handleFilterChange}
              className="w-full bg-slate-50 border-none rounded-[1.2rem] px-5 py-4 font-black text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            >
              {[25, 50, 100, 200, 400, 800, 1500].map(d => (
                <option key={d} value={d}>{d} metros</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <Filter size={12} className="text-blue-500" /> Piscina
            </label>
            <select 
              name="piscina" 
              value={filtros.piscina} 
              onChange={handleFilterChange}
              className="w-full bg-slate-50 border-none rounded-[1.2rem] px-5 py-4 font-black text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value={25}>Corta (25m)</option>
              <option value={50}>Larga (50m)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <Timer size={12} className="text-blue-500" /> Prioridad
            </label>
            <select 
              name="orden" 
              value={filtros.orden} 
              onChange={handleFilterChange}
              className="w-full bg-blue-600 border-none rounded-[1.2rem] px-5 py-4 font-black text-white text-sm shadow-lg shadow-blue-200 focus:ring-2 focus:ring-blue-400 transition-all appearance-none cursor-pointer"
            >
              <option value="asc">Mejores Tiempos</option>
              <option value="desc">Más Recientes</option>
            </select>
          </div>

        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        {isLoading ? (
          <div className="p-32 text-center">
             <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Consultando Cronometrajes...</p>
          </div>
        ) : ranking?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="pl-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pos</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Marca</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento / Competencia</th>
                  <th className="pr-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ranking.map((prueba, index) => (
                  <tr 
                    key={prueba._id} 
                    className={`group transition-all duration-300 ${prueba.esRecordPersonal ? 'bg-amber-50/30' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="pl-12 py-8">
                      {prueba.esRecordPersonal ? (
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200 animate-pulse">
                          <Award size={20} />
                        </div>
                      ) : (
                        <span className="text-2xl font-black text-slate-200 group-hover:text-blue-200 italic tabular-nums transition-colors">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-8 py-8">
                      <div className="flex flex-col items-center">
                        <span className={`text-3xl font-black italic tracking-tighter tabular-nums ${prueba.esRecordPersonal ? 'text-amber-600' : 'text-slate-900'}`}>
                          {prueba.tiempo}
                        </span>
                        {prueba.esRecordPersonal && (
                          <span className="text-[8px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full mt-1 uppercase tracking-tighter">
                            New Record
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-8 py-8">
                      <div className="space-y-1">
                        <p className="font-black text-slate-800 text-lg italic tracking-tight uppercase group-hover:text-blue-600 transition-colors">
                          {prueba.competencia?.nombre}
                        </p>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Star size={12} className={prueba.esRecordPersonal ? 'text-amber-400' : 'text-slate-300'} />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            {filtros.estilo} • {filtros.distancia}m • Piscina {filtros.piscina}m
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="pr-12 py-8 text-right">
                      <div className="inline-flex items-center gap-3 px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-600 font-black text-[11px] tabular-nums group-hover:border-blue-100 transition-all">
                        <Calendar size={14} className="text-blue-500" />
                        {new Date(prueba.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-32 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Waves size={40} />
            </div>
            <h3 className="text-2xl font-black italic text-slate-300 uppercase tracking-tighter">Sin registros</h3>
            <p className="text-slate-400 text-sm font-medium mt-2">No hay marcas registradas para esta combinación.</p>
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      <footer className="flex justify-center">
        <div className="bg-white px-8 py-4 rounded-full border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white" />)}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Datos sincronizados con el panel de oficiales
          </p>
        </div>
      </footer>

    </div>
  );
};

export default RankingNadador;