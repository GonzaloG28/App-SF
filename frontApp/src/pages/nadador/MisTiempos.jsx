import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { 
  Trophy, Waves, Loader2, Calendar, 
  TrendingDown, LineChart as ChartIcon, 
  Search, Filter, Timer, Star, Zap
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const tiempoASegundos = (tiempoStr) => {
  if (!tiempoStr) return 0;
  const partes = tiempoStr.split(':');
  if (partes.length === 2) {
    const [min, seg] = partes;
    return parseFloat(min) * 60 + parseFloat(seg);
  }
  return parseFloat(tiempoStr);
};

const MisTiempos = () => {
  const [filtros, setFiltros] = useState({
    estilo: "Libre",
    distancia: 50,
    piscina: 25,
    orden: "asc"
  });

  const { data: perfil } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => {
      const res = await api.get("/nadadores/perfil");
      return res.data;
    }
  });

  const { data: ranking, isLoading, isFetching } = useQuery({
    queryKey: ["miRanking", perfil?._id, filtros],
    queryFn: async () => {
      const res = await api.get(`/pruebas/ranking/${perfil._id}`, { params: filtros });
      return res.data;
    },
    enabled: !!perfil?._id,
  });

  const datosGrafica = useMemo(() => {
    if (!ranking) return [];
    return [...ranking]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map(p => ({
        fecha: new Date(p.fecha).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        segundos: tiempoASegundos(p.tiempo),
        tiempoOriginal: p.tiempo,
        evento: p.competencia?.nombre
      }));
  }, [ranking]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    const parsedValue = (name === "distancia" || name === "piscina") ? Number(value) : value;
    setFiltros(prev => ({ ...prev, [name]: parsedValue }));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 p-4 md:p-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
      
      {/* HEADER DINÁMICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200">
            <Zap size={10} fill="currentColor" />
            <span className="text-[11px] font-black uppercase tracking-widest">ñsf</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 italic tracking-tighter leading-[0.85] uppercase">
            Mis <br className="md:hidden" />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent not-italic">Marcas</span>
          </h1>
        </div>
      </header>

      {/* PANEL DE CONTROL (FILTROS) */}
      <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32" />
        
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {[
            { label: "Estilo", name: "estilo", icon: Waves, options: ["Libre", "Espalda", "Pecho", "Mariposa", "Comb."], color: "text-blue-500" },
            { label: "Metraje", name: "distancia", icon: Search, options: [25, 50, 100, 200, 400, 800, 1500], color: "text-emerald-500" },
            { label: "Vaso", name: "piscina", icon: Filter, options: [{l: "Corta (25m)", v: 25}, {l: "Larga (50m)", v: 50}], color: "text-blue-500" }
          ].map((f) => (
            <div key={f.name} className="space-y-3">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
                <f.icon size={12} className={f.color} /> {f.label}
              </label>
              <select 
                name={f.name} 
                value={filtros[f.name]} 
                onChange={handleFilterChange}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-5 py-3.5 font-black text-white text-[11px] uppercase outline-none focus:border-emerald-500 transition-all"
              >
                {f.options.map(opt => (
                  <option key={opt.v || opt} value={opt.v || opt} className="bg-slate-900">{opt.l || opt}</option>
                ))}
              </select>
            </div>
          ))}

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
              <Timer size={12} className="text-orange-500" /> Prioridad
            </label>
            <select 
              name="orden" value={filtros.orden} onChange={handleFilterChange}
              className="w-full bg-blue-600 border-none rounded-xl px-5 py-3.5 font-black text-white text-[11px] uppercase shadow-lg shadow-blue-900/40 outline-none appearance-none"
            >
              <option value="asc">Mejor Marca (PB)</option>
              <option value="desc">Más Recientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* DASHBOARD DE ANALÍTICA (GRÁFICA) */}
      {ranking?.length > 1 && (
        <section className="bg-[#0f172a] rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <TrendingDown size={20} />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Live Progression</span>
              </div>
              <h3 className="text-white font-black italic text-3xl md:text-4xl uppercase tracking-tighter">
                Curva de <span className="text-blue-500">Rendimiento</span>
              </h3>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1">Mejor Tiempo Actual</p>
              <p className="text-3xl font-black text-white italic leading-none">{ranking[0]?.tiempo}s</p>
            </div>
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosGrafica}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="fecha" stroke="#475569" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} dy={15} />
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '15px' }}
                  itemStyle={{ color: '#60a5fa', fontWeight: '900', fontSize: '12px' }}
                  labelStyle={{ display: 'none' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                  formatter={(value, name, props) => [props.payload.tiempoOriginal + "s", "MARCA"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="segundos" 
                  stroke="#3b82f6" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorTime)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* RESULTADOS (Mobile Cards / Desktop Table) */}
      <div className={`bg-white rounded-[2.5rem] md:rounded-[4.5rem] shadow-xl border border-slate-50 overflow-hidden transition-all ${isFetching && !isLoading ? 'opacity-50' : ''}`}>
        {isLoading ? (
          <div className="p-20 text-center space-y-4">
             <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
             <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.4em]">Compilando marcas...</p>
          </div>
        ) : ranking?.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="pl-14 py-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                    <th className="px-8 py-10 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Tiempo Oficial</th>
                    <th className="px-8 py-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">Competencia / Sede</th>
                    <th className="pr-14 py-10 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Data Fecha</th>
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
                        <span className={`text-4xl font-black italic tracking-tighter ${prueba.esRecordPersonal ? 'text-blue-700' : 'text-slate-900'}`}>
                          {prueba.tiempo}
                        </span>
                      </td>
                      <td className="px-8 py-10">
                        <p className="font-black text-slate-800 text-lg italic uppercase">{prueba.competencia?.nombre || "Control Técnico"}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{filtros.estilo} • {filtros.distancia}m</p>
                      </td>
                      <td className="pr-14 py-10 text-right">
                         <span className="px-4 py-2 bg-slate-50 rounded-xl text-[11px] font-black text-slate-600 tabular-nums">
                           {prueba.fecha ? new Date(prueba.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : "---"}
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
                      <Calendar size={10} /> {prueba.fecha ? new Date(prueba.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : "S/D"}
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
            <p className="text-slate-300 font-black text-[11px] uppercase tracking-widest">Esperando registros oficiales</p>
          </div>
        )}
      </div>

      {/* FOOTER - Actualización Momentanea */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto z-20">
        <div className="bg-slate-900/95 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-between md:justify-center gap-6">
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
            Marcas sincronizadas: <span className="text-emerald-500">Active</span>
          </p>
          <div className="flex -space-x-2">
            {[1,2].map(i => <div key={i} className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-slate-900" />)}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MisTiempos;