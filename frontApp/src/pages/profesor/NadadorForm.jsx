import { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createNadador, getNadadorById, updateNadador } from "../../api/profesor.api"
import DatePicker, { registerLocale } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import es from "date-fns/locale/es"
import { 
  User, Mail, Calendar, Weight, Ruler, Fingerprint, 
  Waves, ArrowLeft, Save, Loader2, Info, AlertTriangle 
} from "lucide-react"

registerLocale("es", es)

const NadadorForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("") // Para errores generales de la API

  const [form, setForm] = useState({
    nombre: "", apellido: "", correo: "", fechaNacimiento: null,
    peso: "", altura: "", rut: "", pruebasEspecialidad: ""
  })

  const { data, isLoading } = useQuery({
    queryKey: ["nadador", id],
    queryFn: () => getNadadorById(id).then(res => res.data),
    enabled: isEdit
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
      navigate("/profesor/nadadores")
    },
    onError: (error) => {
      // Manejo de duplicados desde el Backend (asumiendo que tu API devuelve qué campo falló)
      const message = error.response?.data?.message || ""
      if (message.toLowerCase().includes("rut")) {
        setErrors(prev => ({ ...prev, rut: "Este RUT ya está registrado en AppÑSF" }))
      } else if (message.toLowerCase().includes("correo") || message.toLowerCase().includes("email")) {
        setErrors(prev => ({ ...prev, correo: "Este correo ya está en uso por otro atleta" }))
      } else {
        setServerError("Hubo un problema al procesar la solicitud. Intenta nuevamente.")
      }
    }
  })

  const validate = () => {
    let newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!form.nombre.trim()) newErrors.nombre = "Campo obligatorio"
    if (!form.apellido.trim()) newErrors.apellido = "Campo obligatorio"
    if (!emailRegex.test(form.correo)) newErrors.correo = "Formato de correo inválido"
    if (!form.fechaNacimiento) newErrors.fechaNacimiento = "Indique fecha"
    if (!form.rut.trim()) newErrors.rut = "RUT obligatorio"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setServerError("")
    if (!validate()) return

    const dataToSend = {
      ...form,
      peso: Number(form.peso),
      altura: Number(form.altura),
      pruebasEspecialidad: form.pruebasEspecialidad.split(",").map(p => p.trim()).filter(p => p !== "")
    }
    mutation.mutate(dataToSend)
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
      <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
      <p className="font-bold text-[10px] uppercase tracking-[0.3em]">Cargando Ficha Técnica...</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER DINÁMICO */}
      <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-5 z-10">
          <div className={`w-14 h-14 ${isEdit ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} rounded-2xl flex items-center justify-center shadow-inner`}>
            {isEdit ? <Save size={28} /> : <User size={28} />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isEdit ? "Edición de Atleta" : "Alta de Nuevo Nadador"}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">
              ID Sistema: {isEdit ? id.substring(0,8) : 'Pendiente'}
            </p>
          </div>
        </div>
        <Link to="/profesor/nadadores" className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all z-10">
          <ArrowLeft size={24} />
        </Link>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
          <AlertTriangle size={18} /> {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* GRUPO 1: IDENTIFICACIÓN (CAMPOS SENSIBLES) */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm group">
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
            <Fingerprint size={14} /> Datos de Validación Únicos
          </h3>
          
          <div className="grid md:grid-cols-2 gap-10">
            <CustomInput 
              label="RUT Institucional" 
              name="rut" 
              icon={Fingerprint} 
              form={form} setForm={setForm} errors={errors} 
              placeholder="12.345.678-9"
              description="Campo único por nadador"
            />
            <CustomInput 
              label="Correo Electrónico" 
              name="correo" 
              type="email" 
              icon={Mail} 
              form={form} setForm={setForm} errors={errors} 
              placeholder="ejemplo@correo.cl" 
              description="Para acceso al panel"
            />
          </div>
        </div>

        {/* GRUPO 2: INFORMACIÓN GENERAL (SIEMPRE EDITABLE) */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
            <Info size={14} /> Información Personal y Física
          </h3>
          
          <div className="grid md:grid-cols-2 gap-10">
            <CustomInput label="Nombre" name="nombre" icon={User} form={form} setForm={setForm} errors={errors} />
            <CustomInput label="Apellido" name="apellido" icon={User} form={form} setForm={setForm} errors={errors} />
            
            <div className="flex flex-col space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Nacimiento</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 z-10" size={18} />
                <DatePicker
                  selected={form.fechaNacimiento}
                  onChange={(date) => setForm({ ...form, fechaNacimiento: date })}
                  locale="es" dateFormat="dd/MM/yyyy" showYearDropdown
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all ${errors.fechaNacimiento ? 'border-red-500' : 'border-slate-100'}`}
                />
              </div>
              {errors.fechaNacimiento && <span className="text-[10px] text-red-500 font-bold italic">{errors.fechaNacimiento}</span>}
            </div>

            <CustomInput label="Peso (KG)" name="peso" type="number" icon={Weight} form={form} setForm={setForm} errors={errors} />
            <CustomInput label="Altura (CM)" name="altura" type="number" icon={Ruler} form={form} setForm={setForm} errors={errors} />
            <CustomInput label="Especialidades" name="pruebasEspecialidad" icon={Waves} form={form} setForm={setForm} errors={errors} placeholder="Ej: 50m Libre, 100m Espalda" />
          </div>
        </div>

        {/* ACCIONES FINALES */}
        <div className="flex items-center justify-between px-4 pt-4">
          <p className="text-[10px] text-slate-400 font-medium max-w-[250px]">
            Al {isEdit ? 'actualizar' : 'crear'}, los datos serán sincronizados con el ranking global de App<span className="text-blue-600">ÑSF</span>.
          </p>
          
          <div className="flex gap-4">
            <Link to="/profesor/nadadores" className="px-8 py-4 rounded-2xl text-slate-400 font-bold text-sm hover:bg-slate-100 transition-all">
              Descartar
            </Link>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${isEdit ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-[#0f172a] hover:bg-blue-600 shadow-slate-900/10'} text-white disabled:opacity-50`}
            >
              {mutation.isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isEdit ? "Confirmar Cambios" : "Finalizar Registro"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

const CustomInput = ({ label, name, type = "text", icon: Icon, form, setForm, errors, placeholder, description }) => (
  <div className="flex flex-col space-y-3">
    <div className="flex justify-between items-end px-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      {description && <span className="text-[9px] text-slate-300 font-bold uppercase">{description}</span>}
    </div>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all ${errors[name] ? "border-red-500 bg-red-50/50" : "border-slate-100"}`}
      />
    </div>
    {errors[name] && <span className="text-[10px] text-red-500 font-bold italic animate-in slide-in-from-top-1">{errors[name]}</span>}
  </div>
)

export default NadadorForm