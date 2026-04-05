import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle2, ChevronRight, X, Trophy, Clock, 
  Trash2, Loader2, AlertCircle
} from "lucide-react";
import { getReporteProfesor, eliminarEntrenamiento } from "../../api/entrenamientos.api";

// --- COMPONENTE DE TARJETA CON TONALIDADES UNIFICADAS ---
const EntrenamientoCard = ({ ent, onEliminar, onDetalles, isDeleting }) => {
  const porcentaje = useMemo(() => {
  const completados = ent.estadisticas?.completados || 0;
  const total = ent.estadisticas?.total || 0;
  return total > 0 ? Math.round((completados / total) * 100) : 0;
}, [ent.estadisticas]);
  
  // Lógica de colores basada en tu paleta
  const esBajo = porcentaje < 50;
  const esCompletado = porcentaje === 100;

  return (
    <div className="group bg-white border border-slate-100 rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
        
        {/* Info Temporal */}
        <div className="w-full lg:w-1/4 flex flex-col items-center lg:items-start text-center lg:text-left min-w-0">
          <div className="flex items-center gap-3 mb-2 shrink-0">
            <span className="bg-blue-50 px-3 py-1 rounded-lg text-[11px] md:text-[11px] font-black text-blue-600 uppercase tracking-wider">
              {new Date(ent.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] md:text-[11px]">
              <Clock size={12} className="text-blue-400" />
              {new Date(ent.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <h4 className="text-xl md:text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors truncate w-full">
            {ent.titulo}
          </h4>
        </div>

        {/* Progreso con Naranja, Verde y Azul */}
        <div className="w-full flex-1">
          <div className="flex justify-between items-end mb-2">
            <p className="text-[11px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              {esBajo && <AlertCircle size={10} className="text-orange-500" />}
              Progreso de Clase
            </p>
            <span className={`text-xl md:text-2xl font-black italic ${
              esCompletado ? "text-emerald-500" : esBajo ? "text-orange-500" : "text-blue-600"
            }`}>
              {porcentaje}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                esCompletado ? 'bg-emerald-500' : esBajo ? 'bg-orange-500' : 'bg-blue-600'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="w-full lg:w-auto flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-8">
          <button 
            onClick={() => onEliminar(ent._id)}
            disabled={isDeleting}
            className="p-4 md:p-5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white transition-all disabled:opacity-30 shrink-0"
          >
            <Trash2 size={20} />
          </button>
          <button 
            onClick={() => onDetalles(ent)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-blue-600 text-white px-6 md:px-8 py-4 md:py-5 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-black text-[11px] uppercase tracking-widest"
          >
            Detalles <ChevronRight size={16} />
          </button>
        </div>
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
    staleTime: 1000 * 60 * 5,
  });

  const mutationEliminar = useMutation({
    mutationFn: eliminarEntrenamiento,
    onSuccess: () => {
      queryClient.invalidateQueries(["reporteEntrenamientos"]);
    },
    onError: (error) => alert("Error: " + error.message)
  });

  const statsGlobales = useMemo(() => {
    if (!data?.length) return { total: 0, promedio: 0 };
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
      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Analizando Datos</p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-3 md:p-8 space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* Header con Blanco y Azul */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="w-full md:w-auto">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 italic tracking-tighter uppercase leading-none break-words">
            CONTROL <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">RUTINAS</span>
          </h1>
          <p className="text-slate-400 text-[11px] md:text-[11px] font-bold uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
           <span className="bg-blue-600 text-white text-[11px] font-black px-2 py-0.5 rounded uppercase tracking-tighter italic">ÑSF</span> Panel de Monitoreo
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-64 lg:w-80">
          <div className="bg-white border border-slate-100 text-slate-900 p-5 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-center shadow-sm">
            <p className="text-[11px] md:text-[11px] text-slate-400 font-bold uppercase tracking-wider">Sesiones</p>
            <p className="text-2xl md:text-3xl font-black italic text-blue-600">{statsGlobales.total}</p>
          </div>
          <div className="bg-blue-600 text-white p-5 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-center shadow-lg shadow-blue-200/50">
            <p className="text-[11px] md:text-[11px] opacity-70 font-bold uppercase tracking-wider">Promedio</p>
            <p className="text-2xl md:text-3xl font-black italic">{statsGlobales.promedio}%</p>
          </div>
        </div>
      </header>

      {/* Listado */}
      <section className="grid gap-4 md:gap-6">
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
          <div className="py-24 text-center border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center">
            <Trophy className="text-blue-100 mb-6" size={64} />
            <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.3em]">No hay actividad registrada</p>
          </div>
        )}
      </section>

      {/* Modal con detalles en Verde y Blanco */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalData(null)} />
          
          <div className="relative bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
            <div className="p-6 md:p-10 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center">
              <div className="min-w-0">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 italic uppercase truncate">{modalData.titulo}</h3>
                <p className="text-[11px] md:text-[11px] font-bold text-blue-400 uppercase tracking-widest mt-1">Checklist de Asistencia</p>
              </div>
              <button onClick={() => setModalData(null)} className="p-3 bg-white hover:bg-orange-50 hover:text-orange-500 rounded-full transition-all shadow-sm shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-10 max-h-[70vh] md:max-h-[50vh] overflow-y-auto space-y-3">
              {modalData.detalles?.length > 0 ? (
                modalData.detalles.map((atleta, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black shrink-0">
                          {atleta.nombre.charAt(0)}
                        </div>
                        <p className="font-bold text-xs md:text-sm text-slate-800 uppercase truncate">{atleta.nombre}</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg shrink-0">
                        <CheckCircle2 size={12} /> LISTO
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-center py-10 text-slate-400 text-[11px] font-black uppercase tracking-widest">Esperando completados...</p>
              )}
            </div>
            
            <div className="p-6 md:p-10 bg-white border-t border-slate-100">
               <button 
                onClick={() => setModalData(null)}
                className="w-full bg-blue-600 text-white py-4 md:py-5 rounded-2xl font-black text-[11px] md:text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
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