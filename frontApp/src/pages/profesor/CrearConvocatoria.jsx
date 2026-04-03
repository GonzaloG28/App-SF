import { useState, useMemo, useCallback } from "react"
import { useNavigate }       from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api                   from "../../api/axios"
import DatePicker, { registerLocale } from "react-datepicker"
import es                    from "date-fns/locale/es"
import "react-datepicker/dist/react-datepicker.css"
import {
  Calendar, MapPin, Users, Search, CheckCircle2,
  Circle, ArrowLeft, Loader2, Plus, ChevronRight, Zap
} from "lucide-react"

registerLocale("es", es)

const NadadorRow = ({ n, isSelected, onToggle }) => (
  <div
    onClick={() => onToggle(n._id)}
    className={`group flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
      isSelected ? "border-blue-200 bg-blue-50/50" : "border-slate-100 hover:border-slate-200 bg-white"
    }`}
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="shrink-0">
        {isSelected
          ? <CheckCircle2 size={18} className="text-blue-600" />
          : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />
        }
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-black uppercase truncate ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
          {n.user?.nombre} {n.apellido}
        </p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{n.categoria}</p>
      </div>
    </div>
    {/* Badge pago */}
    <span className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
      n.pagoAlDia ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"
    }`}>
      {n.pagoAlDia ? "Al día" : "Pendiente"}
    </span>
  </div>
)

export const CrearConvocatoria = () => {
  const navigate      = useNavigate()
  const queryClient   = useQueryClient()

  const [form, setForm] = useState({
    nombre: "", descripcion: "", lugar: "",
    fechaInicio: null, fechaFin: null
  })
  const [seleccionados, setSeleccionados] = useState([])
  const [buscar,        setBuscar]        = useState("")
  const [errors,        setErrors]        = useState({})
  const [filtroNivel, setFiltroNivel] = useState("todos")
  const [filtroCat, setFiltroCat] = useState("todos")



  const { data: nadadores = [], isLoading } = useQuery({
    queryKey: ["nadadores-convocatoria"],
    queryFn:  () => api.get("/nadadores").then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

  const categoriasUnicas = useMemo(() => {
  const cats = nadadores.map(n => n.categoria).filter(Boolean)
  return ["todos", ...new Set(cats)]
}, [nadadores])

  const filtrados = useMemo(() => {
  return nadadores.filter(n => {
    const coincideBusqueda = !buscar || 
      `${n.user?.nombre} ${n.apellido}`.toLowerCase().includes(buscar.toLowerCase())
    
    // Asumiendo que el modelo Nadador tiene un campo 'nivel' o 'tipo'
    const coincideNivel = filtroNivel === "todos" || n.rama === filtroNivel
    const coincideCat = filtroCat === "todos" || n.categoria === filtroCat

    return coincideBusqueda && coincideNivel && coincideCat
  })
}, [nadadores, buscar, filtroNivel, filtroCat])

  const toggleNadador = useCallback((id) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
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
    // Usar un alert o un toast antes de navegar
    alert("¡Convocatoria creada con éxito!") 
    navigate("/convocatorias") // O a la lista
  },
  onError: (error) => {
    alert("Error al crear: " + (error.response?.data?.message || "Error del servidor"))
  }
})

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.nombre.trim())  errs.nombre = "Requerido"
    if (!form.lugar.trim())   errs.lugar  = "Requerido"
    if (!form.fechaInicio)    errs.fechaInicio = "Requerido"
    if (!form.fechaFin)       errs.fechaFin    = "Requerido"
    if (form.fechaFin && form.fechaInicio && form.fechaFin < form.fechaInicio) {
      errs.fechaFin = "Debe ser posterior a inicio"
    }
    if (seleccionados.length === 0) errs.nadadores = "Selecciona al menos un nadador"

    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    mutation.mutate({
      ...form,
      fechaInicio: form.fechaInicio.toISOString(),
      fechaFin:    form.fechaFin.toISOString(),
      nadadores:   seleccionados
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-8 animate-fade-in p-4">

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-[11px] uppercase tracking-widest transition-all">
        <ArrowLeft size={14} /> Volver
      </button>

      {/* Header */}
      <div className="bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl flex items-center justify-center shadow-xl shrink-0">
            <Calendar size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
              Nueva <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent not-italic">Convocatoria</span>
            </h1>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-1">Selecciona nadadores y fechas</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Datos del evento */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 md:p-7 border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Datos del Evento</h3>

            {/* Nombre */}
            <div className="space-y-1.5">
              <div className="flex justify-between px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nombre</label>
                {errors.nombre && <span className="text-[10px] text-orange-500 font-black uppercase">{errors.nombre}</span>}
              </div>
              <input
                value={form.nombre}
                onChange={e => { setForm({...form, nombre: e.target.value}); setErrors({...errors, nombre: null}) }}
                placeholder="Ej: Campeonato Regional 2026"
                className={`w-full px-4 py-3.5 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all ${errors.nombre ? "border-orange-300" : "border-slate-100"}`}
              />
            </div>

            {/* Lugar */}
            <div className="space-y-1.5">
              <div className="flex justify-between px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lugar</label>
                {errors.lugar && <span className="text-[10px] text-orange-500 font-black uppercase">{errors.lugar}</span>}
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  value={form.lugar}
                  onChange={e => { setForm({...form, lugar: e.target.value}); setErrors({...errors, lugar: null}) }}
                  placeholder="Ciudad, recinto"
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all ${errors.lugar ? "border-orange-300" : "border-slate-100"}`}
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block">
                  Inicio {errors.fechaInicio && <span className="text-orange-500">*</span>}
                </label>
                <DatePicker
                  selected={form.fechaInicio}
                  onChange={d => { setForm({...form, fechaInicio: d}); setErrors({...errors, fechaInicio: null}) }}
                  locale="es" dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  minDate={new Date()}
                  wrapperClassName="w-full"
                  className={`w-full px-3 py-3.5 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all ${errors.fechaInicio ? "border-orange-300" : "border-slate-100"}`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block">
                  Fin {errors.fechaFin && <span className="text-orange-500">*</span>}
                </label>
                <DatePicker
                  selected={form.fechaFin}
                  onChange={d => { setForm({...form, fechaFin: d}); setErrors({...errors, fechaFin: null}) }}
                  locale="es" dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  minDate={form.fechaInicio || new Date()}
                  wrapperClassName="w-full"
                  className={`w-full px-3 py-3.5 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all ${errors.fechaFin ? "border-orange-300" : "border-slate-100"}`}
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block">Descripción (opcional)</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                placeholder="Detalles adicionales del evento..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-blue-600 hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.25em] transition-all shadow-xl shadow-blue-200 disabled:opacity-50 active:scale-[0.98]"
          >
            {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Publicar Convocatoria
            {seleccionados.length > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full">{seleccionados.length}</span>}
          </button>
          {errors.nadadores && <p className="text-center text-orange-500 text-[11px] font-black uppercase">{errors.nadadores}</p>}
        </div>

        {/* Selector de nadadores */}
        <div className="bg-slate-900 rounded-2xl p-5 md:p-7 flex flex-col max-h-[600px] border-t-4 border-blue-600">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Users size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-sm tracking-tight italic">Nadadores</h3>
                <p className="text-blue-400 font-black text-[10px] uppercase">{seleccionados.length} seleccionados</p>
              </div>
            </div>
          </div>

          <div className="relative mb-3 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              placeholder="Buscar nadador..."
              className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] font-bold outline-none focus:bg-white/10 transition-all placeholder:text-slate-500 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <select 
              value={filtroNivel} 
              onChange={e => setFiltroNivel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase p-2 outline-none"
            >
              <option value="todos" className="text-slate-900">Todos los Niveles</option>
              <option value="formativo" className="text-slate-900">Formativo</option>
              <option value="competitivo" className="text-slate-900">Competitivo</option>
            </select>

            <select 
              value={filtroCat} 
              onChange={e => setFiltroCat(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase p-2 outline-none"
            >
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat} className="text-slate-900">
                  {cat === "todos" ? "Todas las Categorías" : cat}
                </option>
              ))}
            </select>
          </div>

          <button type="button" onClick={seleccionarTodos}
            className="mb-3 shrink-0 w-full py-2.5 border-2 border-dashed border-blue-500/30 text-blue-400 text-[10px] font-black uppercase rounded-xl hover:bg-blue-600 hover:text-white transition-all"
          >
            {filtrados.every(n => seleccionados.includes(n._id)) ? "Quitar todos" : "Seleccionar todos"}
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
            ) : filtrados.map(n => (
              <NadadorRow key={n._id} n={n} isSelected={seleccionados.includes(n._id)} onToggle={toggleNadador} />
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}