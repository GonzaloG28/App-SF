import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
   Download, Link as LinkIcon, Calendar, 
   Loader2, CheckCircle, Clock, ChevronRight 
} from "lucide-react";
import { getMisEntrenamientos, completarEntrenamiento } from "../../api/entrenamientos.api";

const MisEntrenamientos = () => {
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Query optimizada usando la función del archivo API
  const { data: entrenamientos, isLoading } = useQuery({
    queryKey: ["misEntrenamientos"],
    queryFn: async () => {
      const res = await getMisEntrenamientos();
      return res.data;
    }
  });

  // Mutación corregida para usar PATCH y la función importada
  const completarMutation = useMutation({
    mutationFn: (id) => completarEntrenamiento(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["misEntrenamientos"]);
    },
    onError: (error) => {
      console.error("Error:", error);
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse"></div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">
          Sincronizando Rutinas
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-32">
      {/* Header Premium */}
      <header className="relative space-y-2">
        <div className="flex items-center gap-3">
          <span className="h-[2px] w-8 bg-blue-600"></span>
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em]">
            Rendimiento Atleta
          </p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter leading-none">
          MIS <span className="text-blue-600 drop-shadow-sm">ENTRENAMIENTOS</span>
        </h1>
      </header>

      <div className="grid gap-8">
        {entrenamientos?.length === 0 ? (
          <div className="bg-slate-50/50 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-[3rem] py-32 text-center">
            <div className="bg-white w-16 h-16 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <Calendar className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">
              No hay sesiones programadas para hoy
            </p>
          </div>
        ) : (
          entrenamientos?.map((ent) => (
            <div 
              key={ent._id} 
              className="relative bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 p-6 md:p-10 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group overflow-hidden"
            >
              {/* Decoración de fondo al hacer hover */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />

              <div className="relative flex flex-col lg:flex-row justify-between gap-10">
                
                {/* Contenido Principal */}
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-lg shadow-slate-200">
                      <Clock size={14} className="text-blue-400" />
                      <span className="font-black text-[10px] uppercase tracking-wider">
                        {new Date(ent.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    
                    <span className={`text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border ${
                      ent.completado 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                      : "bg-blue-50 border-blue-100 text-blue-600"
                    }`}>
                      {ent.completado ? "✓ Sesión Finalizada" : `Tipo: ${ent.tipo}`}
                    </span>
                  </div>
                  
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 italic uppercase tracking-tighter leading-none group-hover:translate-x-2 transition-transform duration-500">
                    {ent.titulo}
                  </h3>
                  
                  {/* Tipos de Contenido con diseño mejorado */}
                  <div className="max-w-2xl">
                    {ent.tipo === 'texto' && (
                      <div className="bg-slate-50/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 group-hover:bg-white transition-colors duration-500">
                        <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-sm md:text-base italic">
                          {ent.contenido}
                        </p>
                      </div>
                    )}

                    {ent.tipo === 'archivo' && (
                      <div className="inline-flex items-center gap-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-2 pl-8 rounded-3xl shadow-xl">
                        <div className="py-4">
                          <p className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-400">Material adjunto</p>
                          <p className="text-xs opacity-60 font-bold italic">PDF / Imagen de rutina</p>
                        </div>
                        <a 
                          href={ent.archivoUrl.replace(
                            '/upload/', 
                            `/upload/fl_attachment:entrenamiento-${new Date(ent.fecha || Date.now()).toLocaleDateString('es-ES').replace(/\//g, '-')}/`
                          )}
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-blue-600 hover:bg-white hover:text-blue-600 p-5 rounded-2xl transition-all active:scale-90"
                        >
                          <Download size={24} />
                        </a>
                      </div>
                    )}

                    {ent.tipo === 'link' && (
                      <a 
                        href={ent.contenido} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] hover:border-blue-600 transition-all group/link shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover/link:bg-blue-600 group-hover/link:text-white transition-colors">
                            <LinkIcon size={24} />
                          </div>
                          <span className="font-black text-xs uppercase italic tracking-tight text-slate-900">Ver Video / Referencia</span>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover/link:text-blue-600 group-hover/link:translate-x-2 transition-all" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Sidebar de Acción y Feedback */}
                <div className="lg:w-80 flex flex-col gap-4">
                  <div className="bg-slate-50/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instrucciones Coach</p>
                      </div>
                      <p className="text-[12px] font-bold text-slate-500 leading-relaxed italic">
                        "{ent.notasProfesor || "Enfocarse en la técnica de brazada y el empuje final en cada serie."}"
                      </p>
                    </div>
                    
                    {/* Botón de Acción Principal */}
                    <div className="mt-8">
                      <button
                        onClick={() => completarMutation.mutate(ent._id)}
                        disabled={ent.completado || completarMutation.isPending}
                        className={`w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-300 ${
                          ent.completado 
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 cursor-default" 
                          : "bg-blue-600 text-white hover:bg-slate-900 shadow-xl shadow-blue-200 hover:shadow-none active:scale-95"
                        }`}
                      >
                        {completarMutation.isPending ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : ent.completado ? (
                          <> <CheckCircle size={18} /> Entrenamiento OK </>
                        ) : (
                          "Completar Sesión"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MisEntrenamientos;