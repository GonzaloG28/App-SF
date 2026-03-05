import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enviarEntrenamiento } from "../../api/entrenamientos.api"; 
import api from "../../api/axios";
import { 
  Send, FileText, Type, Link as LinkIcon, 
  Users, Search, CheckCircle2, 
  Circle, Loader2, ChevronRight, Download 
} from "lucide-react";

const CrearEntrenamiento = () => {
  const queryClient = useQueryClient();
  
  // ESTADOS DEL FORMULARIO
  const [tipoCarga, setTipoCarga] = useState("texto");
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [notas, setNotas] = useState("");
  const [archivo, setArchivo] = useState(null);
  
  // ESTADOS DE SELECCIÓN
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [seleccionados, setSeleccionados] = useState([]);

  // 1. Obtener lista de nadadores
  const { data: nadadores, isLoading } = useQuery({
    queryKey: ["nadadores-entrenamiento"],
    queryFn: async () => {
      const res = await api.get("/nadadores");
      return res.data;
    }
  });

  // 2. Lógica de filtrado
  const nadadoresFiltrados = nadadores?.filter(n => {
    const cumpleNombre = n.user.nombre.toLowerCase().includes(search.toLowerCase());
    const cumpleCat = categoriaFiltro === "Todas" || n.categoria === categoriaFiltro;
    return cumpleNombre && cumpleCat;
  }) || [];

  const toggleNadador = (id) => {
    setSeleccionados(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    const idsFiltrados = nadadoresFiltrados.map(n => n._id);
    setSeleccionados(idsFiltrados);
  };

  // 3. Mutación para enviar (Usando nuestra función de API)
  const mutation = useMutation({
    mutationFn: enviarEntrenamiento, // <-- Usamos la función del archivo .api.js
    onSuccess: () => {
      alert("¡Entrenamiento distribuido con éxito!");
      // Limpiamos todo
      setTitulo("");
      setContenido("");
      setNotas("");
      setArchivo(null);
      setSeleccionados([]);
      queryClient.invalidateQueries(["misEntrenamientos"]); 
    },
    onError: (error) => {
      alert(error.message || "Error al enviar el entrenamiento");
    }
  });

  const handleEnviar = () => {
    if (!titulo) return alert("El título es obligatorio");
    if (seleccionados.length === 0) return alert("Selecciona al menos un nadador");
    
    // IMPORTANTE: Construcción del FormData
    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("tipo", tipoCarga);
    formData.append("contenido", contenido);
    formData.append("notas", notas);
    
    // Enviamos el array como String para que el backend lo parsee
    formData.append("destinatarios", JSON.stringify(seleccionados));

    if (tipoCarga === "archivo" && archivo) {
      formData.append("archivo", archivo);
    }

    mutation.mutate(formData);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">
            Training <span className="text-blue-600">Builder</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Crea y distribuye rutinas técnicas</p>
        </div>
        
        <button 
          onClick={handleEnviar}
          disabled={mutation.isPending}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          Publicar Entrenamiento
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
            <div className="flex gap-4 p-1 bg-slate-50 rounded-2xl">
              {[
                { id: "texto", icon: Type, label: "Escrito" },
                { id: "archivo", icon: FileText, label: "Adjunto" },
                { id: "link", icon: LinkIcon, label: "Enlace" }
              ].map(tipo => (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setTipoCarga(tipo.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${tipoCarga === tipo.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <tipo.icon size={16} /> {tipo.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Título del entrenamiento (ej: Resistencia Aeróbica)" 
                className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 transition-all"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />

              {tipoCarga === "texto" && (
                <textarea 
                  placeholder="Escribe la rutina aquí..."
                  className="w-full bg-slate-50 border-none rounded-[2rem] p-6 font-medium text-slate-600 h-64 focus:ring-2 focus:ring-blue-100"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                />
              )}

              {tipoCarga === "link" && (
                <input 
                  type="url" 
                  placeholder="https://youtube.com/video-tecnica..." 
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-blue-600 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                />
              )}

              {tipoCarga === "archivo" && (
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center hover:bg-blue-50/30 transition-colors relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => setArchivo(e.target.files[0])}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Download size={24} />
                    </div>
                    <p className="font-black text-xs text-slate-500 uppercase">
                        {archivo ? archivo.name : "Subir PDF o Imagen"}
                    </p>
                    {archivo && (
                        <button 
                            onClick={(e) => { e.preventDefault(); setArchivo(null); }}
                            className="text-[10px] font-black text-red-400 uppercase hover:text-red-600"
                        >
                            Quitar archivo
                        </button>
                    )}
                  </div>
                </div>
              )}

              <textarea 
                placeholder="Notas adicionales para el atleta (opcional)"
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-500"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: SELECCIÓN */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col h-[700px]">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-blue-600" size={20} />
              <h3 className="font-black italic uppercase text-slate-800 text-sm">Destinatarios</h3>
              <span className="ml-auto bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">
                {seleccionados.length} SELECCIONADOS
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar nadador..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {["Todas", "Infantil", "Juvenil", "Mayores"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaFiltro(cat)}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-all ${categoriaFiltro === cat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              <button 
                onClick={seleccionarTodos}
                className="w-full py-2 text-[9px] font-black text-blue-600 uppercase hover:bg-blue-50 rounded-lg mb-2"
              >
                Seleccionar todos los filtrados
              </button>
              
              {isLoading ? <Loader2 className="animate-spin mx-auto mt-10 text-slate-200" /> : 
                nadadoresFiltrados.map(n => (
                <div 
                  key={n._id}
                  onClick={() => toggleNadador(n._id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${seleccionados.includes(n._id) ? "border-blue-200 bg-blue-50/50" : "border-slate-50 hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    {seleccionados.includes(n._id) ? <CheckCircle2 size={18} className="text-blue-600" /> : <Circle size={18} className="text-slate-200" />}
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{n.user.nombre}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{n.categoria || "Sin categoría"}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CrearEntrenamiento;