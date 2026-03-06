import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enviarEntrenamiento } from "../../api/entrenamientos.api"; 
import api from "../../api/axios";
import { 
  Send, FileText, Type, Link as LinkIcon, 
  Users, Search, CheckCircle2, 
  Circle, Loader2, ChevronRight, UploadCloud,
  X, Zap, Info, Filter
} from "lucide-react";

const CrearEntrenamiento = () => {
  const queryClient = useQueryClient();
  
  // ESTADOS DEL FORMULARIO
  const [tipoCarga, setTipoCarga] = useState("texto");
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [notas, setNotas] = useState("");
  const [archivo, setArchivo] = useState(null);
  
  // ESTADOS DE SELECCIÓN Y FILTRO
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [seleccionados, setSeleccionados] = useState([]);

  // 1. OBTENCIÓN DE DATOS
  const { data: nadadores, isLoading } = useQuery({
    queryKey: ["nadadores-entrenamiento"],
    queryFn: async () => {
      const res = await api.get("/nadadores");
      return res.data;
    }
  });

  // 2. LÓGICA DE FILTRADO OPTIMIZADA (useMemo)
  const nadadoresFiltrados = useMemo(() => {
    return nadadores?.filter(n => {
      const cumpleNombre = n.user.nombre.toLowerCase().includes(search.toLowerCase());
      const cumpleCat = categoriaFiltro === "Todas" || n.categoria === categoriaFiltro;
      return cumpleNombre && cumpleCat;
    }) || [];
  }, [nadadores, search, categoriaFiltro]);

  const toggleNadador = (id) => {
    setSeleccionados(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const seleccionarTodosFiltrados = () => {
    const idsFiltrados = nadadoresFiltrados.map(n => n._id);
    // Si todos los filtrados ya están, los deseleccionamos. Si no, los sumamos.
    const todosSeleccionados = idsFiltrados.every(id => seleccionados.includes(id));
    
    if (todosSeleccionados) {
      setSeleccionados(prev => prev.filter(id => !idsFiltrados.includes(id)));
    } else {
      setSeleccionados(prev => [...new Set([...prev, ...idsFiltrados])]);
    }
  };

  // 3. MUTACIÓN
  const mutation = useMutation({
    mutationFn: enviarEntrenamiento,
    onSuccess: () => {
      setTitulo(""); setContenido(""); setNotas(""); setArchivo(null); setSeleccionados([]);
      queryClient.invalidateQueries(["reporteEntrenamientos"]);
      // Aquí idealmente dispararías un Toast
    },
  });

  const handleEnviar = () => {
    if (!titulo.trim()) return;
    if (seleccionados.length === 0) return;
    
    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("tipo", tipoCarga);
    formData.append("contenido", contenido);
    formData.append("notas", notas);
    formData.append("destinatarios", JSON.stringify(seleccionados));

    if (tipoCarga === "archivo" && archivo) {
      formData.append("archivo", archivo);
    }

    mutation.mutate(formData);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-6 pb-20 animate-in fade-in duration-700">
      
      {/* HEADER DE ACCIÓN */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/40 p-2 rounded-[3rem]">
        <div className="pl-6">
          <div className="flex items-center gap-2 mb-1">
             <Zap size={14} className="text-blue-600 fill-blue-600" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Distrubución Técnica</p>
          </div>
          <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
            Training <span className="text-blue-600">Builder</span>
          </h1>
        </div>
        
        <button 
          onClick={handleEnviar}
          disabled={mutation.isPending || !titulo || seleccionados.length === 0}
          className="group relative flex items-center gap-4 bg-blue-600 hover:bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-200 disabled:opacity-30 disabled:grayscale active:scale-95"
        >
          {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          Publicar Rutina
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN DE CARGA */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-8">
            
            {/* SELECTOR DE TIPO */}
            <div className="flex gap-4 p-2 bg-slate-50 rounded-[2rem] border border-slate-100">
              {[
                { id: "texto", icon: Type, label: "Escrito" },
                { id: "archivo", icon: FileText, label: "Adjunto" },
                { id: "link", icon: LinkIcon, label: "Enlace" }
              ].map(tipo => (
                <button
                  key={tipo.id}
                  onClick={() => { setTipoCarga(tipo.id); setContenido(""); }}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    tipoCarga === tipo.id 
                    ? "bg-white text-blue-600 shadow-xl shadow-blue-500/10 scale-[1.02]" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  }`}
                >
                  <tipo.icon size={18} /> {tipo.label}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Título de la Sesión</label>
                <input 
                  type="text" 
                  placeholder="Ej: Resistencia de Base II - Mariposa" 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-3xl p-6 font-black text-slate-800 placeholder:text-slate-300 outline-none transition-all text-lg shadow-inner"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              {/* ÁREAS DINÁMICAS SEGÚN TIPO */}
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                {tipoCarga === "texto" && (
                  <textarea 
                    placeholder="Escribe la rutina detallada aquí (Series, Metros, Descansos)..."
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-[2.5rem] p-8 font-medium text-slate-600 h-80 outline-none transition-all shadow-inner leading-relaxed"
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                  />
                )}

                {tipoCarga === "link" && (
                  <div className="space-y-4 bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100">
                    <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <LinkIcon size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Enlace de Referencia</span>
                    </div>
                    <input 
                      type="url" 
                      placeholder="https://youtube.com/watch?v=..." 
                      className="w-full bg-white border-2 border-blue-100 rounded-2xl p-6 font-bold text-blue-600 placeholder:text-blue-200 outline-none focus:ring-4 focus:ring-blue-500/5 shadow-sm"
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                    />
                  </div>
                )}

                {tipoCarga === "archivo" && (
                  <div className="group border-4 border-dashed border-slate-100 rounded-[3rem] p-16 text-center hover:border-blue-200 hover:bg-blue-50/30 transition-all relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      onChange={(e) => setArchivo(e.target.files[0])}
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform group-hover:bg-blue-600 group-hover:text-white">
                        <UploadCloud size={32} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-800 uppercase tracking-tight">
                            {archivo ? archivo.name : "Soltar archivo aquí"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">PDF, PNG o JPG (Máx 10MB)</p>
                      </div>
                      {archivo && (
                        <button 
                          onClick={(e) => { e.preventDefault(); setArchivo(null); }}
                          className="relative z-20 flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <X size={14} /> Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 ml-4 text-slate-400">
                    <Info size={12} />
                    <label className="text-[10px] font-black uppercase tracking-[0.2em]">Observaciones Internas</label>
                </div>
                <textarea 
                  placeholder="Instrucciones especiales para el atleta..."
                  className="w-full bg-white border border-slate-100 rounded-2xl p-6 text-xs font-bold text-slate-500 min-h-[100px] outline-none focus:ring-4 focus:ring-slate-50"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: DISTRIBUCIÓN */}
        <div className="lg:col-span-5">
          <section className="bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl flex flex-col h-[850px] sticky top-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                    <Users size={22} />
                </div>
                <div>
                    <h3 className="font-black italic uppercase text-lg leading-none">Destinatarios</h3>
                    <p className="text-[9px] text-blue-400 font-black tracking-widest uppercase mt-1">Selección de Atletas</p>
                </div>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                <span className="text-white font-black text-xl leading-none">{seleccionados.length}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Filtrar por nombre..." 
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border-none rounded-2xl text-white text-xs font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["Todas", "Infantil", "Juvenil", "Mayores"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaFiltro(cat)}
                    className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase whitespace-nowrap transition-all border ${
                        categoriaFiltro === cat 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-transparent border-white/10 text-slate-500 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              <button 
                onClick={seleccionarTodosFiltrados}
                className="w-full py-4 border border-dashed border-white/10 text-[10px] font-black text-blue-400 uppercase hover:bg-white/5 rounded-2xl mb-4 transition-all flex items-center justify-center gap-3"
              >
                <Filter size={14} />
                {nadadoresFiltrados.every(n => seleccionados.includes(n._id)) ? "Deseleccionar filtrados" : "Seleccionar todos los filtrados"}
              </button>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                    <Loader2 className="animate-spin text-white mb-4" size={40} />
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">Cargando Atletas...</p>
                </div>
              ) : (
                nadadoresFiltrados.map(n => (
                  <div 
                    key={n._id}
                    onClick={() => toggleNadador(n._id)}
                    className={`group flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        seleccionados.includes(n._id) 
                        ? "border-blue-500 bg-blue-500/10" 
                        : "border-white/5 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`transition-transform duration-300 ${seleccionados.includes(n._id) ? "scale-110" : ""}`}>
                        {seleccionados.includes(n._id) 
                            ? <CheckCircle2 size={24} className="text-blue-500" /> 
                            : <Circle size={24} className="text-white/10 group-hover:text-white/30" />
                        }
                      </div>
                      <div>
                        <p className={`text-sm font-black uppercase tracking-tight transition-colors ${seleccionados.includes(n._id) ? "text-white" : "text-slate-400"}`}>
                            {n.user.nombre}
                        </p>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{n.categoria || "N/A"}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`transition-all ${seleccionados.includes(n._id) ? "text-blue-500 translate-x-1" : "text-white/10"}`} />
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                    Se enviará a <span className="text-blue-500 font-black">{seleccionados.length}</span> nadadores seleccionados
                </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CrearEntrenamiento;