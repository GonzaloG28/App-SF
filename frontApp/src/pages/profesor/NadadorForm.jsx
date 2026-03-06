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

  // 1. CARGA DE DATOS EXISTENTES
  const { data, isLoading } = useQuery({
    queryKey: ["nadador", id],
    queryFn: () => getNadadorById(id).then(res => res.data),
    enabled: isEdit,
    staleTime: Infinity, // No necesitamos re-refetch mientras editamos
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

  // 2. MUTACIÓN OPTIMIZADA
  const mutation = useMutation({
    mutationFn: (formData) => isEdit ? updateNadador(id, formData) : createNadador(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["nadadores"])
      // Si editamos, también invalidamos la ficha específica
      if (isEdit) queryClient.invalidateQueries(["nadador", id])
      navigate("/profesor/nadadores")
    },
    onError: (error) => {
      const message = error.response?.data?.message || ""
      if (message.toLowerCase().includes("rut")) {
        setErrors(prev => ({ ...prev, rut: "RUT ya registrado en el sistema" }))
      } else if (message.toLowerCase().includes("correo")) {
        setErrors(prev => ({ ...prev, correo: "Email ya vinculado a otro atleta" }))
      } else {
        setServerError("Error de conexión. Verifique los datos e intente nuevamente.")
      }
    }
  })

  // 3. VALIDACIÓN MEMOIZADA
  const validate = useCallback(() => {
    let newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!form.nombre.trim()) newErrors.nombre = "Campo obligatorio"
    if (!form.apellido.trim()) newErrors.apellido = "Campo obligatorio"
    if (!emailRegex.test(form.correo)) newErrors.correo = "Formato de correo inválido"
    if (!form.fechaNacimiento) newErrors.fechaNacimiento = "Indique fecha"
    if (!form.rut.trim()) newErrors.rut = "RUT obligatorio"
    
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
      pruebasEspecialidad: form.pruebasEspecialidad
        .split(",")
        .map(p => p.trim())
        .filter(p => p !== "")
    }
    mutation.mutate(dataToSend)
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 text-slate-400">
      <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
      <p className="font-black text-[10px] uppercase tracking-[0.4em]">Preparando Ficha Técnica...</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER DE FORMULARIO */}
      <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-full bg-slate-50/50 -skew-x-12 translate-x-10"></div>
        
        <div className="flex items-center gap-6 z-10">
          <div className={`w-16 h-16 ${isEdit ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-600 text-white'} rounded-[1.8rem] flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6`}>
            {isEdit ? <Save size={28} /> : <User size={28} />}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">
              {isEdit ? "Editar" : "Nuevo"} <span className="text-blue-600">Atleta</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
              {isEdit ? `UUID: ${id.slice(-8)}` : 'Formulario de Incorporación'}
            </p>
          </div>
        </div>
        <Link to="/profesor/nadadores" className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-3xl transition-all z-10">
          <ArrowLeft size={24} />
        </Link>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-100 p-5 rounded-3xl flex items-center gap-4 text-red-600 text-xs font-black uppercase tracking-tight animate-shake">
          <AlertTriangle size={20} /> {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECCIÓN 1: IDENTIFICACIÓN KRÍTICA */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative">
          <div className="absolute top-10 right-10 opacity-5 text-slate-900"><Fingerprint size={80} /></div>
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
            <CheckCircle2 size={14} /> Credenciales de Acceso
          </h3>
          
          <div className="grid md:grid-cols-2 gap-12">
            <CustomInput 
              label="RUT Institucional" 
              name="rut" 
              icon={Fingerprint} 
              form={form} setForm={setForm} errors={errors} 
              placeholder="12.345.678-9"
            />
            <CustomInput 
              label="Correo Electrónico" 
              name="correo" 
              type="email" 
              icon={Mail} 
              form={form} setForm={setForm} errors={errors} 
              placeholder="atleta@club.cl" 
            />
          </div>
        </div>

        {/* SECCIÓN 2: BIOMETRÍA Y PERFIL */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
            <Info size={14} /> Atributos Físicos y Especialidad
          </h3>
          
          <div className="grid md:grid-cols-2 gap-12">
            <CustomInput label="Nombres" name="nombre" icon={User} form={form} setForm={setForm} errors={errors} />
            <CustomInput label="Apellidos" name="apellido" icon={User} form={form} setForm={setForm} errors={errors} />
            
            <div className="flex flex-col space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nacimiento</label>
              <div className="relative group">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 z-10 transition-colors" size={20} />
                <DatePicker
                  selected={form.fechaNacimiento}
                  onChange={(date) => setForm({ ...form, fechaNacimiento: date })}
                  locale="es" 
                  dateFormat="dd / MM / yyyy" 
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText="Seleccionar fecha"
                  className={`w-full pl-14 pr-6 py-5 bg-slate-50 border rounded-[1.8rem] text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all ${errors.fechaNacimiento ? 'border-red-500 bg-red-50/30' : 'border-slate-100'}`}
                />
              </div>
              {errors.fechaNacimiento && <span className="text-[10px] text-red-500 font-bold italic ml-2">{errors.fechaNacimiento}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <CustomInput label="Peso (KG)" name="peso" type="number" icon={Weight} form={form} setForm={setForm} errors={errors} />
               <CustomInput label="Altura (CM)" name="altura" type="number" icon={Ruler} form={form} setForm={setForm} errors={errors} />
            </div>

            <div className="md:col-span-2">
               <CustomInput 
                 label="Especialidades Deportivas" 
                 name="pruebasEspecialidad" 
                 icon={Waves} 
                 form={form} setForm={setForm} errors={errors} 
                 placeholder="Ej: 50m Mariposa, 200m Combinado..." 
                 description="Separar por comas (,)"
               />
            </div>
          </div>
        </div>

        {/* BARRA DE ACCIONES */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 pt-6">
          <div className="flex items-center gap-3 text-slate-400">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
             <p className="text-[10px] font-bold uppercase tracking-widest">Sincronización de Ranking en tiempo real</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate("/profesor/nadadores")}
              className="flex-1 md:flex-none px-10 py-5 rounded-[1.8rem] text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-12 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl ${isEdit ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-[#0f172a] hover:bg-blue-600 shadow-slate-900/20'} text-white active:scale-95 disabled:opacity-50`}
            >
              {mutation.isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isEdit ? "Actualizar Registro" : "Crear Perfil Atleta"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// Sub-componente Input con estética refinada
const CustomInput = ({ label, name, type = "text", icon: Icon, form, setForm, errors, placeholder, description }) => (
  <div className="flex flex-col space-y-4">
    <div className="flex justify-between items-end px-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
      {description && <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded">{description}</span>}
    </div>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
        <Icon size={20} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className={`w-full pl-14 pr-6 py-5 bg-slate-50 border rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300 ${errors[name] ? "border-red-500 bg-red-50/20" : "border-slate-100"}`}
      />
    </div>
    {errors[name] && (
      <span className="text-[10px] text-red-500 font-black italic ml-2 animate-in fade-in slide-in-from-left-2">
        {errors[name]}
      </span>
    )}
  </div>
)

export default NadadorForm