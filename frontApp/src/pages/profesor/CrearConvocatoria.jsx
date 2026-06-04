import { useState, useMemo, useCallback, memo } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "../../api/axios"
import DatePicker, { registerLocale } from "react-datepicker"
import es from "date-fns/locale/es"
import "react-datepicker/dist/react-datepicker.css"
import { calcularCategoria } from "../../utils/categoria"
import {
  Calendar, MapPin, Users, Search, CheckCircle2,
  Circle, ArrowLeft, Loader2, Plus, X, AlertCircle,
  ChevronRight, Trash2, Send, Info
} from "lucide-react"

registerLocale("es", es)

// Componente de Notificación (Toast)
const Toast = ({ mensaje, tipo, onClose }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
    tipo === "success" 
      ? "bg-slate-900 border-green-500/50 text-white" 
      : "bg-red-600 border-red-400 text-white"
  }`}>
    <div className={`${tipo === "success" ? "bg-green-500" : "bg-white/20"} p-1.5 rounded-full`}>
      {tipo === "success" ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
    </div>
    <div className="flex flex-col">
      <p className="font-black uppercase text-[10px] tracking-widest leading-none">
        {tipo === "success" ? "Operación Exitosa" : "Error de Sistema"}
      </p>
      <p className="font-bold text-xs mt-1 opacity-90">{mensaje}</p>
    </div>
    <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
      <X size={14}/>
    </button>
  </div>
)

const NadadorRow = memo(({ n, isSelected, onToggle }) => (
  <div
    onClick={() => onToggle(n._id)}
    className={`group flex items-center justify-between p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
      isSelected
        ? "border-blue-500 bg-blue-500/10 shadow-sm"
        : "border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200"
    }`}
  >
    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
      <div className="shrink-0">
        {isSelected
          ? <CheckCircle2 size={18} className="text-blue-500" />
          : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />
        }
      </div>
      <div className="min-w-0">
        <p className={`text-xs sm:text-sm font-black uppercase truncate ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
          {n.user?.nombre} {n.apellido}
        </p>
        <div className="flex gap-2 mt-0.5 items-center">
          <p className={`text-[9px] sm:text-[10px] font-bold uppercase ${isSelected ? "text-blue-600" : "text-slate-400"}`}>
            {n._categoria || "S/N"}
          </p>
          <span className="text-slate-300 text-[10px]">•</span>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 truncate">{n.rama || "General"}</p>
        </div>
      </div>
    </div>
    <ChevronRight size={14} className={`shrink-0 ${isSelected ? "text-blue-500" : "text-slate-200"}`} />
  </div>
))

