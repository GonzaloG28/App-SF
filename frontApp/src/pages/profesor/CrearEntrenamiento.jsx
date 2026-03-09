import { useState, useMemo, useCallback, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { enviarEntrenamiento } from "../../api/entrenamientos.api";
import { 
  Send, FileText, Type, Link as LinkIcon, 
  Users, Search, CheckCircle2, 
  Circle, Loader2, ChevronRight, UploadCloud,
  X, Zap, Info, Filter
} from "lucide-react";

// --- COMPONENTE HIJO OPTIMIZADO ---
const NadadorRow = memo(({ n, isSelected, onToggle }) => (
  <div 
    onClick={() => onToggle(n._id)}
    className={`group flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
      isSelected ? "border-blue-500 bg-blue-500/10" : "border-white/5 bg-white/5 hover:bg-white/10"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        {isSelected ? <CheckCircle2 size={20} className="text-blue-500" /> : <Circle size={20} className="text-white/10 group-hover:text-white/30" />}
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-black uppercase truncate ${isSelected ? "text-white" : "text-slate-400"}`}>
          {n.user.nombre}
        </p>
        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{n.categoria || "S/N"}</p>
      </div>
    </div>
    <ChevronRight size={14} className={isSelected ? "text-blue-500" : "text-white/5"} />
  </div>
));

const CrearEntrenamiento = () => {
  const queryClient = useQueryClient();
  const [tipoCarga, setTipoCarga] = useState("texto");
  const [form, setForm] = useState({ titulo: "", contenido: "", notas: "" });
  const [archivo, setArchivo] = useState(null);
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [seleccionados, setSeleccionados] = useState([]);
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: "", tipo: "success" });

  const { data: nadadores, isLoading } = useQuery({
    queryKey: ["nadadores-entrenamiento"],
    queryFn: async () => {
      const res = await api.get("/nadadores");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 min para evitar recargas constantes
  });

  const nadadoresFiltrados = useMemo(() => {
    if (!nadadores) return [];
    const term = search.toLowerCase();
    return nadadores.filter(n => 
      n.user.nombre.toLowerCase().includes(term) && 
      (categoriaFiltro === "Todas" || n.categoria === categoriaFiltro)
    );
  }, [nadadores, search, categoriaFiltro]);

  const toggleNadador = useCallback((id) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const seleccionarTodosFiltrados = () => {
    const ids = nadadoresFiltrados.map(n => n._id);
    const todosEnListaEstan = ids.every(id => seleccionados.includes(id));
    setSeleccionados(prev => todosEnListaEstan ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const mutation = useMutation({
  mutationFn: enviarEntrenamiento,
  onSuccess: () => {
    // Feedback visual positivo
    setNotificacion({ 
      visible: true, 
      mensaje: "¡Rutina publicada con éxito!", 
      tipo: "success" 
    });
    
    // Limpiar formulario
    setForm({ titulo: "", contenido: "", notas: "" });
    setArchivo(null);
    setSeleccionados([]);
    queryClient.invalidateQueries(["reporteEntrenamientos"]);

    // Ocultar notificación tras 4 segundos
    setTimeout(() => setNotificacion({ ...notificacion, visible: false }), 4000);
  },
  onError: (error) => {
    setNotificacion({ 
      visible: true, 
      mensaje: "Error al subir: " + (error.response?.data?.message || "Servidor no responde"), 
      tipo: "error" 
    });
    setTimeout(() => setNotificacion({ ...notificacion, visible: false }), 5000);
  }
});

  const handleEnviar = () => {
  if (!form.titulo.trim() || seleccionados.length === 0) return;
  
  const formData = new FormData();
  
  // Agregamos los campos básicos
  formData.append("titulo", form.titulo);
  formData.append("notas", form.notas);
  formData.append("tipo", tipoCarga);
  formData.append("destinatarios", JSON.stringify(seleccionados));

  // Manejo inteligente del contenido según el tipo
  if (tipoCarga === "archivo") {
    if (archivo) {
      formData.append("archivo", archivo);
    }
  } else {
    formData.append("contenido", form.contenido);
  }

  mutation.mutate(formData);
};

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-10 space-y-8 animate-in fade-in duration-500 pb-32 md:pb-10">

      {/* NOTIFICACIÓN FLOTANTE (TOAST) */}
      {notificacion.visible && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-8 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-10 fade-in duration-300 ${
          notificacion.tipo === "success" 
            ? "bg-slate-900 border-blue-500/30 text-white" 
            : "bg-red-950 border-red-500/30 text-red-200"
        }`}>
          {notificacion.tipo === "success" ? (
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <CheckCircle2 size={16} className="text-white" />
            </div>
          ) : (
            <div className="bg-red-600 p-1.5 rounded-lg">
              <X size={16} className="text-white" />
            </div>
          )}
          <p className="font-black uppercase text-[10px] tracking-widest">
            {notificacion.mensaje}
          </p>
          <button 
            onClick={() => setNotificacion({ ...notificacion, visible: false })}
            className="ml-4 hover:rotate-90 transition-transform"
          >
            <X size={14} className="opacity-50" />
          </button>
        </div>
      )}
      
      {/* HEADER DINÁMICO */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Zap size={12} className="text-white fill-white" /></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Panel de Control Docente</p>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 italic tracking-tighter uppercase">
            TRAINING <span className="text-blue-600">BUILDER</span>
          </h1>
        </div>
        
        <button 
          onClick={handleEnviar}
          disabled={mutation.isPending || !form.titulo || seleccionados.length === 0}
          className="w-full lg:w-auto flex items-center justify-center gap-4 bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl disabled:opacity-20 active:scale-95"
        >
          {mutation.isPending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          Publicar Rutina
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        
        {/* BLOQUE DE CARGA (IZQUIERDA) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 p-6 md:p-12 shadow-sm">
            
            {/* SELECTOR DE MODO */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50 rounded-[2rem] mb-10">
              {[
                { id: "texto", icon: Type, label: "Texto" },
                { id: "archivo", icon: FileText, label: "PDF/Img" },
                { id: "link", icon: LinkIcon, label: "Link" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTipoCarga(t.id)}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[9px] uppercase tracking-tighter transition-all ${
                    tipoCarga === t.id ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div className="group">
                <input 
                  type="text" 
                  placeholder="Título de la sesión..." 
                  className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black text-slate-800 text-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
                  value={form.titulo}
                  onChange={e => setForm({...form, titulo: e.target.value})}
                />
              </div>

              {/* INPUTS DINÁMICOS */}
              <div className="min-h-[300px]">
                {tipoCarga === "texto" && (
                  <textarea 
                    placeholder="Detalla las series, metros y pausas..."
                    className="w-full bg-slate-50 rounded-[2rem] p-8 font-medium text-slate-600 h-80 outline-none focus:bg-white border-2 border-transparent focus:border-blue-50 transition-all leading-relaxed shadow-inner"
                    value={form.contenido}
                    onChange={e => setForm({...form, contenido: e.target.value})}
                  />
                )}

                {tipoCarga === "link" && (
                  <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 animate-in zoom-in-95">
                    <div className="flex items-center gap-2 text-blue-600 mb-4 font-black text-[10px] uppercase">
                      <LinkIcon size={14} /> URL del entrenamiento
                    </div>
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      className="w-full bg-white rounded-xl p-5 font-bold text-blue-600 outline-none shadow-sm"
                      value={form.contenido}
                      onChange={e => setForm({...form, contenido: e.target.value})}
                    />
                  </div>
                )}

                {tipoCarga === "archivo" && (
                  <div className="relative group border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center hover:border-blue-200 transition-all">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setArchivo(e.target.files[0])} />
                    <UploadCloud size={40} className="mx-auto text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase text-slate-800 truncate">
                      {archivo ? archivo.name : "Subir Planificación"}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">PDF o Imagen (Máx 10MB)</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <Info size={12} />
                  <span className="text-[9px] font-black uppercase">Notas técnicas</span>
                </div>
                <textarea 
                  placeholder="Consejos adicionales..."
                  className="w-full bg-transparent p-2 text-xs font-bold text-slate-500 h-20 outline-none resize-none"
                  value={form.notas}
                  onChange={e => setForm({...form, notas: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE DESTINATARIOS (DERECHA) */}
        <div className="lg:col-span-5">
          <aside className="bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl flex flex-col h-[600px] lg:h-[800px] lg:sticky lg:top-8 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Users size={20} /></div>
                <h3 className="text-white font-black uppercase text-sm tracking-tighter italic">Atletas <span className="text-blue-500">({seleccionados.length})</span></h3>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar nadador..." 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border-none rounded-2xl text-white text-[11px] font-bold placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["Todas", "Infantil", "Juvenil", "Mayores"].map(c => (
                  <button key={c} onClick={() => setCategoriaFiltro(c)} 
                    className={`shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${categoriaFiltro === c ? "bg-blue-600 text-white" : "bg-white/5 text-slate-500 hover:text-white"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              <button onClick={seleccionarTodosFiltrados} className="w-full py-3 border border-dashed border-white/10 text-[9px] font-black text-blue-400 uppercase hover:bg-blue-600 hover:text-white rounded-xl mb-4 transition-all">
                {nadadoresFiltrados.every(n => seleccionados.includes(n._id)) ? "Deseleccionar Todos" : "Seleccionar Filtrados"}
              </button>
              
              {isLoading ? (
                <div className="py-20 text-center"><Loader2 className="animate-spin text-white/10 mx-auto" size={30} /></div>
              ) : (
                nadadoresFiltrados.map(n => (
                  <NadadorRow 
                    key={n._id} 
                    n={n} 
                    isSelected={seleccionados.includes(n._id)} 
                    onToggle={toggleNadador} 
                  />
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CrearEntrenamiento;