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

  const [errors,      setErrors]      = useState({})
  const [serverError, setServerError] = useState("")

  const [form, setForm] = useState({
    nombre: "", apellido: "", correo: "", fechaNacimiento: null,
    peso: "", altura: "", rut: "", pruebasEspecialidad: ""
  })

  const { data, isLoading } = useQuery({
    queryKey: ["nadador", id],
    queryFn:  () => getNadadorById(id).then(res => res.data),
    enabled:  isEdit,
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
    if (!form.nombre.trim())           newErrors.nombre          = "Requerido"
    if (!form.apellido.trim())         newErrors.apellido        = "Requerido"
    if (!emailRegex.test(form.correo)) newErrors.correo          = "Email inválido"
    if (!form.fechaNacimiento)         newErrors.fechaNacimiento = "Falta fecha"
    if (!form.rut.trim())              newErrors.rut             = "RUT requerido"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const handleSubmit = (e) => {
    e.preventDefault()
    setServerError("")
    if (!validate()) return
    mutation.mutate({
      ...form,
      peso:   form.peso   ? Number(form.peso)   : 0,
      altura: form.altura ? Number(form.altura) : 0,
      pruebasEspecialidad: form.pruebasEspecialidad
        .split(",").map(p => p.trim()).filter(p => p !== "")
    })
  }

  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value)
    if (formatted.length <= 12) setForm({ ...form, rut: formatted })
  }

  if (isLoading) return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-5 p-4 pb-8">
      <div className="h-32 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
      <div className="h-48 bg-slate-100 rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in pb-8 p-4">

      {/* HEADER — más compacto en mobile */}
      <div className="relative bg-slate-900 rounded-2xl md:rounded-[3rem] p-5 md:p-10 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-xl shrink-0 ${isEdit ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-blue-500 to-blue-700"}`}>
              {isEdit ? <Save size={28} /> : <User size={28} />}
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight">
                {isEdit ? "Editar" : "Nuevo"}{" "}
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent not-italic">Atleta</span>
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Ficha de Rendimiento</span>
                {isEdit && <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded-full text-blue-400 font-mono">...{id.slice(-6)}</span>}
              </div>
            </div>
          </div>
          <Link
            to="/profesor/nadadores"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 transition-all self-start sm:self-auto"
          >
            <ArrowLeft size={15} className="text-slate-400" />
            <span className="text-[11px] font-black uppercase tracking-widest">Volver</span>
          </Link>
        </div>
      </div>

      {serverError && (
        <div className="bg-orange-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-orange-200">
          <AlertTriangle size={20} className="shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest">{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* IDENTIDAD + BIOMETRÍA — en mobile columna, en md fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Identidad */}
          <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-slate-50 rotate-12 pointer-events-none">
              <Fingerprint size={80} />
            </div>
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 relative z-10">
              <Fingerprint size={14} /> Identidad
            </h3>
            <div className="space-y-4 relative z-10">
              <Field label="RUT" name="rut" icon={Fingerprint} form={form} errors={errors}
                placeholder="12.345.678-9" onChange={handleRutChange} disabled={isEdit} />
              <Field label="Email" name="correo" type="email" icon={Mail} form={form}
                setForm={setForm} errors={errors} placeholder="atleta@club.cl" />
            </div>
          </div>

          {/* Biometría */}
          <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <Info size={14} /> Biometría
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Peso (kg)"   name="peso"   type="number" icon={Weight} form={form} setForm={setForm} errors={errors} placeholder="70" />
              <Field label="Altura (cm)" name="altura" type="number" icon={Ruler}  form={form} setForm={setForm} errors={errors} placeholder="180" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Nacimiento</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 z-10 transition-colors" size={17} />
                <DatePicker
                  selected={form.fechaNacimiento}
                  onChange={(date) => setForm({ ...form, fechaNacimiento: date })}
                  locale="es"
                  dateFormat="dd / MM / yyyy"
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText="DD / MM / AAAA"
                  wrapperClassName="w-full"
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl text-sm font-black focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all ${
                    errors.fechaNacimiento ? "border-orange-400 bg-orange-50/30" : "border-slate-100 hover:border-slate-200"
                  }`}
                />
              </div>
              {errors.fechaNacimiento && (
                <p className="text-[11px] text-orange-500 font-black uppercase ml-1">{errors.fechaNacimiento}</p>
              )}
            </div>
          </div>
        </div>

        {/* DATOS DEL PERFIL */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <Waves size={14} className="text-blue-500" /> Datos del Perfil
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-50 rounded-full italic self-start sm:self-auto">
              Visible en el perfil del nadador
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombres"  name="nombre"   icon={User}  form={form} setForm={setForm} errors={errors} placeholder="Ej: Juan Andrés" />
            <Field label="Apellidos" name="apellido" icon={User}  form={form} setForm={setForm} errors={errors} placeholder="Ej: Pérez Soto" />
            <div className="sm:col-span-2">
              <Field
                label="Pruebas de Especialidad"
                name="pruebasEspecialidad"
                icon={Waves}
                form={form} setForm={setForm} errors={errors}
                placeholder="Ej: 100m Mariposa, 50m Pecho..."
                description="Separar con comas"
              />
            </div>
          </div>
        </div>

        {/* BOTÓN SUBMIT */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-300 shadow-xl active:scale-95 disabled:opacity-50 ${
            isEdit
              ? "bg-emerald-500 hover:bg-slate-900 text-white shadow-emerald-200"
              : "bg-slate-900 hover:bg-blue-600 text-white shadow-slate-300"
          }`}
        >
          {mutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
          {isEdit ? "Sincronizar Cambios" : "Inscribir Nadador"}
        </button>
      </form>
    </div>
  )
}

// Input simplificado con altura más cómoda en mobile
const Field = ({ label, name, type = "text", icon: Icon, form, setForm, errors, placeholder, description, disabled, onChange }) => (
  <div className={`flex flex-col space-y-1.5 ${disabled ? "opacity-70" : ""}`}>
    <div className="flex justify-between items-center px-1">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</label>
      {description && <span className="text-[10px] font-bold text-blue-500 uppercase">{description}</span>}
      {errors[name] && <span className="text-[10px] text-orange-500 font-black uppercase">{errors[name]}</span>}
    </div>
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
        disabled ? "text-slate-300" : "text-slate-400 group-focus-within:text-blue-600"
      }`}>
        <Icon size={16} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        disabled={disabled}
        onChange={onChange || ((e) => setForm({ ...form, [name]: e.target.value }))}
        className={`w-full py-3.5 pl-11 pr-4 bg-slate-50 border-2 rounded-xl text-sm font-black outline-none transition-all
          ${disabled
            ? "bg-slate-100 border-slate-100 text-slate-500 cursor-not-allowed"
            : "border-slate-100 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5"
          } ${errors[name] ? "border-orange-400 bg-orange-50/20" : ""}`}
      />
      {errors[name] && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500">
          <AlertTriangle size={16} />
        </div>
      )}
    </div>
  </div>
)

export default NadadorForm
