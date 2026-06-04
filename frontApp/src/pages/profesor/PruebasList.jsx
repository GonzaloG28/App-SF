import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { 
  Trophy, Plus, Trash2, Timer, ArrowLeft, Loader2, 
  TrendingUp, Target, Layers, BarChart3, Activity, Calendar // <-- Añadido Calendar
} from "lucide-react";
import { getPruebasPorCompetencia, deletePrueba } from "../../api/pruebas.api";

const PruebaCard = ({ prueba, fechaCompetencia, onDelete, isDeleting }) => {
  // Priorizamos la fecha de la competencia. Evitamos usar prueba.createdAt
  const fechaCruda = fechaCompetencia || prueba?.competencia?.fecha || prueba?.fecha;
  
  const fechaFormateada = fechaCruda 
    ? new Date(fechaCruda).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        timeZone: 'UTC' // Previene que la fecha de la DB se reste 1 día por la zona horaria
      }).replace('.', '') 
    : '';

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col overflow-hidden h-full">
      
      {/* Header Tarjeta */}
      <div className="p-5 lg:p-8 pb-4 flex justify-between items-start gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-blue-600 mb-1">
            <Activity size={14} className="animate-pulse text-emerald-500 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resultado</span>
            
            {/* --- SECCIÓN DE LA FECHA AÑADIDA AQUÍ --- */}
            {fechaFormateada && (
              <>
                <span className="text-slate-300 text-[10px]">•</span>
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {fechaFormateada}
                  </span>
                </div>
              </>
            )}

          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter italic uppercase leading-none break-words">
            {prueba.distancia}m <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">{prueba.estilo}</span>
          </h3>
        </div>

        <button
          onClick={() => onDelete(prueba._id)}
          disabled={isDeleting}
          className="p-3 bg-slate-50 text-slate-300 hover:bg-orange-500 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-30 shrink-0"
        >
          {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>

      {/* Resultado Principal */}
      <div className="px-5 lg:px-8 mb-6">
        <div className="bg-slate-900 rounded-2xl p-4 lg:p-6 flex items-center justify-between border border-slate-800 shadow-xl group-hover:scale-[1.02] transition-transform duration-500 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
              <Timer size={20} className="text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-slate-500">Tiempo Oficial</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black tabular-nums text-white italic leading-none">{prueba.tiempo}</p>
            </div>
          </div>
          <Trophy size={20} className="text-slate-700 group-hover:text-orange-500 transition-colors duration-500 shrink-0" />
        </div>
      </div>

      {/* Análisis de Splits */}
      <div className="px-5 lg:px-8 pb-8 space-y-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={12} className="text-emerald-500 shrink-0" /> Parciales
          </span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">Laps: {prueba.parciales?.length || 0}</span>
        </div>
        
        <div className="space-y-3 flex-1 overflow-y-auto max-h-60 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {prueba.parciales?.length > 0 ? (
            prueba.parciales.map((par, idx) => (
              <div key={idx} className="space-y-1 group/lap">
                <div className="flex justify-between text-[10px] font-black italic text-slate-500 uppercase gap-2">
                  <span className="truncate">Tramo {par.nroParcial}</span>
                  <span className="text-slate-800 group-hover/lap:text-emerald-600 transition-colors shrink-0">{par.tiempo}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(15, 100 - (idx * 12))}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-slate-300 font-black uppercase text-center py-6 italic tracking-widest border-2 border-dashed border-slate-50 rounded-2xl h-full flex items-center justify-center">
              Sin telemetría
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
  
  // Extraemos la fecha de la competencia desde la respuesta de la API.
  // Ajusta "data?.competencia?.fecha" según cómo venga estructurado tu backend en Node.
  const fechaCompetenciaGlobal = data?.competencia?.fecha || data?.fecha;

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <Loader2 size={50} className="animate-spin text-blue-600" />
      <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Desencriptando Vault Técnico</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10 p-4 sm:p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      
      {/* Header Principal */}
      <header className="bg-white rounded-[2.5rem] lg:rounded-[4rem] p-6 lg:p-16 border border-slate-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 lg:w-96 h-64 lg:h-96 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none opacity-50" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
          <div className="space-y-6 w-full xl:w-auto">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all"
            >
              <ArrowLeft size={14} className="p-1 bg-slate-50 rounded-full group-hover:bg-blue-50" /> Regresar
            </button>
            
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter italic uppercase leading-[0.9]">
                MARCAS <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">TÉCNICAS</span>
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-xs font-bold max-w-sm mt-4 leading-relaxed uppercase tracking-widest opacity-70">
                Registro de marcas realizadas en la competencia.
              </p>
            </div>

            {stats && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-lg min-w-[140px]">
                   <Layers size={18} className="text-blue-500" />
                   <div>
                     <p className="text-[9px] font-black text-slate-500 uppercase">Pruebas</p>
                     <p className="text-xl font-black italic">{stats.total}</p>
                   </div>
                </div>
                <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm min-w-[140px]">
                   <Target size={18} className="text-emerald-500" />
                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase">Volumen</p>
                     <p className="text-xl font-black italic text-slate-900">{stats.distanciaTotal}m</p>
                   </div>
                </div>
              </div>
            )}
          </div>
          
          <Link
            to={`/profesor/competencia/${id}/pruebas/nuevo`}
            className="w-full xl:w-auto bg-blue-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-500 shadow-xl shadow-blue-200 text-center flex items-center justify-center gap-3 shrink-0"
          >
            <Plus size={18} strokeWidth={3} /> Registrar Marca
          </Link>
        </div>
      </header>

      {/* Listado de Pruebas */}
      <section>
        {pruebas.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border-4 border-dashed border-slate-50 flex flex-col items-center">
            <BarChart3 size={40} className="text-slate-200 mb-4" />
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">Vault vacío</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 min-[1150px]:grid-cols-3 gap-6 lg:gap-8">
            {pruebas.map((p) => (
              <PruebaCard 
                key={p._id} 
                prueba={p} 
                fechaCompetencia={fechaCompetenciaGlobal} // <-- Pasamos la fecha global aquí
                onDelete={handleDelete}
                isDeleting={deletingId === p._id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="pt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          App ÑSF • {new Date().getFullYear()}
        </p>
        <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest italic">Live Feed</span>
        </div>
      </footer>
    </div>
  );
};

export default PruebasList;