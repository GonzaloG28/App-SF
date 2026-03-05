import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, Download, Link as LinkIcon, Calendar, 
  ExternalLink, Loader2, CheckCircle2, Circle, Trophy 
} from "lucide-react";
import api from "../../api/axios";

const MisEntrenamientos = () => {
  const API_URL = "http://localhost:5000/api";
  const queryClient = useQueryClient();

  // 1. Obtener los entrenamientos
  const { data: entrenamientos, isLoading } = useQuery({
    queryKey: ["misEntrenamientos"],
    queryFn: () => api.get("/entrenamiento/mis-entrenamientos").then(res => res.data)
  });

  // 2. Mutación para marcar como completado
  const completeMutation = useMutation({
    mutationFn: (id) => api.patch(`/entrenamiento/${id}/completar`),
    onSuccess: () => {
      queryClient.invalidateQueries(["misEntrenamientos"]);
    }
  });

  // --- LÓGICA DE FILTRADO ---
  const pendientes = entrenamientos?.filter(ent => !ent.completado) || [];
  const completados = entrenamientos?.filter(ent => ent.completado) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando Planificación...</p>
      </div>
    );
  }

  // Sub-componente para renderizar la tarjeta (para no repetir código)
  const EntrenamientoCard = ({ ent, isDone }) => (
    <div 
      key={ent._id} 
      className={`bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm transition-all duration-500 group animate-in fade-in slide-in-from-right-4 ${
        isDone ? 'opacity-60 grayscale-[0.5] scale-[0.98]' : 'hover:shadow-xl hover:shadow-blue-500/5'
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="flex-1 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl transition-colors ${isDone ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                <Calendar size={18} />
              </div>
              <span className="font-black text-slate-400 text-[10px] uppercase tracking-wider">
                {new Date(ent.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: "numeric" })}
              </span>
            </div>
          </div>
          
          <h3 className={`text-3xl font-black italic uppercase tracking-tighter leading-none ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {ent.titulo}
          </h3>
          
          {/* Contenido (resumido si está hecho) */}
          {!isDone && (
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
               <p className="text-slate-600 font-medium leading-relaxed text-sm">
                {ent.tipo === 'texto' ? ent.contenido : `Rutina de tipo ${ent.tipo}`}
              </p>
            </div>
          )}
        </div>

        <div className="md:w-72 flex flex-col gap-4">
          <button
            onClick={() => !isDone && completeMutation.mutate(ent._id)}
            disabled={isDone || completeMutation.isPending}
            className={`w-full py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              isDone 
                ? "bg-green-500 text-white cursor-default" 
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-100"
            }`}
          >
            {isDone ? <><CheckCircle2 size={16} /> ¡LOGRADO!</> : <><Circle size={16} /> Marcar como hecho</>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <header>
        <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Planificación Semanal</p>
        <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter">
          MIS <span className="text-blue-600">ENTRENAMIENTOS</span>
        </h1>
      </header>

      {/* --- SECCIÓN: PENDIENTES --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Próximos Retos</h2>
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full">{pendientes.length}</span>
        </div>
        
        <div className="grid gap-6">
          {pendientes.length === 0 ? (
            <div className="bg-green-50/50 border-2 border-dashed border-green-100 rounded-[2.5rem] p-12 text-center">
              <Trophy className="mx-auto text-green-300 mb-2" size={32} />
              <p className="text-green-600 font-black uppercase text-[10px] tracking-widest">¡Todo al día! Has completado todas tus rutinas.</p>
            </div>
          ) : (
            pendientes.map(ent => <EntrenamientoCard key={ent._id} ent={ent} isDone={false} />)
          )}
        </div>
      </section>

      {/* --- SECCIÓN: COMPLETADOS --- */}
      {completados.length > 0 && (
        <section className="space-y-6 pt-8">
          <div className="flex items-center gap-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-green-500">Historial de Hoy / Hechos</h2>
              <div className="h-px bg-slate-100 flex-1"></div>
          </div>
          
          <div className="grid gap-4">
            {completados.map(ent => <EntrenamientoCard key={ent._id} ent={ent} isDone={true} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default MisEntrenamientos;