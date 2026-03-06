import { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { 
  Trophy, Filter, Waves, Timer, 
  Search, Loader2, Award, Calendar, Star 
} from "lucide-react";

const MisTiempos = () => {
  const { user } = useAuth();
  
  // Estado de filtros
  const [filtros, setFiltros] = useState({
    estilo: "Libre",
    distancia: 50,
    piscina: 25,
    orden: "asc"
  });

  // 1. Obtenemos el perfil del nadador para asegurar que tenemos su ID interno
  const { data: perfil } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => {
      const res = await api.get("/nadadores/perfil");
      return res.data;
    }
  });

  // 2. Cargamos el ranking (Usamos el ID que viene del perfil)
  const { data: ranking, isLoading } = useQuery({
    queryKey: ["miRanking", perfil?._id, filtros],
    queryFn: async () => {
      // Reutilizamos el endpoint de ranking individual pasándole nuestro ID
      const res = await api.get(`/pruebas/ranking/${perfil._id}`, { params: filtros });
      return res.data;
    },
    enabled: !!perfil?._id,
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600">
            <Waves size={18} />
          </div>
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Historial Deportivo</p>
        </div>
        <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter">
          MIS <span className="text-blue-600">MARCAS</span>
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-medium">
          Consulta tus tiempos oficiales registrados por el equipo técnico.
        </p>
      </header>

      {/* FILTROS (Mismo estilo que el del profesor) */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estilo</label>
          <select name="estilo" value={filtros.estilo} onChange={handleFilterChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-black text-slate-700 text-sm">
            <option value="Libre">Libre</option>
            <option value="Espalda">Espalda</option>
            <option value="Pecho">Pecho</option>
            <option value="Mariposa">Mariposa</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Distancia</label>
          <select name="distancia" value={filtros.distancia} onChange={handleFilterChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-black text-slate-700 text-sm">
            {[25, 50, 100, 200, 400].map(d => <option key={d} value={d}>{d}m</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Piscina</label>
          <select name="piscina" value={filtros.piscina} onChange={handleFilterChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-black text-slate-700 text-sm">
            <option value={25}>25m (Corta)</option>
            <option value={50}>50m (Larga)</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Orden</label>
          <select name="orden" value={filtros.orden} onChange={handleFilterChange} className="w-full bg-blue-600 text-white border-none rounded-2xl px-5 py-4 font-black text-sm shadow-lg shadow-blue-200">
            <option value="asc">Mejor Marca</option>
            <option value="desc">Más Reciente</option>
          </select>
        </div>
      </div>

      {/* TABLA DE RESULTADOS (MODO LECTURA) */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        {isLoading ? (
          <div className="p-32 text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sincronizando Cronómetros...</p>
          </div>
        ) : ranking?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="pl-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pos</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tiempo</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento</th>
                  <th className="pr-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ranking.map((prueba, index) => (
                  <tr key={prueba._id} className={`group transition-all ${prueba.esRecordPersonal ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="pl-12 py-8">
                      {prueba.esRecordPersonal ? (
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                          <Award size={20} />
                        </div>
                      ) : (
                        <span className="text-2xl font-black text-slate-200 italic tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className={`text-3xl font-black italic tracking-tighter tabular-nums ${prueba.esRecordPersonal ? 'text-amber-600' : 'text-slate-900'}`}>
                        {prueba.tiempo}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <p className="font-black text-slate-800 text-lg italic tracking-tight uppercase">
                        {prueba.competencia?.nombre}
                      </p>
                    </td>
                    <td className="pr-12 py-8 text-right">
                        <div className="inline-flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 font-black text-[11px] tabular-nums group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Calendar size={14} className="text-blue-500" />
                            {new Date(prueba.fecha).toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            }).replace('.', '')}
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-32 text-center">
            <Trophy size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-black text-slate-300 uppercase italic">Sin registros</h3>
            <p className="text-slate-400 text-sm">Aún no hay tiempos cargados para esta prueba.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisTiempos;