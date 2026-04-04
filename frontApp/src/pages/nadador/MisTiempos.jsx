import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { 
  Trophy, Waves, Loader2, Award, Calendar, 
  TrendingDown, LineChart as ChartIcon, ArrowUpRight, ChevronDown
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

  const { data: ranking, isLoading } = useQuery({
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32">
      
      {/* HEADER DINÁMICO */}
      <header className="relative pt-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-blue-600 text-white text-[11px] font-black px-2 py-0.5 rounded uppercase tracking-tighter italic">ÑSF</span>
          <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em]">Registro de marcas</p>
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
          Mis <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Marcas</span>
        </h1>
      </header>

      {/* PANEL DE CONTROL (FILTROS) */}
      <section className="bg-white rounded-[2.5rem] p-4 md:p-6 shadow-2xl shadow-blue-900/5 border border-slate-100 flex flex-wrap lg:flex-nowrap gap-4 items-end">
        {[
          { label: "Estilo", name: "estilo", options: ["Libre", "Espalda", "Pecho", "Mariposa"] },
          { label: "Distancia", name: "distancia", options: [25, 50, 100, 200, 400] },
          { label: "Piscina", name: "piscina", options: [{v:25, t:"25m"}, {v:50, t:"50m"}] }
        ].map((f) => (
          <div key={f.name} className="flex-1 min-w-[140px] space-y-2">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">{f.label}</p>
            <div className="relative group">
              <select 
                name={f.name} 
                value={filtros[f.name]} 
                onChange={handleFilterChange} 
                className="w-full appearance-none bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl px-6 py-4 font-black text-slate-700 text-xs transition-all cursor-pointer"
              >
                {f.options.map(opt => (
                  <option key={opt.v || opt} value={opt.v || opt}>{opt.t || opt + (f.name === 'distancia' ? 'm' : '')}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 pointer-events-none transition-colors" size={16} />
            </div>
          </div>
        ))}
        
        <div className="flex-1 min-w-[140px] space-y-2">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Ordenar por</p>
          <select name="orden" value={filtros.orden} onChange={handleFilterChange} className="w-full bg-blue-600 text-white border-none rounded-2xl px-6 py-4 font-black text-xs shadow-lg shadow-blue-200 cursor-pointer">
            <option value="asc">Mejor Marca (PB)</option>
            <option value="desc">Más Reciente</option>
          </select>
        </div>
      </section>

      {/* DASHBOARD DE ANALÍTICA (GRÁFICA) */}
      {ranking?.length > 1 && (
        <section className="bg-[#0f172a] rounded-[3.5rem] p-8 md:p-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          
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

      {/* TABLA DE RESULTADOS TÉCNICOS */}
      <section className="bg-white rounded-[3.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        {isLoading ? (
          <div className="p-32 text-center space-y-4">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
            <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest">Compilando marcas...</p>
          </div>
        ) : ranking?.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Desktop View */}
            <table className="w-full text-left hidden md:table border-collapse">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="pl-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Rank</th>
                  <th className="px-8 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Tiempo Oficial</th>
                  <th className="px-8 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Competencia / Sede</th>
                  <th className="pr-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Data Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ranking.map((prueba, index) => (
                  <tr key={prueba._id} className="group hover:bg-blue-50/30 transition-all duration-300">
                    <td className="pl-12 py-8">
                      {prueba.esRecordPersonal ? (
                        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-200 rotate-6 group-hover:rotate-0 transition-transform">
                          <Award size={24} />
                        </div>
                      ) : (
                        <span className="text-3xl font-black text-slate-200 italic tabular-nums group-hover:text-blue-200 transition-colors">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className={`text-4xl font-black italic tracking-tighter tabular-nums ${prueba.esRecordPersonal ? 'text-amber-600' : 'text-slate-900'}`}>
                        {prueba.tiempo}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <p className="font-black text-slate-800 text-xl italic uppercase tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{prueba.competencia?.nombre}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Sede Oficial FINA</p>
                    </td>
                    <td className="pr-12 py-8 text-right">
                      <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-slate-100 rounded-xl text-slate-900 font-black text-[11px] tabular-nums group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Calendar size={14} />
                        {new Date(prueba.fecha).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100">
              {ranking.map((prueba, index) => (
                <div key={prueba._id} className="p-8 space-y-6 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{new Date(prueba.fecha).toLocaleDateString()}</span>
                      <h4 className="font-black text-slate-900 italic uppercase leading-tight text-xl mt-1 group-hover:text-blue-600 transition-colors">
                        {prueba.competencia?.nombre}
                      </h4>
                    </div>
                    {prueba.esRecordPersonal && <Award className="text-amber-500 drop-shadow-lg" size={32} />}
                  </div>
                  <div className="flex justify-between items-end bg-slate-50 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-2 text-slate-400 font-black text-[11px] uppercase">
                      <ArrowUpRight size={16} className="text-blue-500" /> Rank #{index + 1}
                    </div>
                    <span className={`text-5xl font-black italic tracking-tighter ${prueba.esRecordPersonal ? 'text-amber-600' : 'text-slate-900'}`}>
                      {prueba.tiempo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-32 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
              <Trophy size={40} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.3em]">Esperando registros oficiales</p>
          </div>
        )}
      </section>
    </div>
  );
};

// Reutilizamos el LoadingState del sistema
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
    <div className="relative">
      <div className="w-20 h-20 border-[6px] border-blue-50 border-t-blue-600 rounded-full animate-spin" />
      <ChartIcon className="absolute inset-0 m-auto text-blue-600" size={30} />
    </div>
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Sincronizando Marcas FINA</p>
  </div>
);

export default MisTiempos;