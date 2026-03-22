import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { 
  Trophy, Plus, Trash2, Timer, ArrowLeft, Loader2, 
  ChevronRight, TrendingUp, Target, Layers, BarChart3, Activity
} from "lucide-react";
import { getPruebasPorCompetencia, deletePrueba } from "../../api/pruebas.api";

// --- SUB-COMPONENTE DE TARJETA TÉCNICA ---
const PruebaCard = ({ prueba, onDelete, isDeleting }) => {
  return (
    <div className="group bg-white rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col overflow-hidden">
      
      {/* Header Tarjeta: Blanco y Azul */}
      <div className="p-8 md:p-10 pb-4 flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600">
            <Activity size={14} className="animate-pulse text-emerald-500" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Telemetría de Carrera</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">
            {prueba.distancia}m <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">{prueba.estilo}</span>
          </h3>
        </div>

        <button
          onClick={() => onDelete(prueba._id)}
          disabled={isDeleting}
          className="p-4 bg-slate-50 text-slate-300 hover:bg-orange-500 hover:text-white rounded-2xl transition-all duration-300 disabled:opacity-30"
        >
          {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
      </div>

      {/* Resultado Principal: Azul y Naranja */}
      <div className="px-8 md:px-10 mb-6">
        <div className="bg-slate-900 rounded-[2.2rem] p-6 flex items-center justify-between border border-slate-800 shadow-xl group-hover:scale-[1.02] transition-transform duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Timer size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Tiempo Oficial</p>
              <p className="text-3xl font-black tabular-nums text-white italic">{prueba.tiempo}</p>
            </div>
          </div>
          <Trophy size={24} className="text-slate-700 group-hover:text-orange-500 transition-colors duration-500" />
        </div>
      </div>

      {/* Análisis de Splits: Verde y Azul */}
      <div className="px-8 md:px-10 pb-8 space-y-4 flex-1">
        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={12} className="text-emerald-500" /> Parciales
          </span>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Laps: {prueba.parciales?.length || 0}</span>
        </div>
        
        <div className="space-y-3">
          {prueba.parciales?.length > 0 ? (
            prueba.parciales.map((par, idx) => (
              <div key={idx} className="space-y-1 group/lap">
                <div className="flex justify-between text-[11px] font-black italic text-slate-500 uppercase">
                  <span>Tramo {par.nroParcial}</span>
                  <span className="text-slate-800 group-hover/lap:text-emerald-600 transition-colors">{par.tiempo}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    style={{ width: `${Math.max(15, 100 - (idx * 12))}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-300 font-black uppercase text-center py-6 italic tracking-widest border-2 border-dashed border-slate-50 rounded-2xl">
              Sin datos de telemetría
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const PruebasList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["pruebas", id],
    queryFn: () => getPruebasPorCompetencia(id).then(res => res.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
  });

  const pruebas = data?.pruebas || [];

  const stats = useMemo(() => {
    if (!pruebas.length) return null;
    return {
      total: pruebas.length,
      distanciaTotal: pruebas.reduce((acc, curr) => acc + curr.distancia, 0),
    };
  }, [pruebas]);

  const deleteMutation = useMutation({
    mutationFn: deletePrueba,
    onSuccess: () => {
      queryClient.invalidateQueries(["pruebas", id]);
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
      alert("Error al eliminar.");
    }
  });

  const handleDelete = useCallback((pruebaId) => {
    if (window.confirm("¿Confirmas la eliminación definitiva?")) {
      setDeletingId(pruebaId);
      deleteMutation.mutate(pruebaId);
    }
  }, [deleteMutation]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative">
        <Loader2 size={50} className="animate-spin text-blue-600" />
        <Activity size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" />
      </div>
      <p className="font-black text-[11px] uppercase tracking-[0.5em] text-slate-400 animate-pulse text-center">Desencriptando Vault Técnico</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      
      {/* Header Principal con el gradiente solicitado */}
      <header className="bg-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 border border-slate-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none opacity-50" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-8 w-full lg:w-auto">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all"
            >
              <div className="p-2 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors">
                <ArrowLeft size={16} /> 
              </div>
              Regresar
            </button>
            
            <div>
              <h1 className="text-5xl md:text-7xl lg:text-7xl font-black tracking-tighter italic uppercase leading-[0.85]">
                MARCAS <br />
                <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  TÉCNICAS
                </span>
              </h1>
              <p className="text-slate-400 text-xs md:text-sm font-bold max-w-md mt-6 leading-relaxed uppercase tracking-widest opacity-70">
                Módulo de análisis biomecánico y control de cronometraje oficial.
              </p>
            </div>

            {stats && (
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="bg-slate-900 text-white px-6 py-4 rounded-[1.8rem] flex items-center gap-4 shadow-lg">
                   <Layers size={20} className="text-blue-500" />
                   <div>
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Pruebas</p>
                     <p className="text-2xl font-black italic leading-none">{stats.total}</p>
                   </div>
                </div>
                <div className="bg-white border border-slate-100 px-6 py-4 rounded-[1.8rem] flex items-center gap-4 shadow-sm">
                   <Target size={20} className="text-emerald-500" />
                   <div>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Volumen</p>
                     <p className="text-2xl font-black italic leading-none text-slate-900">{stats.distanciaTotal}m</p>
                   </div>
                </div>
              </div>
            )}
          </div>
          
          <Link
            to={`/profesor/competencia/${id}/pruebas/nuevo`}
            className="w-full lg:w-auto bg-blue-600 hover:bg-emerald-500 text-white px-10 py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl shadow-blue-200 text-center active:scale-95 flex items-center justify-center gap-3"
          >
            <Plus size={20} strokeWidth={3} /> Registrar Marca
          </Link>
        </div>
      </header>

      {/* Listado de Pruebas */}
      <section>
        {pruebas.length === 0 ? (
          <div className="bg-white rounded-[3.5rem] p-24 text-center border-4 border-dashed border-slate-50 flex flex-col items-center group">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
               <BarChart3 size={48} className="text-slate-200" />
            </div>
            <p className="text-slate-300 text-[11px] font-black uppercase tracking-[0.4em] italic">Vault de datos vacío</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {pruebas.map((p) => (
              <PruebaCard 
                key={p._id} 
                prueba={p} 
                onDelete={handleDelete}
                isDeleting={deletingId === p._id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer Técnico */}
      <footer className="pt-16 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[2px] bg-gradient-to-r from-blue-600 to-emerald-500" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Data Engine v2.0 • {new Date().getFullYear()}
          </p>
        </div>
        
        <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest italic">
            Nodo Central Sincronizado
          </span>
        </div>
      </footer>
    </div>
  );
};

export default PruebasList;