import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle2, ChevronRight, X, UserCircle2, Trophy, Clock, 
  Trash2, Calendar as CalendarIcon, Users, AlertTriangle, 
  Loader2, TrendingUp 
} from "lucide-react";
import { getReporteProfesor, eliminarEntrenamiento } from "../../api/entrenamientos.api";

// Sub-componente para los items de la lista (Optimiza el renderizado del loop)
const EntrenamientoCard = ({ ent, onEliminar, onDetalles, isDeleting }) => {
  const porcentaje = useMemo(() => 
    Math.round((ent.completados / ent.totalAlumnos) * 100) || 0, 
  [ent.completados, ent.totalAlumnos]);
  
  const esBajo = porcentaje < 50;

  return (
    <div className="group bg-white border border-slate-100 rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 hover:shadow-xl transition-all duration-500 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
      
      {/* Info Temporal */}
      <div className="lg:w-1/4 w-full text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
          <span className="bg-slate-50 px-3 py-1 rounded-lg text-[10px] font-black text-blue-600 uppercase tracking-wider">
            {new Date(ent.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px]">
            <Clock size={12} />
            {new Date(ent.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <h4 className="text-xl md:text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
          {ent.titulo}
        </h4>
      </div>

      {/* Progreso */}
      <div className="flex-1 w-full">
        <div className="flex justify-between items-end mb-2">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Progreso de Clase</p>
          <span className={`text-2xl font-black italic ${porcentaje === 100 ? "text-emerald-500" : "text-slate-900"}`}>
            {porcentaje}%
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              porcentaje === 100 ? 'bg-emerald-500' : esBajo ? 'bg-amber-400' : 'bg-blue-600'
            }`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-center lg:justify-end border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8">
        <button 
          onClick={() => onEliminar(ent._id)}
          disabled={isDeleting}
          className="p-4 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
        >
          <Trash2 size={20} />
        </button>
        <button 
          onClick={() => onDetalles(ent)}
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          Detalles <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const GestionEntrenamientos = () => {
  const [modalData, setModalData] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["reporteEntrenamientos"],
    queryFn: async () => {
      const res = await getReporteProfesor();
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // Aumentado a 5 min para mejor performance
  });

  const mutationEliminar = useMutation({
  mutationFn: eliminarEntrenamiento,
  onSuccess: () => {
    queryClient.invalidateQueries(["reporteEntrenamientos"]);
    // Si tienes el estado 'setNotificacion' del paso anterior, úsalo aquí:
    // setNotificacion({ visible: true, mensaje: "Entrenamiento y archivo eliminados", tipo: "success" });
    alert("Entrenamiento eliminado y espacio liberado.");
  },
  onError: (error) => {
    alert("Error al eliminar: " + error.message);
  }
});

  const statsGlobales = useMemo(() => {
    if (!data?.length) return { total: 0, promedioCumplimiento: 0 };
    const suma = data.reduce((acc, ent) => acc + (Math.round((ent.completados / ent.totalAlumnos) * 100) || 0), 0);
    return { total: data.length, promedio: Math.round(suma / data.length) };
  }, [data]);

  const handleEliminar = useCallback((id) => {
    if (window.confirm("¿Deseas eliminar este registro?")) {
      mutationEliminar.mutate(id);
    }
  }, [mutationEliminar]);

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Cargando Reportes</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 italic tracking-tighter">
            CONTROL <span className="text-blue-600">RUTINAS</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-blue-600"></span> Panel de Monitoreo
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="bg-slate-900 text-white p-5 rounded-[2rem] flex flex-col justify-center">
            <p className="text-[9px] opacity-50 font-bold uppercase">Sesiones</p>
            <p className="text-3xl font-black italic">{statsGlobales.total}</p>
          </div>
          <div className="bg-blue-600 text-white p-5 rounded-[2rem] flex flex-col justify-center">
            <p className="text-[9px] opacity-50 font-bold uppercase">Promedio</p>
            <p className="text-3xl font-black italic">{statsGlobales.promedio}%</p>
          </div>
        </div>
      </header>

      {/* Listado */}
      <div className="grid gap-4 md:gap-6">
        {data?.length > 0 ? (
          data.map((ent) => (
            <EntrenamientoCard 
              key={ent._id} 
              ent={ent} 
              onEliminar={handleEliminar} 
              onDetalles={setModalData}
              isDeleting={mutationEliminar.isPending}
            />
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
            <Trophy className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Sin datos disponibles</p>
          </div>
        )}
      </div>

      {/* Modal Optimizado */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setModalData(null)} />
          
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 italic uppercase">{modalData.titulo}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Detalle de asistencia</p>
              </div>
              <button onClick={() => setModalData(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto space-y-3">
              {modalData.detallesCompletados?.map((atleta, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                      {atleta.nombre.charAt(0)}
                    </div>
                    <p className="font-bold text-sm text-slate-800 uppercase">{atleta.nombre}</p>
                  </div>
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">COMPLETADO</span>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-slate-900 text-center">
               <button 
                onClick={() => setModalData(null)}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors"
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