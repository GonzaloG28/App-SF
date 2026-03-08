import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { 
  Trophy, Waves, Loader2, Award, Calendar, 
  TrendingDown, LineChart as ChartIcon, ArrowUpRight
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// Función para convertir "MM:SS.CC" a segundos totales para la gráfica
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
  const { user } = useAuth();
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

  // Procesar datos para la gráfica (Ordenados por fecha cronológicamente)
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* HEADER */}
      <header className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Waves size={18} />
          </div>
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Performance Tracker</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
          Mis <span className="text-blue-600">Marcas</span>
        </h1>
      </header>

      {/* FILTROS RESPONSIVOS */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Estilo", name: "estilo", options: ["Libre", "Espalda", "Pecho", "Mariposa"] },
          { label: "Distancia", name: "distancia", options: [25, 50, 100, 200, 400] },
          { label: "Piscina", name: "piscina", options: [{v:25, t:"25m"}, {v:50, t:"50m"}] }
        ].map((f) => (
          <div key={f.name} className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
            <select 
              name={f.name} 
              value={filtros[f.name]} 
              onChange={handleFilterChange} 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-black text-slate-700 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              {f.options.map(opt => (
                <option key={opt.v || opt} value={opt.v || opt}>{opt.t || opt + (f.name === 'distancia' ? 'm' : '')}</option>
              ))}
            </select>
          </div>
        ))}
        <div className="space-y-2 text-white">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vista</label>
          <select name="orden" value={filtros.orden} onChange={handleFilterChange} className="w-full bg-blue-600 border-none rounded-2xl px-5 py-4 font-black text-sm shadow-lg shadow-blue-200">
            <option value="asc">Mejor Marca</option>
            <option value="desc">Más Reciente</option>
          </select>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICA */}
      {ranking?.length > 1 && (
        <div className="bg-[#0f172a] rounded-[3rem] p-6 md:p-10 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <ChartIcon size={120} className="text-white" />
          </div>
          <div className="relative z-10 mb-8">
            <h3 className="text-white font-black italic text-2xl uppercase tracking-tighter flex items-center gap-3">
              <TrendingDown className="text-emerald-400" /> Progresión de Tiempo
            </h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
              {filtros.distancia}m {filtros.estilo} - Piscina {filtros.piscina}m
            </p>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosGrafica}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="fecha" 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value, name, props) => [props.payload.tiempoOriginal, "Tiempo"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="segundos" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorTime)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* LISTADO / TABLA RESPONSIVA */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        {isLoading ? (
          <div className="p-24 text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Analizando registros...</p>
          </div>
        ) : ranking?.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full text-left hidden md:table">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="pl-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tiempo</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Competencia</th>
                  <th className="pr-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ranking.map((prueba, index) => (
                  <tr key={prueba._id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="pl-12 py-8">
                      {prueba.esRecordPersonal ? (
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200 rotate-3">
                          <Award size={20} />
                        </div>
                      ) : (
                        <span className="text-2xl font-black text-slate-200 italic tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                      )}
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className={`text-3xl font-black italic tracking-tighter tabular-nums ${prueba.esRecordPersonal ? 'text-amber-600' : 'text-slate-900'}`}>
                        {prueba.tiempo}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <p className="font-black text-slate-800 text-lg italic uppercase tracking-tight">{prueba.competencia?.nombre}</p>
                    </td>
                    <td className="pr-12 py-8 text-right">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-600 font-black text-[10px] tabular-nums">
                        <Calendar size={12} className="text-blue-500" />
                        {new Date(prueba.fecha).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {ranking.map((prueba, index) => (
                <div key={prueba._id} className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {new Date(prueba.fecha).toLocaleDateString()}
                      </p>
                      <h4 className="font-black text-slate-900 italic uppercase leading-tight text-lg">
                        {prueba.competencia?.nombre}
                      </h4>
                    </div>
                    {prueba.esRecordPersonal && <Award className="text-amber-500" size={24} />}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase">
                      <ArrowUpRight size={14} /> Posición #{index + 1}
                    </div>
                    <span className={`text-4xl font-black italic tracking-tighter ${prueba.esRecordPersonal ? 'text-amber-600' : 'text-slate-900'}`}>
                      {prueba.tiempo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-24 text-center">
            <Trophy size={48} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Sin registros oficiales</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisTiempos;