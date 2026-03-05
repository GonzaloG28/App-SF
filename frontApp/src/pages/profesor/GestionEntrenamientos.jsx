import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle2, 
  ChevronRight, 
  X, 
  UserCircle2, 
  Trophy,
  Clock,
  Trash2 
} from "lucide-react";

// Importamos los servicios
import { getReporteProfesor, eliminarEntrenamiento } from "../../api/entrenamientos.api";

const GestionEntrenamientos = () => {
  const [modalData, setModalData] = useState(null);
  const queryClient = useQueryClient();

  // 1. Query para obtener los datos
  const { data, isLoading } = useQuery({
    queryKey: ["reporteEntrenamientos"],
    queryFn: async () => {
      const res = await getReporteProfesor();
      return res.data;
    }
  });

  // 2. Mutation para eliminar (Optimización de React Query)
  const mutationEliminar = useMutation({
    mutationFn: eliminarEntrenamiento,
    onSuccess: () => {
      // Refresca la lista automáticamente al eliminar
      queryClient.invalidateQueries(["reporteEntrenamientos"]);
      alert("Rutina eliminada con éxito");
    },
    onError: (error) => {
      console.error(error);
      alert("Hubo un error al intentar eliminar");
    }
  });

  const handleEliminar = (id) => {
    if (window.confirm("¿Seguro que quieres borrar esta rutina?")) {
      mutationEliminar.mutate(id);
    }
  };

  if (isLoading) return (
    <div className="p-20 text-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="font-black uppercase text-slate-400 tracking-widest text-xs">Generando Reporte...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Panel de Control</p>
          <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter">
            ESTADÍSTICAS <span className="text-blue-600">DE RUTINAS</span>
          </h1>
        </div>
        <div className="bg-slate-900 text-white p-6 rounded-[2rem] hidden md:block shadow-xl shadow-slate-200">
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Total Entrenamientos</p>
          <p className="text-3xl font-black italic">{data?.length || 0}</p>
        </div>
      </header>

      <div className="grid gap-4">
        {data?.map((ent) => {
          const porcentaje = Math.round((ent.completados / ent.totalAlumnos) * 100) || 0;

          return (
            <div key={ent._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 hover:shadow-xl transition-all group">
              <div className="flex flex-col md:flex-row items-center gap-8">
                
                {/* Info Básica */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase">
                      {new Date(ent.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </p>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">•</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={10} />
                      <p className="text-[10px] font-bold uppercase">
                        {new Date(ent.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-slate-800 uppercase italic leading-none truncate">
                    {ent.titulo}
                  </h4>
                </div>

                {/* Barra de Progreso */}
                <div className="flex-[2] w-full space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Progreso del Grupo</span>
                    <span className={porcentaje === 100 ? "text-green-500" : "text-slate-600"}>{porcentaje}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out rounded-full ${porcentaje === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>

                {/* Stats Rápidas */}
                <div className="flex gap-4 border-l border-slate-100 pl-8 hidden lg:flex">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Hecho</p>
                    <p className="text-lg font-black text-slate-800">{ent.completados}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Pendiente</p>
                    <p className="text-lg font-black text-slate-300">{ent.totalAlumnos - ent.completados}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEliminar(ent._id)}
                    disabled={mutationEliminar.isPending}
                    className="p-4 rounded-2xl bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                  >
                    <Trash2 size={20} />
                  </button>
                  
                  <button 
                    onClick={() => setModalData(ent)}
                    className="bg-slate-50 p-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL --- */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setModalData(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={14} className="text-blue-600" />
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Cumplimiento Detallado</p>
                </div>
                <h3 className="text-xl font-black text-slate-800 italic uppercase leading-none">{modalData.titulo}</h3>
              </div>
              <button onClick={() => setModalData(null)} className="p-3 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {modalData.detallesCompletados?.length > 0 ? (
                  modalData.detallesCompletados.map((atleta, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm relative">
                        {atleta.nombre.charAt(0)}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-black text-xs text-slate-700 uppercase tracking-tight">{atleta.nombre}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-green-600">
                          <Clock size={10} />
                          <p className="text-[9px] font-bold uppercase">
                            {atleta.hora ? new Date(atleta.hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 size={16} className="ml-auto text-green-500 opacity-30" />
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <UserCircle2 size={40} className="mx-auto text-slate-100" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Sin registros todavía</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setModalData(null)}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-lg"
              >
                Cerrar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEntrenamientos;