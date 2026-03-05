import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/authContext"
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, ChevronRight } from "lucide-react"

const Login = () => {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ correo: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(formData) // <-- Aquí recibes la respuesta del backend

    if (result.success) {
      // 1. EXTRAER EL ROL Y EL FLAG DEL RESULTADO O DEL LOCALSTORAGE
      // Si tu login() en el Context ya guarda el rol en localStorage, 
      // asegúrate de que también guarde 'debeCambiarPassword'.
      
      const rol = localStorage.getItem("rol")
      
      // ESTA ES LA LÍNEA CLAVE AÑADIR:
      // Guardamos el estado de la contraseña para que el Dashboard lo lea al cargar
      if (result.debeCambiarPassword !== undefined) {
        localStorage.setItem("debeCambiarPassword", result.debeCambiarPassword);
      }

      // 2. NAVEGACIÓN BASADA EN ROL
      if (rol === "nadador") {
        navigate("/nadador")
      } else if (rol === "profesor") {
        navigate("/profesor")
      } else {
        navigate("/")
      }
    } else {
      setError(result.message || "Credenciales incorrectas")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden px-6">
      
      {/* Fondo con profundidad (Efecto Agua Profunda) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        
        {/* IDENTIDAD APPÑSF */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 rotate-3">
            <ShieldCheck size={40} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">
            App<span className="text-blue-500 text-5xl">ÑSF</span>
          </h1>
          <div className="h-1 w-12 bg-blue-600 rounded-full mt-2"></div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">
            Management System
          </p>
        </div>

        {/* CARD DE ACCESO */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 border border-white/20">
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">Acceso Privado</h2>
            <p className="text-slate-400 text-xs font-medium">Ingresa tus credenciales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* CORREO */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Usuario / Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="correo"
                  required
                  placeholder="ejemplo@appnsf.com"
                  value={formData.correo}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* CONTRASEÑA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* MENSAJE DE ERROR */}
            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] font-bold p-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                {error}
              </div>
            )}

            {/* BOTÓN DE ACCESO */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f172a] hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl shadow-blue-900/20 disabled:opacity-70 flex items-center justify-center gap-2 group mt-4"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  AUTENTICAR
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-100">
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Restricted Access • AppÑSF Security
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Login