import { useQuery } from "@tanstack/react-query";
import { ClipboardList, FileText, Download, Link as LinkIcon, Calendar, ExternalLink, Loader2 } from "lucide-react";
import api from "../../api/axios";

const MisEntrenamientos = () => {
  // Base URL para los archivos (Ajusta el puerto si es necesario)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { data: entrenamientos, isLoading } = useQuery({
    queryKey: ["misEntrenamientos"],
    queryFn: () => api.get("/entrenamiento/mis-entrenamientos").then(res => res.data)
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando Planificación...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header>
        <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Planificación Semanal</p>
        <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter">
          MIS <span className="text-blue-600">ENTRENAMIENTOS</span>
        </h1>
      </header>

      <div className="grid gap-6">
        {entrenamientos?.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
            <p className="text-slate-400 font-bold italic">Aún no tienes entrenamientos asignados.</p>
          </div>
        ) : (
          entrenamientos?.map((ent) => (
            <div key={ent._id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                
                <div className="flex-1 space-y-5">
                  {/* Fecha y Badge de Tipo */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Calendar size={18} />
                      </div>
                      <span className="font-black text-slate-400 text-[10px] uppercase tracking-wider">
                        {new Date(ent.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <span className="bg-slate-100 text-slate-400 text-[9px] font-black px-3 py-1 rounded-full uppercase">
                      {ent.tipo}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">
                    {ent.titulo}
                  </h3>
                  
                  {/* RENDERIZADO SEGÚN TIPO */}
                  
                  {/* 1. TEXTO */}
                  {ent.tipo === 'texto' && (
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
                      <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-sm">
                        {ent.contenido}
                      </p>
                    </div>
                  )}

                  {/* 2. ARCHIVO */}
                  {ent.tipo === 'archivo' && (
                    <div className="flex items-center justify-between bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-[2rem] shadow-lg shadow-blue-200">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                          <FileText size={28} />
                        </div>
                        <div>
                          <p className="font-black text-xs uppercase italic tracking-tight">Documento Adjunto</p>
                          <p className="text-[10px] opacity-70 font-bold uppercase">Rutina en PDF/Imagen</p>
                        </div>
                      </div>
                      <a 
                        href={`${API_URL}/${ent.archivoUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-white text-blue-600 hover:bg-slate-100 p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-md"
                      >
                        <Download size={20} />
                      </a>
                    </div>
                  )}

                  {/* 3. LINK / ENLACE */}
                  {ent.tipo === 'link' && (
                    <a 
                      href={ent.contenido} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-[2rem] hover:bg-slate-800 transition-all group/link"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl text-blue-400">
                          <LinkIcon size={28} />
                        </div>
                        <div>
                          <p className="font-black text-xs uppercase italic">Recurso Externo</p>
                          <p className="text-[10px] opacity-50 truncate max-w-[150px] md:max-w-xs">{ent.contenido}</p>
                        </div>
                      </div>
                      <ExternalLink size={20} className="text-slate-500 group-hover/link:text-white transition-colors" />
                    </a>
                  )}
                </div>

                {/* Sidebar: Notas del Profesor */}
                <div className="md:w-72">
                  <div className="bg-slate-50/80 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Feedback del Coach</p>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 leading-snug italic">
                      "{ent.notasProfesor || "Realizar el calentamiento estándar de 400m antes de iniciar."}"
                    </p>
                    
                    <div className="mt-auto pt-6">
                       <div className="flex items-center gap-2 grayscale opacity-50">
                          <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                          <span className="text-[8px] font-black text-slate-400 uppercase">Coach Asignado</span>
                       </div>
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