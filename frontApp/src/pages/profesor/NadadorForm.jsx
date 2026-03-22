import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createNadador, getNadadorById, updateNadador } from "../../api/profesor.api"
import DatePicker, { registerLocale } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import es from "date-fns/locale/es"
import {
  User, Mail, Calendar, Weight, Ruler, Fingerprint,
  Waves, ArrowLeft, Save, Loader2, Info, AlertTriangle, CheckCircle2
} from "lucide-react"

registerLocale("es", es)

const formatRut = (value) => {
  const clean = value.replace(/[^0-9kK]/g, "")
  if (clean.length <= 1) return clean
  const dv = clean.slice(-1)
  let body = clean.slice(0, -1)
  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${body}-${dv}`
}

const NadadorForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")

  const [form, setForm] = useState({
    nombre: "", apellido: "", correo: "", fechaNacimiento: null,
    peso: "", altura: "", rut: "", pruebasEspecialidad: ""
  })

  const { data, isLoading } = useQuery({
    queryKey: ["nadador", id],
    queryFn: () => getNadadorById(id).then(res => res.data),
    enabled: isEdit,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        pruebasEspecialidad: data.pruebasEspecialidad?.join(", ") || ""
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (formData) => isEdit ? updateNadador(id, formData) : createNadador(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["nadadores"])
      if (isEdit) queryClient.invalidateQueries(["nadador", id])
      navigate("/profesor/nadadores")
    },
    onError: (error) => {
      const message = error.response?.data?.message || ""
      if (message.toLowerCase().includes("rut")) {
        setErrors(prev => ({ ...prev, rut: "RUT ya registrado" }))
      } else if (message.toLowerCase().includes("correo")) {
        setErrors(prev => ({ ...prev, correo: "Email ya en uso" }))
      } else {
        setServerError("Error en el servidor. Reintente.")
      }
    }
  })

  const validate = useCallback(() => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.nombre.trim()) newErrors.nombre = "Requerido"
    if (!form.apellido.trim()) newErrors.apellido = "Requerido"
    if (!emailRegex.test(form.correo)) newErrors.correo = "Email inválido"
    if (!form.fechaNacimiento) newErrors.fechaNacimiento = "Falta fecha"
    if (!form.rut.trim()) newErrors.rut = "RUT requerido"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const handleSubmit = (e) => {
    e.preventDefault()
    setServerError("")
    if (!validate()) return
    const dataToSend = {
      ...form,
      peso: form.peso ? Number(form.peso) : 0,
      altura: form.altura ? Number(form.altura) : 0,
      pruebasEspecialidad: form.pruebasEspecialidad.split(",").map(p => p.trim()).filter(p => p !== "")
    }
    mutation.mutate(dataToSend)
  }

  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value)
    if (formatted.length <= 12) setForm({ ...form, rut: formatted })
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 size={48} className="animate-spin text-blue-600" />
      <p className="font-black text-[10px] uppercase tracking-[0.5em] text-slate-400">Sincronizando Atleta...</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-24 p-4">

      {/* HEADER */}
      <div className="relative bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl ${isEdit ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-blue-500 to-blue-700"}`}>
              {isEdit ? <Save size={40} /> : <User size={40} />}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
                {isEdit ? "Editar" : "Nuevo"}{" "}
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent not-italic">Atleta</span>
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Ficha de Rendimiento</span>
                {isEdit && <span className="bg-slate-800 text-[9px] px-3 py-1 rounded-full text-blue-400 font-mono tracking-tighter italic">ID: {id.slice(-8)}</span>}
              </div>
            </div>
          </div>
          <Link to="/profesor/nadadores" className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/10 transition-all">
            <ArrowLeft size={18} className="text-slate-400 group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
          </Link>
        </div>
      </div>

      {/* FIX #9: animate-bounce-subtle → clase inexistente. Reemplazado por animate-pulse */}
      {serverError && (
        <div className="bg-orange-500 text-white p-6 rounded-[2rem] flex items-center gap-5 animate-pulse shadow-xl shadow-orange-200">
          <AlertTriangle size={24} />
          <span className="text-[11px] font-black uppercase tracking-widest">{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-slate-50 rotate-12"><Fingerprint size={120} /></div>
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-3 relative z-10">
              <Fingerprint size={16} /> Identidad única
            </h3>
            <div className="space-y-8 relative z-10">
              <CustomInput label="RUT Institucional" name="rut" icon={Fingerprint} form={form} errors={errors} placeholder="12.345.678-9" onChange={handleRutChange} disabled={isEdit} />
              <CustomInput label="Email de Contacto" name="correo" type="email" icon={Mail} form={form} setForm={setForm} errors={errors} placeholder="atleta@club.cl" />
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-3">
              <Info size={16} /> Biometría Base
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <CustomInput label="Peso (KG)"    name="peso"   type="number" icon={Weight} form={form} setForm={setForm} errors={errors} placeholder="70" />
              <CustomInput label="Altura (CM)"  name="altura" type="number" icon={Ruler}  form={form} setForm={setForm} errors={errors} placeholder="180" />
            </div>
            <div className="flex flex-col space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Fecha de Nacimiento</label>
              <div className="relative group">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 z-10 transition-colors" size={20} />
                <DatePicker
                  selected={form.fechaNacimiento}
                  onChange={(date) => setForm({ ...form, fechaNacimiento: date })}
                  locale="es"
                  dateFormat="dd / MM / yyyy"
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText="DD / MM / AAAA"
                  className={`w-full pl-16 pr-6 py-5 bg-slate-50 border-2 rounded-2xl text-sm font-black focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all ${errors.fechaNacimiento ? "border-orange-500 bg-orange-50/30" : "border-slate-50 hover:border-slate-200"}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
              <Waves size={16} className="text-blue-500" /> Especialidades y Nombres
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-full italic">Datos visibles en el perfil público</span>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <CustomInput label="Nombres Atleta"  name="nombre"   icon={User}   form={form} setForm={setForm} errors={errors} placeholder="Ej: Juan Andrés" />
            <CustomInput label="Apellidos Atleta" name="apellido" icon={User}   form={form} setForm={setForm} errors={errors} placeholder="Ej: Pérez Soto" />
            <div className="md:col-span-2">
              <CustomInput
                label="Pruebas de Especialidad"
                name="pruebasEspecialidad"
                icon={Waves}
                form={form} setForm={setForm} errors={errors}
                placeholder="Ej: 100m Mariposa, 50m Pecho..."
                description="Use comas para separar varias pruebas"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-end gap-6 pt-10">
          <button
            type="submit"
            // FIX #11: mutation.isLoading → mutation.isPending (TanStack Query v5)
            disabled={mutation.isPending}
            className={`w-full md:w-auto min-w-[300px] flex items-center justify-center gap-4 px-12 py-8 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] transition-all duration-500 shadow-2xl active:scale-95 disabled:opacity-50 ${
              isEdit
                ? "bg-emerald-500 hover:bg-slate-900 text-white shadow-emerald-200"
                : "bg-slate-900 hover:bg-blue-600 text-white shadow-slate-300"
            }`}
          >
            {mutation.isPending ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
            {isEdit ? "Sincronizar Cambios" : "Inscribir Nadador"}
          </button>
        </div>
      </form>
    </div>
  )
}

const CustomInput = ({ label, name, type = "text", icon: Icon, form, setForm, errors, placeholder, description, disabled, onChange }) => (
  <div className={`flex flex-col space-y-3 ${disabled ? "opacity-70" : ""}`}>
    <div className="flex justify-between items-center px-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{label}</label>
      {description && <span className="text-[8px] font-bold text-blue-500 uppercase">{description}</span>}
    </div>
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors ${disabled ? "text-slate-300" : "text-slate-400 group-focus-within:text-blue-600"}`}>
        <Icon size={18} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        disabled={disabled}
        onChange={onChange || ((e) => setForm({ ...form, [name]: e.target.value }))}
        className={`w-full h-16 pl-16 pr-6 bg-slate-50 border-2 rounded-2xl text-sm font-black outline-none transition-all
          ${disabled
            ? "bg-slate-100 border-slate-100 text-slate-500 cursor-not-allowed"
            : "border-slate-50 focus:bg-white focus:border-blue-600 focus:ring-[12px] focus:ring-blue-500/5"
          } ${errors[name] ? "border-orange-500 bg-orange-50/20" : ""}`}
      />
      {errors[name] && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500">
          <AlertTriangle size={18} />
        </div>
      )}
    </div>
  </div>
)

export default NadadorForm
