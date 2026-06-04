import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
   Download, Link as LinkIcon, Calendar, 
   Loader2, CheckCircle, Clock, ChevronRight,
   Zap, Info, FileText
} from "lucide-react";
import { getMisEntrenamientos, completarEntrenamiento } from "../../api/entrenamientos.api";

const MisEntrenamientos = () => {
  const queryClient = useQueryClient();

  const { data: entrenamientos, isLoading } = useQuery({
    queryKey: ["misEntrenamientos"],
    queryFn: async () => {
      const res = await getMisEntrenamientos();
      return res.data;
    }
  });

  const completarMutation = useMutation({
    mutationFn: (id) => completarEntrenamiento(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["misEntrenamientos"]);
    },
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-32">
      
      {/* HEADER: ESTILO FICHA TÉCNICA */}
      <header className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[11px] font-black px-2 py-0.5 rounded uppercase tracking-tighter italic">ÑSF</span>
            <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em]">Panel de Entrenamientos</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter leading-none uppercase">
            Mis <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Rutinas</span>
          </h1>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sesiones Totales</p>
          <p className="text-3xl font-black text-slate-900 italic leading-none">{entrenamientos?.length || 0}</p>
        </div>
      </header>

      <div className="grid gap-6">
        {entrenamientos?.length === 0 ? (
          <EmptyState />
        ) : (
          entrenamientos?.map((ent) => (
            <TrainingCard 
              key={ent._id} 
              ent={ent} 
              onComplete={() => completarMutation.mutate(ent._id)}
              isPending={completarMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTES DE UI ---

const TrainingCard = ({ ent, onComplete, isPending }) => (
  <div className={`relative bg-white rounded-[2rem] md:rounded-[2.5rem] border p-1 transition-all duration-300 group ${
    ent.completado ? "border-emerald-100 shadow-sm" : "border-slate-100 shadow-xl shadow-slate-200/50 hover:border-blue-200"
  }`}>
    <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${ent.completado ? "bg-emerald-500" : "bg-blue-600"}`} />

    <div className="p-5 md:p-8 flex flex-col gap-6">
      
      {/* HEADER CARD: Más compacto */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
             {new Date(ent.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
           </span>
           <h3 className="text-2xl md:text-4xl font-black text-slate-900 italic uppercase tracking-tighter leading-[0.9]">
             {ent.titulo}
           </h3>
        </div>
        <StatusBadge completed={ent.completado} type={ent.tipo} />
      </div>

      {/* CONTENIDO PRINCIPAL: Layout optimizado */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Columna principal de contenido */}
        <div className="lg:col-span-2">
          {ent.tipo === 'texto' && (
            <div className="bg-slate-50 p-5 rounded-2xl italic text-slate-600 text-sm leading-relaxed font-medium">
              {ent.contenido}
            </div>
          )}

          {ent.tipo === 'archivo' && (
            <a 
              href={ent.archivoUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-4 bg-slate-900 text-white p-2 pl-6 rounded-2xl hover:bg-blue-600 transition-all shadow-lg group/btn"
            >
              <span className="font-black text-[11px] uppercase tracking-widest">Descargar PDF de Rutina</span>
              <div className="bg-white/10 p-3 rounded-xl group-hover/btn:bg-white group-hover/btn:text-blue-600 transition-colors">
                <Download size={20} />
              </div>
            </a>
          )}

          {ent.tipo === 'link' && (
            <a 
              href={ent.contenido} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between bg-white border-2 border-slate-100 p-5 rounded-2xl hover:border-blue-600 transition-all group/link"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover/link:bg-blue-600 group-hover/link:text-white transition-colors">
                  <LinkIcon size={20} />
                </div>
                <span className="font-black text-[11px] uppercase italic tracking-tight text-slate-900">Referencia de Video Externa</span>
              </div>
              <ChevronRight className="text-slate-300 group-hover/link:text-blue-600 group-hover/link:translate-x-1 transition-all" />
            </a>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: COACH NOTES & ACCIÓN */}
      <div className="lg:w-72 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas Coach</p>
            <p className="text-xs font-medium text-slate-600 italic">"{ent.notasProfesor || "Sin comentarios"}"</p>
          </div>
          
          <button
            onClick={onComplete}
            disabled={ent.completado || isPending}
            className={`w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
              ent.completado 
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
              : "bg-slate-900 text-white hover:bg-blue-600"
            }`}
          >
            {isPending ? "..." : ent.completado ? "Completado" : "Marcar Finalizado"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ completed, type }) => (
  <span className={`text-[11px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border shadow-sm ${
    completed 
    ? "bg-emerald-500 border-transparent text-white" 
    : "bg-white border-slate-100 text-slate-500"
  }`}>
    {completed ? "✓ Éxito" : `Fase: ${type}`}
  </span>
);

const EmptyState = () => (
  <div className="bg-white border border-slate-100 rounded-[3rem] py-24 text-center shadow-sm">
    <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-6">
      <Clock className="text-slate-300" size={32} />
    </div>
    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[11px] italic">
      Sin sesiones programadas para hoy
    </p>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
      <Zap className="absolute inset-0 m-auto text-blue-600" size={24} fill="currentColor" />
    </div>
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">
      Sincronizando Telemetría
    </p>
  </div>
);

export default MisEntrenamientos;