import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { 
  Trophy, Plus, Trash2, Timer, ArrowLeft, Loader2, 
  ChevronRight, TrendingUp, Clock, Target, Layers, BarChart3
} from "lucide-react";
import { getPruebasPorCompetencia, deletePrueba } from "../../api/pruebas.api";

// Sub-componente para optimizar el renderizado del listado
const PruebaCard = ({ prueba, onDelete, isDeleting }) => {
  return (
    <div className="group bg-white rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col overflow-hidden">
      {/* Header Tarjeta */}
      <div className="p-8 md:p-10 pb-4 flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest">Marca Técnica</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter italic uppercase">
            {prueba.distancia}m <span className="text-slate-300 group-hover:text-blue-600 transition-colors">{prueba.estilo}</span>
          </h3>
        </div>

        <button
          onClick={() => onDelete(prueba._id)}
          disabled={isDeleting}
          className="p-4 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all disabled:opacity-30"
        >
          {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
      </div>

      {/* Resultado Principal */}
      <div className="px-8 md:px-10 mb-6">
        <div className="bg-slate-900 rounded-[2rem] p-6 flex items-center justify-between border border-slate-800 shadow-xl group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Timer size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Official Time</p>
              <p className="text-3xl font-black tabular-nums text-white italic">{prueba.tiempo}</p>
            </div>
          </div>
          <Trophy size={24} className="text-slate-700 group-hover:text-amber-500 transition-colors" />
        </div>
      </div>

      {/* Análisis de Parciales (Splits) */}
      <div className="px-8 md:px-10 pb-8 space-y-4 flex-1">
        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={12} /> Splits
          </span>
          <span className="text-[10px] font-bold text-slate-300">Vueltas: {prueba.parciales?.length || 0}</span>
        </div>
        
        <div className="space-y-3">
          {prueba.parciales?.length > 0 ? (
            prueba.parciales.map((par, idx) => (
              <div key={idx} className="space-y-1 group/lap">
                <div className="flex justify-between text-[10px] font-bold italic text-slate-500 uppercase">
                  <span>Tramo {par.nroParcial}</span>
                  <span className="text-slate-800 group-hover/lap:text-blue-600">{par.tiempo}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(20, 100 - (idx * 15))}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-[9px] text-slate-300 font-bold uppercase text-center py-4 italic">Sin datos de telemetría</p>
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
    staleTime: 1000 * 60 * 3, // 3 minutos de caché
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 size={40} className="animate-spin text-blue-600" />
      <p className="font-black text-[9px] uppercase tracking-[0.4em] text-slate-400">Analizando Vault...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Dashboard Header */}
      <header className="bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-6 w-full lg:w-auto">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
                MARCAS <span className="text-blue-500">TÉCNICAS</span>
              </h1>
              <p className="text-slate-400 text-xs md:text-sm font-medium max-w-md mt-4 leading-relaxed">
                Análisis biomecánico y control de tiempos oficiales para la competencia actual.
              </p>
            </div>

            {stats && (
              <div className="flex gap-6 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10">
                    <Layers size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-500">Eventos</p>
                    <p className="text-xl font-black">{stats.total}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/10">
                    <Target size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-500">Metros</p>
                    <p className="text-xl font-black">{stats.distanciaTotal}m</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Link
            to={`/profesor/competencia/${id}/pruebas/nuevo`}
            className="w-full lg:w-auto bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 text-center active:scale-95"
          >
            + Nueva Marca
          </Link>
        </div>
      </header>

      {/* Listado Principal */}
      <section>
        {pruebas.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
            <BarChart3 size={48} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">No hay registros cargados</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
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
      <footer className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
          Sistema de Cronometraje • {new Date().getFullYear()}
        </p>
        <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">
            Sincronización en tiempo real activa
          </span>
        </div>
      </footer>
    </div>
  );
};

export default PruebasList;