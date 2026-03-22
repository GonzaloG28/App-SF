import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import api from "../../api/axios"
import DatePicker, { registerLocale } from "react-datepicker"
import es from "date-fns/locale/es"
import "react-datepicker/dist/react-datepicker.css"
import {
  UserCheck, Plus, Search, CheckCircle2, XCircle,
  RefreshCcw, Loader2, X, ArrowUpRight, UserPlus,
  Phone, User, Calendar, Fingerprint, Waves
} from "lucide-react"

registerLocale("es", es)

const formatRut = (v) => {
  const clean = v.replace(/[^0-9kK]/g, "")
  if (clean.length <= 1) return clean
  const dv   = clean.slice(-1)
  let body   = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${body}-${dv}`
}

// Modal para crear formativo
const ModalCrear = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    nombre: "", apellido: "", rut: "", fechaNacimiento: null,
    apoderado: "", telefono: "", peso: "", altura: "", notas: ""
  })
  const [errors, setErrors] = useState({})

  const mutation = useMutation({
    mutationFn: (data) => api.post("/formativos", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["formativos"])
      queryClient.invalidateQueries(["adminStats"])
      onSuccess()
      onClose()
    },
    onError: (err) => {
      const msg = err.response?.data?.message || ""
      if (msg.toLowerCase().includes("rut")) setErrors({ rut: "RUT ya registrado" })
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.nombre.trim())       errs.nombre     = "Requerido"
    if (!form.apellido.trim())     errs.apellido   = "Requerido"
    if (!form.rut.trim())          errs.rut        = "Requerido"
    if (!form.fechaNacimiento)     errs.fecha      = "Requerido"
    if (!form.apoderado.trim())    errs.apoderado  = "Requerido"
    if (!form.telefono.trim())     errs.telefono   = "Requerido"
    if (Object.keys(errs).length) { setErrors(errs); return }

    mutation.mutate({
      ...form,
      fechaNacimiento: form.fechaNacimiento.toISOString(),
      peso:   form.peso   ? Number(form.peso)   : 0,
      altura: form.altura ? Number(form.altura) : 0,
    })
  }

  const Field = ({ label, name, icon: Icon, type = "text", placeholder, disabled }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between px-1">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {errors[name] && <span className="text-[10px] text-orange-500 font-black uppercase">{errors[name]}</span>}
      </div>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
        <input
          type={type}
          value={form[name]}
          disabled={disabled}
          onChange={e => {
            const val = name === "rut" ? formatRut(e.target.value) : e.target.value
            setForm(prev => ({ ...prev, [name]: val }))
            setErrors(prev => ({ ...prev, [name]: null }))
          }}
          placeholder={placeholder}
          className={`w-full pl-10 pr-3 py-3 bg-slate-50 border-2 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all ${errors[name] ? "border-orange-300" : "border-slate-100"}`}
        />
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
              <UserPlus size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-black italic uppercase tracking-tighter text-lg">Nuevo Formativo</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Rama no competitiva</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4" style={{ maxHeight: "calc(90vh - 100px)" }}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre"   name="nombre"   icon={User}        placeholder="Juan" />
            <Field label="Apellido" name="apellido" icon={User}        placeholder="Pérez" />
          </div>
          <Field label="RUT"       name="rut"       icon={Fingerprint} placeholder="12.345.678-9" />

          {/* Fecha de nacimiento */}
          <div className="space-y-1.5">
            <div className="flex justify-between px-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Fecha Nacimiento</label>
              {errors.fecha && <span className="text-[10px] text-orange-500 font-black uppercase">{errors.fecha}</span>}
            </div>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 z-10" size={15} />
              <DatePicker
                selected={form.fechaNacimiento}
                onChange={d => { setForm(prev => ({ ...prev, fechaNacimiento: d })); setErrors(prev => ({ ...prev, fecha: null })) }}
                locale="es" dateFormat="dd/MM/yyyy"
                showYearDropdown dropdownMode="select"
                placeholderText="DD/MM/AAAA"
                maxDate={new Date()}
                wrapperClassName="w-full"
                className={`w-full pl-10 pr-3 py-3 bg-slate-50 border-2 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all ${errors.fecha ? "border-orange-300" : "border-slate-100"}`}
              />
            </div>
          </div>

          <Field label="Apoderado" name="apoderado" icon={User}  placeholder="Nombre del apoderado" />
          <Field label="Teléfono"  name="telefono"  icon={Phone} placeholder="+56 9 1234 5678" />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Peso (kg)"   name="peso"   icon={Waves} type="number" placeholder="30" />
            <Field label="Altura (cm)" name="altura" icon={Waves} type="number" placeholder="120" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block">Notas (opcional)</label>
            <textarea
              value={form.notas}
              onChange={e => setForm(prev => ({ ...prev, notas: e.target.value }))}
              placeholder="Observaciones adicionales..."
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Registrar Nadador Formativo
          </button>
        </form>
      </div>
    </div>
  )
}

// Modal promover a competitivo
const ModalPromover = ({ nadador, onClose }) => {
  const queryClient = useQueryClient()
  const [correo, setCorreo] = useState("")
  const [error,  setError]  = useState("")

  const mutation = useMutation({
    mutationFn: () => api.post(`/formativos/${nadador._id}/promover`, { correo }),
    onSuccess: () => {
      queryClient.invalidateQueries(["formativos"])
      queryClient.invalidateQueries(["adminStats"])
      onClose()
    },
    onError: (err) => setError(err.response?.data?.message || "Error al promover")
  })

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <h3 className="font-black text-slate-900 text-lg italic uppercase tracking-tight mb-2">Promover a Competitivo</h3>
        <p className="text-[11px] text-slate-500 font-medium mb-5">
          Se creará una cuenta de usuario para <strong>{nadador.nombre} {nadador.apellido}</strong>.
          La contraseña inicial será su RUT.
        </p>
        <input
          type="email"
          value={correo}
          onChange={e => { setCorreo(e.target.value); setError("") }}
          placeholder="Correo del nadador"
          className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-600 outline-none transition-all mb-3"
          autoFocus
        />
        {error && <p className="text-orange-500 text-[11px] font-black uppercase mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !correo}
            className="flex-1 py-3 bg-blue-600 hover:bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  )
}

const AdminFormativos = () => {
  const queryClient = useQueryClient()
  const [buscar,        setBuscar]        = useState("")
  const [modalCrear,    setModalCrear]    = useState(false)
  const [modalPromover, setModalPromover] = useState(null)

  const { data = [], isLoading, isFetching } = useQuery({
    queryKey: ["formativos"],
    queryFn:  () => api.get("/formativos").then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/pago-formativo/${id}`),
    onSuccess:  () => { queryClient.invalidateQueries(["formativos"]); queryClient.invalidateQueries(["adminStats"]) }
  })

  const eliminarMutation = useMutation({
    mutationFn: (id) => api.delete(`/formativos/${id}`),
    onSuccess:  () => { queryClient.invalidateQueries(["formativos"]); queryClient.invalidateQueries(["adminStats"]) }
  })

  const filtrados = data.filter(n => {
    if (!buscar) return true
    return `${n.nombre} ${n.apellido}`.toLowerCase().includes(buscar.toLowerCase())
  })

  return (
    <>
      {modalCrear    && <ModalCrear    onClose={() => setModalCrear(false)} onSuccess={() => {}} />}
      {modalPromover && <ModalPromover nadador={modalPromover} onClose={() => setModalPromover(null)} />}

      <div className="space-y-5 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-green-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Gestión</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
              Rama <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">Formativa</span>
            </h1>
          </div>
          <button
            onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-green-200 active:scale-95"
          >
            <Plus size={16} /> Agregar Formativo
          </button>
        </div>

        {/* Búsqueda */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 p-2 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-11 pr-4 py-3 bg-transparent border-none text-[11px] font-black text-slate-700 focus:ring-0 placeholder:text-slate-300 uppercase tracking-widest outline-none"
            />
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-2xl p-3 text-center">
            <p className="text-xl font-black text-slate-900 italic">{data.length}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-3 text-center">
            <p className="text-xl font-black text-emerald-700 italic">{data.filter(n => n.pagoAlDia).length}</p>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Al día</p>
          </div>
          <div className="bg-orange-50 rounded-2xl p-3 text-center">
            <p className="text-xl font-black text-orange-700 italic">{data.filter(n => !n.pagoAlDia).length}</p>
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Pendientes</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-green-500" size={32} /></div>
        ) : (
          <div className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            {filtrados.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
                <UserCheck size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin nadadores formativos</p>
                <button onClick={() => setModalCrear(true)} className="mt-4 text-green-600 text-[11px] font-black uppercase tracking-widest hover:underline">
                  + Agregar el primero
                </button>
              </div>
            ) : filtrados.map(n => (
              <div key={n._id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-black text-base italic shrink-0">
                    {n.nombre.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-slate-900 uppercase italic tracking-tight text-sm truncate">{n.nombre} {n.apellido}</p>
                      <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded uppercase tracking-widest border border-green-100">Formativo</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-bold">{n.edad} años</span>
                      {n.apoderado && <span className="text-[10px] text-slate-400 font-bold">Apod: {n.apoderado}</span>}
                      {n.telefono  && <span className="text-[10px] text-slate-400 font-bold">{n.telefono}</span>}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle pago */}
                    <button
                      onClick={() => toggleMutation.mutate(n._id)}
                      disabled={toggleMutation.isPending}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                        n.pagoAlDia
                          ? "bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                      }`}
                      title={n.pagoAlDia ? "Marcar pendiente" : "Confirmar pago"}
                    >
                      {n.pagoAlDia ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    </button>

                    {/* Promover */}
                    <button
                      onClick={() => setModalPromover(n)}
                      className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all"
                      title="Promover a competitivo"
                    >
                      <ArrowUpRight size={16} />
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => { if (confirm(`¿Eliminar a ${n.nombre} ${n.apellido}?`)) eliminarMutation.mutate(n._id) }}
                      className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                      title="Eliminar"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Badge pago visible en mobile */}
                <div className="mt-3 flex items-center gap-2 sm:hidden">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                    n.pagoAlDia ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                  }`}>
                    {n.pagoAlDia ? "✓ Al día" : "⚠ Pago pendiente"}
                  </span>
                  {n.fechaUltimoPago && (
                    <span className="text-[10px] text-slate-400 font-bold">
                      Último: {new Date(n.fechaUltimoPago).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default AdminFormativos
