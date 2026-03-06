import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPruebasPorCompetencia, deletePrueba } from "../../api/pruebas.api"; 
import { useState, useMemo } from "react";
import { 
  Trophy, Plus, Trash2, Timer, Activity, 
  ArrowLeft, Loader2, ChevronRight, TrendingUp,
  Clock, Target, Layers, BarChart3
} from "lucide-react";

const PruebasList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pruebas", id],
    queryFn: async () => {
      const res = await getPruebasPorCompetencia(id);
      return res.data;
    },
    enabled: !!id,
  });

  const pruebas = data?.pruebas || [];

  // 1. ESTADÍSTICAS RÁPIDAS (Memoized)
  const stats = useMemo(() => {
    if (!pruebas.length) return null;
    return {
      total: pruebas.length,
      mejorEstilo: [...pruebas].sort((a, b) => a.distancia - b.distancia)[0]?.estilo,
      distanciaTotal: pruebas.reduce((acc, curr) => acc + curr.distancia, 0)
    };
  }, [pruebas]);

  // 2. MUTACIÓN DE ELIMINACIÓN
  const deleteMutation = useMutation({
    mutationFn: (pruebaId) => deletePrueba(pruebaId),
    onSuccess: () => {
      queryClient.invalidateQueries(["pruebas", id]);
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
      alert("Error al eliminar el registro.");
    }
  });

  const handleDelete = (pruebaId) => {
    if (window.confirm("¿Confirmas la eliminación de este registro técnico? Esta acción es irreversible.")) {
      setDeletingId(pruebaId);
      deleteMutation.mutate(pruebaId);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-48 gap-6">
      <div className="relative">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse" />
      </div>
      <p className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-400">Sincronizando Marcas...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 p-4">
      
      {/* HEADER DE RENDIMIENTO DINÁMICO */}
      <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-16 text-white shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
              >
                <ArrowLeft size={18} className="text-blue-400" />
              </button>
              <div className="flex flex-col">
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Official Performance Hub</span>
                <span className="text-slate-500 text-[9px] font-bold">Ref: {id.substring(0,12)}</span>
              </div>
            </div>

            <div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase leading-tight">
                Análisis de <span className="text-blue-500">Pruebas</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium max-w-xl leading-relaxed mt-4">
                Visualización técnica de marcas oficiales. Los datos de parciales reflejan la eficiencia de nado y la gestión de energía por tramo.
              </p>
            </div>

            {/* QUICK STATS */}
            {stats && (
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                    <Layers size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500">Pruebas</p>
                    <p className="text-xl font-black italic">{stats.total}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Target size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500">Total Metros</p>
                    <p className="text-xl font-black italic">{stats.distanciaTotal}m</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Link
            to={`/profesor/competencia/${id}/pruebas/nuevo`}
            className="group relative flex items-center justify-center gap-4 bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl shadow-blue-500/20 active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            Nueva Marca
          </Link>
        </div>
      </div>

      {/* LISTADO DE RESULTADOS (GRID) */}
      {pruebas.length === 0 ? (
        <div className="bg-white rounded-[4rem] p-32 text-center border border-slate-100 shadow-inner group">
          <div className="bg-slate-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-200 transition-all duration-500">
            <BarChart3 size={48} />
          </div>
          <h3 className="text-slate-800 text-xl font-black uppercase tracking-tight mb-3 italic">Vault Vacío</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">No hay registros cargados para esta competencia. Inicia el cronometraje técnico.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-8">
          {pruebas.map((p) => (
            <div
              key={p._id}
              className="group bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-3xl hover:shadow-blue-900/10 transition-all duration-500 overflow-hidden flex flex-col"
            >
              {/* HEADER DE TARJETA */}
              <div className="p-10 pb-6 flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Competición Oficial</span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">
                    {p.distancia}m <span className="text-slate-300 group-hover:text-blue-600 transition-colors duration-500">{p.estilo}</span>
                  </h3>
                </div>

                <button
                  onClick={() => handleDelete(p._id)}
                  disabled={deletingId === p._id}
                  className="p-4 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all disabled:opacity-30 group-hover:bg-white group-hover:border group-hover:border-red-100"
                >
                  {deletingId === p._id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                </button>
              </div>

              {/* DASHBOARD DE TIEMPO (DESTACADO) */}
              <div className="px-10 mb-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 flex items-center justify-between border border-slate-800 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                      <Timer size={28} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Final Result</p>
                      <p className="text-4xl font-black tracking-tighter tabular-nums text-white italic">{p.tiempo}</p>
                    </div>
                  </div>
                  <Trophy size={32} className="text-slate-800 group-hover:text-amber-500 transition-colors duration-700" />
                </div>
              </div>

              {/* VISUALIZADOR DE SPLITS (PARCIALES) */}
              <div className="px-10 pb-10 space-y-6 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Análisis de Vueltas</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 tabular-nums uppercase">Laps: {p.parciales?.length || 0}</span>
                </div>
                
                {p.parciales && p.parciales.length > 0 ? (
                  <div className="space-y-3">
                    {p.parciales.map((par, idx) => (
                      <div key={idx} className="space-y-1.5 group/lap">
                        <div className="flex justify-between items-end px-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Tramo {par.nroParcial} ({par.nroParcial * 50}m)</span>
                          <span className="text-xs font-black text-slate-700 italic">{par.tiempo}</span>
                        </div>
                        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-[1px]">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 delay-300 group-hover:from-blue-600 group-hover:to-blue-400"
                            style={{ width: `${Math.max(30, 100 - (idx * 10))}%` }} // Simulación de fatiga visual
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 border-2 border-dashed border-slate-50 rounded-[2rem] text-center flex flex-col items-center gap-2">
                    <Clock size={20} className="text-slate-200" />
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic">Sin telemetría de parciales</p>
                  </div>
                )}
              </div>
              
              {/* BOTÓN VER DETALLE (Opcional) */}
              <div className="p-4 border-t border-slate-50">
                <button className="w-full py-3 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">
                  Ver Informe Detallado <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER DE NAVEGACIÓN TÉCNICA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-slate-100">
        <Link
          to={`/profesor/nadador/${data?.nadadorId}/competencias`}
          className="group flex items-center gap-4 text-slate-400 hover:text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
            <ArrowLeft size={18} />
          </div>
          Volver al Historial
        </Link>
        
        <div className="flex items-center gap-6 bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">DB Sync Active</p>
           </div>
           <div className="h-4 w-[1px] bg-slate-200" />
           <p className="text-[9px] text-slate-300 font-bold italic tracking-tight">
             ÑSF Analytics v2.4 • 2026
           </p>
        </div>
      </div>
    </div>
  );
};

export default PruebasList;