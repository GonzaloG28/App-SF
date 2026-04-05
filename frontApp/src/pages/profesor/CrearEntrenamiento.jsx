import { useState, useMemo, useCallback, memo } from "react"
import { useNavigate }                           from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api                                       from "../../api/axios"
import { enviarEntrenamiento }                   from "../../api/entrenamientos.api"
import { calcularCategoria }                     from "../../utils/categoria"
import {
  Send, FileText, Type, Link as LinkIcon,
  Users, Search, CheckCircle2,
  Circle, Loader2, ChevronRight, UploadCloud,
  X, Info, Trash2
} from "lucide-react"

const NadadorRow = memo(({ n, isSelected, onToggle }) => (
  <div
    onClick={() => onToggle(n._id)}
    className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
      isSelected
        ? "border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
        : "border-white/5 bg-white/5 hover:bg-white/10"
    }`}
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="shrink-0">
        {isSelected
          ? <CheckCircle2 size={18} className="text-green-500" />
          : <Circle size={18} className="text-slate-600 group-hover:text-slate-400" />
        }
      </div>
      <div className="min-w-0">
        <p className={`text-[11px] md:text-xs font-black uppercase truncate ${isSelected ? "text-white" : "text-slate-400"}`}>
          {n.user?.nombre} {n.apellido}
        </p>
        <p className={`text-[11px] font-bold uppercase tracking-tighter ${isSelected ? "text-green-500/70" : "text-slate-600"}`}>
          {n._categoria || "S/N"}
        </p>
      </div>
    </div>
    <ChevronRight size={14} className={`shrink-0 ${isSelected ? "text-green-500" : "text-white/5"}`} />
  </div>
))

const CrearEntrenamiento = () => {
  const queryClient = useQueryClient()
  // FIX: navigate declarado correctamente
  const navigate    = useNavigate()

  const [tipoCarga, setTipoCarga]   = useState("texto")
  const [form, setForm]             = useState({ titulo: "", contenido: "", notas: "" })
  const [archivo, setArchivo]       = useState(null)
  const [buscar, setBuscar]         = useState("")
  const [filtroCat, setFiltroCat]   = useState("todos")
  const [filtroNivel, setFiltroNivel] = useState("todos")
  const [seleccionados, setSeleccionados] = useState([])
  const [notificacion, setNotificacion]   = useState({ visible: false, mensaje: "", tipo: "success" })

  const { data: nadadores = [], isLoading } = useQuery({
    queryKey: ["nadadores-convocatoria"],
    queryFn:  () => api.get("/nadadores").then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

  // FIX: calcular categoría en frontend porque lean() no devuelve virtuals
  const nadoresConCategoria = useMemo(() =>
    nadadores.map(n => ({
      ...n,
      _categoria: n.categoria || calcularCategoria(n.fechaNacimiento)
    })),
    [nadadores]
  )

  const categoriasUnicas = useMemo(() => {
    const cats = nadoresConCategoria.map(n => n._categoria).filter(Boolean)
    return ["todos", ...new Set(cats)]
  }, [nadoresConCategoria])

  const filtrados = useMemo(() =>
    nadoresConCategoria.filter(n => {
      const coincideBusqueda = !buscar ||
        `${n.user?.nombre} ${n.apellido}`.toLowerCase().includes(buscar.toLowerCase())
      const coincideNivel = filtroNivel === "todos" || n.rama === filtroNivel
      const coincideCat   = filtroCat   === "todos" || n._categoria === filtroCat
      return coincideBusqueda && coincideNivel && coincideCat
    }),
    [nadoresConCategoria, buscar, filtroNivel, filtroCat]
  )

  const toggleNadador = useCallback((id) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }, [])

  const seleccionarTodos = () => {
    const ids  = filtrados.map(n => n._id)
    const todos = ids.every(id => seleccionados.includes(id))
    setSeleccionados(prev =>
      todos ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    )
  }

  const mostrarToast = (mensaje, tipo = "success") => {
    setNotificacion({ visible: true, mensaje, tipo })
    setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 4000)
  }

  const mutation = useMutation({
    mutationFn: enviarEntrenamiento,
    onSuccess: () => {
      mostrarToast("¡Rutina publicada!", "success")
      setForm({ titulo: "", contenido: "", notas: "" })
      setArchivo(null)
      setSeleccionados([])
      queryClient.invalidateQueries(["reporteEntrenamientos"])
      queryClient.invalidateQueries(["entrenamientos-dashboard"])
    },
    onError: () => mostrarToast("Error al subir", "error")
  })

  const handleEnviar = () => {
    if (!form.titulo.trim() || seleccionados.length === 0) return
    const formData = new FormData()
    formData.append("titulo",       form.titulo)
    formData.append("notas",        form.notas)
    formData.append("tipo",         tipoCarga)
    formData.append("destinatarios", JSON.stringify(seleccionados))
    if (tipoCarga === "archivo" && archivo) formData.append("archivo", archivo)
    else formData.append("contenido", form.contenido)
    mutation.mutate(formData)
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto p-3 md:p-6 lg:p-10 space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 bg-white">

      {/* TOAST */}
      {notificacion.visible && (
        <div className={`fixed bottom-6 md:bottom-10 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-fit z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-5 ${
          notificacion.tipo === "success"
            ? "bg-slate-900 border-green-500/50 text-white"
            : "bg-slate-900 border-orange-500/50 text-white"
        }`}>
          <div className={notificacion.tipo === "success" ? "bg-green-600 p-1.5 rounded-lg shrink-0" : "bg-orange-600 p-1.5 rounded-lg shrink-0"}>
            {notificacion.tipo === "success" ? <CheckCircle2 size={16} /> : <X size={16} />}
          </div>
          <p className="font-black uppercase text-[11px] tracking-widest">{notificacion.mensaje}</p>
        </div>
      )}

      {/* HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="w-full lg:w-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-[11px] font-black px-2 py-0.5 rounded uppercase tracking-tighter italic">ÑSF</span>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">panel creación entrenamientos</p>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 italic tracking-tighter uppercase leading-none break-words">
            Crear <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">Entrenamiento</span>
          </h1>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={() => { setForm({ titulo: "", contenido: "", notas: "" }); setSeleccionados([]) }}
            className="p-4 md:p-5 bg-orange-50 text-orange-600 rounded-2xl md:rounded-3xl hover:bg-orange-600 hover:text-white transition-all active:scale-95 shrink-0"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={handleEnviar}
            disabled={mutation.isPending || !form.titulo || seleccionados.length === 0}
            className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-slate-900 text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl disabled:opacity-20 active:scale-95"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            <span className="hidden sm:inline">Publicar Rutina</span>
            <span className="sm:hidden">Publicar</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

        {/* BLOQUE DE CARGA */}
        <div className="lg:col-span-7 order-2 lg:order-1 space-y-6">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 p-5 md:p-8 lg:p-12 shadow-xl shadow-slate-200/40">

            {/* SELECTOR DE MODO */}
            <div className="grid grid-cols-3 gap-1 md:gap-2 p-1 bg-slate-50 rounded-2xl md:rounded-[2rem] mb-6 md:mb-10 border border-slate-100">
              {[
                { id: "texto",   icon: Type,      label: "Manual"  },
                { id: "archivo", icon: FileText,   label: "Digital" },
                { id: "link",    icon: LinkIcon,   label: "Enlace"  }
              ].map(t => (
                <button key={t.id} onClick={() => setTipoCarga(t.id)}
                  className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[11px] uppercase tracking-tighter transition-all ${
                    tipoCarga === t.id
                      ? "bg-white text-blue-600 shadow-md border border-blue-50"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <t.icon size={16} /> <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4 md:space-y-6">
              <input
                type="text"
                placeholder="NOMBRE DE LA SESIÓN..."
                className="w-full bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl p-4 md:p-6 font-black text-slate-800 text-base md:text-xl outline-none focus:border-blue-100 focus:bg-white transition-all shadow-inner uppercase tracking-tighter"
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
              />

              <div className="min-h-[250px] md:min-h-[300px]">
                {tipoCarga === "texto" && (
                  <textarea
                    placeholder="Escribe la rutina aquí..."
                    className="w-full bg-slate-50 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 font-bold text-slate-600 h-64 md:h-80 outline-none focus:bg-white border-2 border-transparent focus:border-blue-50 transition-all leading-relaxed shadow-inner text-sm md:text-base"
                    value={form.contenido}
                    onChange={e => setForm({ ...form, contenido: e.target.value })}
                  />
                )}
                {tipoCarga === "link" && (
                  <div className="bg-blue-50/30 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 border-dashed border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-4 font-black text-[11px] uppercase">
                      <LinkIcon size={14} /> Link del entrenamiento
                    </div>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="w-full bg-white rounded-xl md:rounded-2xl p-4 md:p-5 font-bold text-blue-600 outline-none shadow-sm border border-blue-100 text-sm"
                      value={form.contenido}
                      onChange={e => setForm({ ...form, contenido: e.target.value })}
                    />
                  </div>
                )}
                {tipoCarga === "archivo" && (
                  <div className={`relative group border-4 border-dashed rounded-2xl md:rounded-[2.5rem] p-8 md:p-12 text-center transition-all ${archivo ? "border-green-200 bg-green-50/20" : "border-slate-100 hover:border-blue-200"}`}>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setArchivo(e.target.files[0])} />
                    <UploadCloud size={32} className={`mx-auto mb-3 md:mb-4 ${archivo ? "text-green-500" : "text-blue-500"}`} />
                    <p className="font-black text-[11px] md:text-xs uppercase text-slate-800 truncate px-2">
                      {archivo ? archivo.name : "Subir Archivo"}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 md:pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={14} className="text-orange-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Observaciones</span>
                </div>
                <textarea
                  placeholder="Consejos técnicos..."
                  className="w-full bg-transparent p-2 text-xs md:text-[13px] font-bold text-slate-500 h-20 md:h-24 outline-none resize-none border-l-2 border-orange-200 pl-4 focus:border-orange-500 transition-colors"
                  value={form.notas}
                  onChange={e => setForm({ ...form, notas: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE DESTINATARIOS */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <aside className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 lg:p-10 shadow-2xl flex flex-col max-h-[500px] lg:max-h-[800px] lg:sticky lg:top-8 overflow-hidden border-t-4 border-blue-600">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shrink-0">
                  <Users size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-black uppercase text-xs md:text-sm tracking-tighter italic">Atletas</h3>
                  <p className="text-green-500 font-black text-[11px] uppercase truncate">{seleccionados.length} Seleccionados</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  className="w-full pl-10 pr-4 py-3 md:py-4 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl text-white text-[11px] font-bold outline-none focus:bg-white/10 transition-all uppercase"
                  value={buscar}
                  onChange={e => setBuscar(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filtroNivel}
                  onChange={e => setFiltroNivel(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase p-2 outline-none"
                >
                  <option value="todos" className="text-slate-900">Todos</option>
                  <option value="formativo"   className="text-slate-900">Formativo</option>
                  <option value="competitivo" className="text-slate-900">Competitivo</option>
                </select>

                <select
                  value={filtroCat}
                  onChange={e => setFiltroCat(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase p-2 outline-none"
                >
                  {categoriasUnicas.map(cat => (
                    <option key={cat} value={cat} className="text-slate-900">
                      {cat === "todos" ? "Categoría" : cat}
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" onClick={seleccionarTodos}
                className="w-full py-2.5 border-2 border-dashed border-blue-500/30 text-blue-400 text-[10px] font-black uppercase rounded-xl hover:bg-blue-600 hover:text-white transition-all"
              >
                {filtrados.every(n => seleccionados.includes(n._id)) ? "Quitar todos" : "Seleccionar todos"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
              ) : filtrados.map(n => (
                <NadadorRow key={n._id} n={n} isSelected={seleccionados.includes(n._id)} onToggle={toggleNadador} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CrearEntrenamiento
