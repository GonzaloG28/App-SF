import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle2, 
  ChevronRight, 
  X, 
  UserCircle2, 
  Trophy,
  Clock,
  Trash2,
  Calendar as CalendarIcon,
  Users,
  AlertTriangle,
  Loader2,
  TrendingUp
} from "lucide-react";

import { getReporteProfesor, eliminarEntrenamiento } from "../../api/entrenamientos.api";

const GestionEntrenamientos = () => {
  const [modalData, setModalData] = useState(null);
  const queryClient = useQueryClient();

  // 1. QUERY OPTIMIZADA
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reporteEntrenamientos"],
    queryFn: async () => {
      const res = await getReporteProfesor();
      return res.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos de frescura
  });

  // 2. MUTATION CON FEEDBACK MEJORADO
  const mutationEliminar = useMutation({
    mutationFn: eliminarEntrenamiento,
    onSuccess: () => {
      queryClient.invalidateQueries(["reporteEntrenamientos"]);
      // Aquí podrías disparar un Toast personalizado en lugar de alert
    },
    onError: (error) => {
      console.error("Error al borrar:", error);
    }
  });

  // 3. CÁLCULOS DERIVADOS (Memoized)
  const statsGlobales = useMemo(() => {
    if (!data) return { total: 0, promedioCumplimiento: 0 };
    const total = data.length;
    const sumaPorcentajes = data.reduce((acc, ent) => 
      acc + (Math.round((ent.completados / ent.totalAlumnos) * 100) || 0), 0
    );
    return {
      total,
      promedioCumplimiento: total > 0 ? Math.round(sumaPorcentajes / total) : 0
    };
  }, [data]);

  const handleEliminar = (id) => {
    if (window.confirm("¿Confirmas la eliminación permanente de esta rutina?")) {
      mutationEliminar.mutate(id);
    }
  };

  if (isLoading) return (
    <div className="py-40 flex flex-col items-center justify-center text-slate-400">
      <div className="relative mb-6">
        <Loader2 size={50} className="animate-spin text-blue-600" />
        <TrendingUp size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-200" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando Reportes...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-6 pb-20 animate-in fade-in duration-700">
      
      {/* HEADER TIPO DASHBOARD */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white/50 p-4 rounded-[3rem]">
        <div className="pl-4">
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-blue-600"></span> Staff Monitoring
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 italic tracking-tighter leading-none">
            CONTROL DE <span className="text-blue-600">RUTINAS</span>
          </h1>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <CalendarIcon size={40} />
            </div>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Sesiones Totales</p>
            <p className="text-4xl font-black italic leading-none">{statsGlobales.total}</p>
          </div>

          <div className="flex-1 lg:flex-none bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Users size={40} />
            </div>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Avg. Cumplimiento</p>
            <p className="text-4xl font-black italic leading-none">{statsGlobales.promedioCumplimiento}%</p>
          </div>
        </div>
      </header>

      {/* GRID DE RUTINAS */}
      <div className="grid gap-6">
        {data?.length > 0 ? (
          data.map((ent) => {
            const porcentaje = Math.round((ent.completados / ent.totalAlumnos) * 100) || 0;
            const esBajo = porcentaje < 50;

            return (
              <div 
                key={ent._id} 
                className="group bg-white border border-slate-100 rounded-[3rem] p-8 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col lg:flex-row items-center gap-10 hover:-translate-y-1"
              >
                
                {/* Info Temporal y Título */}
                <div className="lg:w-1/4 w-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-slate-50 px-3 py-1 rounded-lg text-[10px] font-black text-blue-600 uppercase tracking-wider">
                      {new Date(ent.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[10px]">
                      <Clock size={12} className="text-blue-400" />
                      {new Date(ent.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                    {ent.titulo}
                  </h4>
                </div>

                {/* Visualizador de Progreso */}
                <div className="flex-1 w-full space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estado de Ejecución</p>
                      <div className="flex items-center gap-2">
                         {porcentaje === 100 ? (
                            <span className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase bg-emerald-50 px-2 py-0.5 rounded">
                                <CheckCircle2 size={12} /> Completado
                            </span>
                         ) : esBajo ? (
                            <span className="flex items-center gap-1 text-amber-500 text-[10px] font-black uppercase bg-amber-50 px-2 py-0.5 rounded">
                                <AlertTriangle size={12} /> En curso
                            </span>
                         ) : null}
                      </div>
                    </div>
                    <span className={`text-3xl font-black italic tracking-tighter ${porcentaje === 100 ? "text-emerald-500" : "text-slate-900"}`}>
                      {porcentaje}%
                    </span>
                  </div>
                  <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100 shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out rounded-full relative ${
                        porcentaje === 100 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
                        esBajo ? 'bg-amber-400' : 'bg-blue-600'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="flex items-center gap-4 border-l border-slate-50 pl-8 w-full lg:w-auto justify-end">
                  <div className="text-right hidden sm:block mr-4">
                    <p className="text-[18px] font-black text-slate-800 leading-none">{ent.completados}/{ent.totalAlumnos}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Nadadores</p>
                  </div>

                  <button 
                    onClick={() => handleEliminar(ent._id)}
                    disabled={mutationEliminar.isPending}
                    className="group/btn p-5 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-20"
                    title="Eliminar Rutina"
                  >
                    <Trash2 size={22} className="group-hover/btn:rotate-12 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={() => setModalData(ent)}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-2xl hover:bg-blue-600 transition-all duration-300 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95"
                  >
                    Detalles
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100">
             <Trophy size={60} className="mx-auto text-slate-200 mb-6" />
             <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">No hay entrenamientos registrados aún</p>
          </div>
        )}
      </div>

      {/* --- MODAL DE DETALLES (ESTILO ÑSF) --- */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setModalData(null)}></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-400">
            
            {/* Header Modal */}
            <div className="p-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                     <Trophy size={20} />
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Reporte de Cumplimiento</span>
                </div>
                <h3 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">{modalData.titulo}</h3>
                <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2"><CalendarIcon size={14} /> {new Date(modalData.fecha).toLocaleDateString()}</span>
                    <span className="flex items-center gap-2"><Clock size={14} /> {new Date(modalData.fecha).toLocaleTimeString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setModalData(null)} 
                className="p-4 bg-white hover:bg-red-50 hover:text-red-500 text-slate-300 rounded-3xl transition-all border border-slate-100 shadow-sm group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Lista Atletas */}
            <div className="p-10 max-h-[50vh] overflow-y-auto custom-scrollbar bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modalData.detallesCompletados?.length > 0 ? (
                  modalData.detallesCompletados.map((atleta, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] transition-all hover:bg-white hover:shadow-md group">
                      <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg relative shadow-lg">
                        {atleta.nombre.charAt(0)}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-black text-sm text-slate-800 uppercase tracking-tight leading-none mb-1">{atleta.nombre}</p>
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Clock size={12} className="opacity-50" />
                          <p className="text-[10px] font-black uppercase">
                            {atleta.hora ? new Date(atleta.hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <UserCircle2 size={60} className="mx-auto text-slate-100" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Ningún nadador ha marcado asistencia</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-8 bg-slate-900 flex items-center justify-between">
              <div className="text-white">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Efectividad de Sesión</p>
                <p className="text-2xl font-black italic">{modalData.completados} de {modalData.totalAlumnos} Atletas</p>
              </div>
              <button 
                onClick={() => setModalData(null)}
                className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-black/20"
              >
                Finalizar Revisión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEntrenamientos;