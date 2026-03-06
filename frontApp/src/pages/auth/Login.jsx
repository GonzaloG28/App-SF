import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AutHContext" // Usamos el hook optimizado
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, ChevronRight, AlertCircle } from "lucide-react"

const Login = () => {
  const { login } = useAuth()
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

    // El Context ahora maneja internamente el localStorage
    const result = await login(formData) 

    if (result.success) {
      // Redirección inmediata según el rol retornado por la API
      if (result.rol === "nadador") {
        navigate("/nadador/dashboard")
      } else if (result.rol === "profesor") {
        navigate("/profesor/nadadores")
      } else {
        navigate("/")
      }
    } else {
      // Si el error es por el arranque de Render, podrías personalizar este mensaje
      setError(result.message || "Credenciales incorrectas")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden px-6">
      
      {/* Fondo con profundidad */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        
        {/* IDENTIDAD APPÑSF */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 rotate-3">
            <ShieldCheck size={40} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">
            App<span className="text-blue-500 text-5xl">ÑSF</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">
            Management System
          </p>
        </div>

        {/* CARD DE ACCESO */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 border border-white/20">
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">Acceso Privado</h2>
            <p className="text-slate-400 text-xs font-medium">Ingresa tus credenciales para continuar</p>
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
                  autoComplete="email"
                  placeholder="ejemplo@appnsf.com"
                  value={formData.correo}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all disabled:opacity-50"
                  disabled={loading}
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all disabled:opacity-50"
                  disabled={loading}
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

            {/* MENSAJE DE ERROR MEJORADO */}
            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] font-bold p-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* BOTÓN DE ACCESO CON FEEDBACK PARA RENDER */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f172a] hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl shadow-blue-900/20 disabled:opacity-70 flex items-center justify-center gap-2 group mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>CONECTANDO CON SERVIDOR...</span>
                </>
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