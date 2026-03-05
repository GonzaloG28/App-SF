import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPruebasPorCompetencia, deletePrueba } from "../../api/pruebas.api"; 
import { useState } from "react";
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Timer, 
  Activity, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  TrendingUp
} from "lucide-react";

const PruebasList = () => {
  const { id } = useParams();
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

  const deleteMutation = useMutation({
    mutationFn: (pruebaId) => deletePrueba(pruebaId),
    onSuccess: () => {
      queryClient.invalidateQueries(["pruebas", id]);
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
      alert("No se pudo eliminar la prueba");
    }
  });

  const handleDelete = (pruebaId) => {
    if (window.confirm("¿Confirmas la eliminación de este registro técnico?")) {
      setDeletingId(pruebaId);
      deleteMutation.mutate(pruebaId);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 text-slate-400">
      <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
      <p className="font-black text-[10px] uppercase tracking-[0.3em]">Analizando Tiempos...</p>
    </div>
  );

  const pruebas = data?.pruebas || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER DE RENDIMIENTO */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Data Hub</span>
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest italic">ID Competencia: {id.substring(0,8)}</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter italic mb-2">Resultados de <span className="text-blue-400">Pruebas</span></h1>
            <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
              Cronometraje oficial y desglose de parciales. Los datos aquí registrados afectan el ranking histórico del atleta.
            </p>
          </div>
          
          <Link
            to={`/profesor/competencia/${id}/pruebas/nuevo`}
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/20 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Nueva Marca
          </Link>
        </div>
      </div>

      {/* LISTADO DE RESULTADOS */}
      {pruebas.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
          <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Timer size={40} />
          </div>
          <h3 className="text-slate-800 font-black uppercase tracking-tight mb-2">Sin registros técnicos</h3>
          <p className="text-slate-400 text-sm">Comienza agregando la primera prueba de esta competencia.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {pruebas.map((p) => (
            <div
              key={p._id}
              className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden flex flex-col"
            >
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Trophy size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Resultado Oficial</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">
                    {p.distancia}m <span className="text-slate-400 group-hover:text-blue-600 transition-colors">{p.estilo}</span>
                  </h3>
                </div>

                <button
                  onClick={() => handleDelete(p._id)}
                  disabled={deletingId === p._id}
                  className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all disabled:opacity-30"
                >
                  {deletingId === p._id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                </button>
              </div>

              {/* DASHBOARD DE TIEMPO */}
              <div className="px-8 mb-8">
                <div className="bg-[#f8fafc] rounded-3xl p-6 flex items-center justify-between border border-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                      <Timer size={24} className="text-blue-600 group-hover:text-blue-100" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Tiempo Total</p>
                      <p className="text-4xl font-black tracking-tighter tabular-nums">{p.tiempo}</p>
                    </div>
                  </div>
                  <Activity size={32} className="opacity-10 group-hover:opacity-30" />
                </div>
              </div>

              {/* VISUALIZADOR DE PARCIALES */}
              <div className="px-8 pb-8 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-slate-300" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Desglose de Parciales</span>
                </div>
                
                {p.parciales && p.parciales.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {p.parciales.map((par, idx) => (
                      <div key={idx} className="flex items-center gap-4 group/item">
                        <span className="text-[10px] font-black text-slate-300 w-8">{par.nroParcial * 50}m</span>
                        <div className="flex-1 h-10 bg-slate-50 rounded-xl relative overflow-hidden flex items-center px-4">
                          <div 
                            className="absolute left-0 top-0 h-full bg-blue-50 group-hover:bg-blue-100 transition-all duration-700"
                            style={{ width: `${Math.random() * 40 + 60}%` }} // Simulación visual de barra
                          />
                          <div className="relative flex justify-between w-full">
                            <span className="text-[11px] font-bold text-slate-400">Lap {par.nroParcial}</span>
                            <span className="text-[11px] font-black text-blue-600 italic">{par.tiempo}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 border-2 border-dashed border-slate-50 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">Sin parciales registrados</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER NAVEGACIÓN */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-100">
        <Link
          to={`/profesor/nadador/${data?.nadadorId}/competencias`}
          className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
        >
          <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-blue-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Volver a Competencias
        </Link>
        <p className="text-[9px] text-slate-300 font-medium hidden md:block italic">
          Sistema de Cronometraje v2.0 • AppÑSF
        </p>
      </div>
    </div>
  );
};

export default PruebasList;