export const CrearConvocatoria = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // ESTADOS UNIFICADOS
  const [form, setForm] = useState({ nombre: "", descripcion: "", lugar: "", fechaInicio: null, fechaFin: null })
  const [seleccionados, setSeleccionados] = useState([])
  const [buscar, setBuscar] = useState("")
  const [filtroNivel, setFiltroNivel] = useState("todos")
  const [filtroCat, setFiltroCat] = useState("todos")
  const [modalOpen, setModalOpen] = useState(false)
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: "", tipo: "success" })

  const { data: nadadores = [], isLoading } = useQuery({
    queryKey: ["nadadores-convocatoria"],
    queryFn: () => api.get("/nadadores").then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

  const nadoresConCat = useMemo(() =>
    nadadores.map(n => ({
      ...n,
      _categoria: n.categoria || calcularCategoria(n.fechaNacimiento)
    })), [nadadores]
  )

  const categoriasUnicas = useMemo(() => {
    const cats = nadoresConCat.map(n => n._categoria).filter(Boolean)
    return ["todos", ...new Set(cats)]
  }, [nadoresConCat])

  const filtrados = useMemo(() =>
    nadoresConCat.filter(n => {
      const coincideBusqueda = !buscar || `${n.user?.nombre} ${n.apellido}`.toLowerCase().includes(buscar.toLowerCase())
      const coincideNivel = filtroNivel === "todos" || n.rama === filtroNivel
      const coincideCat = filtroCat === "todos" || n._categoria === filtroCat
      return coincideBusqueda && coincideNivel && coincideCat
    }), [nadoresConCat, buscar, filtroNivel, filtroCat]
  )

  const toggleNadador = useCallback((id) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }, [])

  const seleccionarTodos = () => {
    const ids = filtrados.map(n => n._id)
    const todos = ids.every(id => seleccionados.includes(id))
    setSeleccionados(prev => todos ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])])
  }

  const mutation = useMutation({
    mutationFn: (data) => api.post("/convocatorias", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["convocatorias"])
      setNotificacion({ visible: true, mensaje: "¡Convocatoria publicada con éxito!", tipo: "success" })
      setTimeout(() => navigate(-1), 2000)
    },
    onError: (error) => {
      setNotificacion({ 
        visible: true, 
        mensaje: error.response?.data?.message || "Error al crear la convocatoria.", 
        tipo: "error" 
      })
    }
  })

  const handleSubmit = () => {
    if (!form.nombre.trim() || !form.lugar.trim() || !form.fechaInicio) {
        setNotificacion({ visible: true, mensaje: "Completa los campos obligatorios y selecciona atletas.", tipo: "error" });
        return;
    }

    mutation.mutate({
      ...form,
      fechaInicio: form.fechaInicio.toISOString(),
      fechaFin: form.fechaFin ? form.fechaFin.toISOString() : form.fechaInicio.toISOString(),
      nadadores: seleccionados
    })
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4 md:p-10 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 bg-white overflow-x-hidden">
      
      {notificacion.visible && (
        <Toast 
          mensaje={notificacion.mensaje} 
          tipo={notificacion.tipo} 
          onClose={() => setNotificacion(prev => ({ ...prev, visible: false }))} 
        />
      )}

      {/* HEADER */}
      <header className="space-y-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all mb-4">
          <ArrowLeft size={14} /> Volver
        </button>
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase italic">PRO</span>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gestión de Eventos</p>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-slate-900 italic tracking-tighter uppercase leading-[0.9] break-words">
          Nueva <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">Convocatoria</span>
        </h1>
      </header>

      {/* SECCIÓN DESTINATARIOS */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-5 sm:p-6 bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-800 shadow-xl">
        <div className="relative">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0">
            <Users size={24} />
          </div>
          {seleccionados.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-slate-900 animate-bounce">
              {seleccionados.length}
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left min-w-0">
          <h4 className="text-white font-black uppercase text-xs sm:text-sm italic">Nadadores Citados</h4>
          <p className={`text-[10px] font-bold uppercase tracking-tighter ${seleccionados.length > 0 ? "text-green-400" : "text-slate-500"}`}>
            {seleccionados.length === 0 ? "Sin selección" : `${seleccionados.length} Atletas marcados`}
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase hover:bg-green-500 transition-all active:scale-95">
          <Plus size={14} /> Seleccionar
        </button>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 p-5 sm:p-10 shadow-2xl shadow-slate-200/50 space-y-8">
        
        {/* Nombre y Lugar */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="NOMBRE DEL TORNEO O EVENTO..."
            className="w-full bg-slate-50 p-5 sm:p-6 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl outline-none focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all uppercase tracking-tighter shadow-inner"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
          
          <div className="relative">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="UBICACIÓN / PISCINA..."
              className="w-full bg-slate-50 pl-14 pr-6 py-4 rounded-2xl font-bold text-sm outline-none focus:bg-white border-2 border-transparent focus:border-blue-50 transition-all uppercase shadow-inner"
              value={form.lugar}
              onChange={e => setForm({ ...form, lugar: e.target.value })}
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Fecha Inicio</label>
            <DatePicker
              selected={form.fechaInicio}
              onChange={d => setForm({...form, fechaInicio: d})}
              locale="es" dateFormat="dd/MM/yyyy"
              placeholderText="SELECCIONAR FECHA"
              className="w-full bg-slate-50 p-4 rounded-xl font-bold text-sm border-2 border-transparent focus:border-blue-50 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Fecha Fin (Opcional)</label>
            <DatePicker
              selected={form.fechaFin}
              onChange={d => setForm({...form, fechaFin: d})}
              locale="es" dateFormat="dd/MM/yyyy"
              placeholderText="SELECCIONAR FECHA"
              minDate={form.fechaInicio}
              className="w-full bg-slate-50 p-4 rounded-xl font-bold text-sm border-2 border-transparent focus:border-blue-50 outline-none"
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Detalles adicionales</label>
          <textarea
            placeholder="Información sobre salidas, requisitos, etc..."
            className="w-full bg-slate-50 rounded-[1.5rem] p-5 sm:p-6 font-bold text-slate-600 h-32 outline-none focus:bg-white border-2 border-transparent focus:border-blue-50 transition-all leading-relaxed shadow-inner text-sm"
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            disabled={mutation.isPending}
            onClick={() => { setForm({nombre:"",lugar:"",descripcion:"",fechaInicio:null,fechaFin:null}); setSeleccionados([]) }} 
            className="p-4 sm:p-5 bg-slate-100 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending || !form.nombre}
            className="flex-1 flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl disabled:opacity-20"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Send size={16} />}
            <span>{mutation.isPending ? "Publicando..." : `Publicar Convocatoria (${seleccionados.length})`}</span>
          </button>
        </div>
      </div>

      {/* MODAL SELECCIÓN ATLETAS */}
      {modalOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="min-w-0">
                <h3 className="text-base sm:text-xl font-black text-slate-900 uppercase italic truncate">Seleccionar Atletas</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{seleccionados.length} Seleccionados</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="BUSCAR POR NOMBRE..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl text-xs font-bold outline-none focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all uppercase"
                  value={buscar}
                  onChange={e => setBuscar(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)} className="bg-slate-100 rounded-xl p-2.5 text-[9px] font-black uppercase outline-none border-r-8 border-transparent">
                  <option value="todos">Todas las Ramas</option>
                  <option value="formativo">Formativo</option>
                  <option value="competitivo">Competitivo</option>
                </select>
                <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)} className="bg-slate-100 rounded-xl p-2.5 text-[9px] font-black uppercase outline-none border-r-8 border-transparent">
                  {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat === "todos" ? "Todas las Edades" : cat}</option>)}
                </select>
              </div>
              <button onClick={seleccionarTodos} className="w-full py-2 border-2 border-dashed border-slate-200 text-slate-400 text-[9px] font-black uppercase rounded-lg hover:text-blue-500 hover:border-blue-400 transition-all">
                {filtrados.every(n => seleccionados.includes(n._id)) ? "Deseleccionar todos" : "Marcar todos los filtrados"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Cargando base de datos...</p>
                </div>
              ) : filtrados.length > 0 ? (
                filtrados.map(n => (
                  <NadadorRow key={n._id} n={n} isSelected={seleccionados.includes(n._id)} onToggle={toggleNadador} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-xs font-bold text-slate-400 uppercase">No se encontraron nadadores</p>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 shrink-0">
              <button onClick={() => setModalOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
                Confirmar Selección ({seleccionados.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}