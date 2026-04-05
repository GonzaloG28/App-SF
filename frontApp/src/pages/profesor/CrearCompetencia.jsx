import { useState, useCallback, memo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createCompetencia } from "../../api/competencias.api"
import DatePicker, { registerLocale } from "react-datepicker"
import es from "date-fns/locale/es"
import "react-datepicker/dist/react-datepicker.css"
import {
  Trophy, Calendar, Waves, ArrowLeft,
  Plus, Loader2, AlertCircle, Zap, Activity
} from "lucide-react"

registerLocale("es", es)

const FormHeader = memo(({ onBack }) => (
  <div className="bg-slate-900 p-6 md:p-10 text-white relative overflow-hidden">
    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -ml-16 -mb-16 pointer-events-none" />

    <button
      onClick={onBack}
      className="mb-6 flex items-center gap-2 text-slate-400 hover:text-blue-400 font-black text-[11px] uppercase tracking-[0.2em] transition-all group"
    >
      <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
      Regresar
    </button>

    <div className="flex items-center gap-4 relative z-10">
      <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
        <Trophy size={24} className="text-white" />
      </div>
      <div>
        <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic leading-none uppercase">
          Nueva <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent not-italic">Competencia</span>
        </h2>
        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
          <Activity size={11} className="text-emerald-500" /> Registro de Alto Rendimiento
        </p>
      </div>
    </div>
  </div>
))

const InfoFooter = memo(() => (
  <div className="p-5 md:p-8 bg-slate-50 border-t border-slate-100 flex items-start gap-4">
    <div className="bg-white p-2.5 rounded-xl text-orange-500 shadow-sm border border-slate-100 shrink-0 mt-0.5">
      <AlertCircle size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
        Próximo paso: <span className="text-blue-600">Configuración de Marcas</span>
      </p>
      <p className="text-[11px] text-slate-500 mt-1 leading-snug font-medium">
        Al finalizar, el sistema te habilitará la carga de tiempos, estilos y parciales para este evento.
      </p>
    </div>
  </div>
))

const CrearCompetencia = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({ nombre: "", fecha: null, piscina: 25 })
  const [errors, setErrors] = useState({})

  const mutation = useMutation({
    mutationFn: (data) => createCompetencia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencias", id] })
      navigate(`/profesor/nadador/${id}/competencias`)
    },
  })

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => (prev[name] ? { ...prev, [name]: null } : prev))
  }, [])

  const handleDateChange = useCallback((date) => {
    setForm(prev => ({ ...prev, fecha: date }))
    setErrors(prev => (prev.fecha ? { ...prev, fecha: null } : prev))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.nombre.trim()) newErrors.nombre = "Nombre requerido"
    if (!form.fecha) newErrors.fecha = "Fecha requerida"
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    mutation.mutate({ ...form, fecha: form.fecha.toISOString(), piscina: Number(form.piscina) })
  }

  return (
    // FIX MOBILE: sin min-h-[95vh] flex items-center que cortaba en mobile
    // Ahora fluye naturalmente con padding bottom para el botón
    <div className="w-full max-w-2xl mx-auto animate-fade-in pb-8">
      <div className="bg-white rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">

        <FormHeader onBack={() => navigate(-1)} />

        <form onSubmit={handleSubmit} className="p-5 md:p-10 space-y-6 md:space-y-8">

          {/* NOMBRE */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Evento o Torneo</label>
              {errors.nombre && <span className="text-[11px] text-orange-500 font-black uppercase italic">{errors.nombre}</span>}
            </div>
            <div className="relative group">
              <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="text"
                name="nombre"
                autoComplete="off"
                placeholder="Ej: Nacional de Verano 2026"
                value={form.nombre}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all ${
                  errors.nombre ? "border-orange-200 bg-orange-50/20" : "border-slate-100"
                }`}
              />
            </div>
          </div>

          {/* FECHA Y PISCINA — en mobile van en columna, en sm en fila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* FECHA */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block">
                Fecha
                {errors.fecha && <span className="ml-2 text-orange-500 normal-case italic">{errors.fecha}</span>}
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 z-10 transition-colors pointer-events-none" size={18} />
                <DatePicker
                  selected={form.fecha}
                  onChange={handleDateChange}
                  locale="es"
                  dateFormat="dd / MM / yyyy"
                  placeholderText="Seleccionar fecha"
                  maxDate={new Date()}
                  showYearDropdown
                  dropdownMode="select"
                  wrapperClassName="w-full"
                  portalId="root-portal" 
                  popperClassName="z-[9999]"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all ${
                    errors.fecha ? "border-orange-200" : "border-slate-100"
                  }`}
                />
              </div>
            </div>

            {/* PISCINA */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block">Tipo de Piscina</label>
              <div className="relative group">
                <Waves className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <select
                  name="piscina"
                  value={form.piscina}
                  onChange={handleChange}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-700 outline-none appearance-none cursor-pointer focus:border-emerald-500 focus:bg-white transition-all"
                >
                  <option value={25}>Piscina Corta (25m)</option>
                  <option value={50}>Piscina Olímpica (50m)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                  <Plus size={14} className="rotate-45" />
                </div>
              </div>
            </div>
          </div>

          {mutation.isError && (
            <div className="bg-orange-50 p-4 rounded-2xl flex items-center gap-3 text-orange-600 border border-orange-100">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[11px] font-black uppercase tracking-tight">Fallo en la conexión. Intenta nuevamente.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className={`w-full flex items-center justify-center gap-4 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] transition-all active:scale-[0.98] disabled:opacity-50 ${
              mutation.isPending
                ? "bg-slate-100 text-slate-400"
                : "bg-slate-900 hover:bg-blue-600 text-white shadow-xl shadow-blue-900/10"
            }`}
          >
            {mutation.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>Finalizar Registro <Plus size={18} /></>
            )}
          </button>
        </form>

        <InfoFooter />
      </div>
    </div>
  )
}

export default CrearCompetencia
