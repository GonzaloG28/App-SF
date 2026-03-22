import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, ChevronRight, AlertCircle } from "lucide-react"

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ correo: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState({ loading: false, error: "" })

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = async (e) => {
  e.preventDefault()
  setStatus({ loading: true, error: "" })
  try {
    const result = await login(formData)
    if (result.success) {
      const routes = { nadador: "/nadador/dashboard", profesor: "/profesor/nadadores" }
      navigate(routes[result.rol] || "/")
    } else {
      setStatus({ loading: false, error: result.message || "Correo o contraseña incorrectos" })
    }
  } catch (error) {
    // FIX: detectar específicamente el error 429 (rate limit)
    const status  = error?.response?.status
    const mensaje = error?.response?.data?.message

    if (status === 429) {
      setStatus({
        loading: false,
        error: "Demasiados intentos. Espera un momento e intenta de nuevo."
      })
    } else {
      setStatus({
        loading: false,
        error: mensaje || "Correo o contraseña incorrectos"
      })
    }
  }
}

  return (
    // FIX: overflow-hidden en raíz para contener cualquier animación futura
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-6 selection:bg-green-500/20">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* FIX: Eliminado "animate-in slide-in-from-bottom-4 duration-500"
          Reemplazado por fade-in puro que no afecta el eje X del viewport */}
      <div className="w-full max-w-md z-10 animate-fade-in">

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4 rotate-2">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter">
            App<span className="text-blue-600">ÑSF</span>
          </h1>
          <p className="text-green-600 text-[11px] font-black uppercase tracking-[0.4em] mt-2">
            Security Gateway
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white shadow-2xl shadow-slate-200/50">
          <header className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Acceso Privado</h2>
            <p className="text-slate-500 text-xs mt-1">Ingresa al ecosistema deportivo</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest">Email</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  name="correo"
                  required
                  placeholder="usuario@appnsf.com"
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest">Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {status.error && (
              // FIX: Eliminado "animate-in slide-in-from-top-2" — causa shift de layout
              <div className="bg-red-50 text-red-500 text-[11px] font-black p-4 rounded-2xl border border-red-100 flex items-center gap-3 italic">
                <AlertCircle size={16} className="shrink-0" />
                <span className="tracking-wider uppercase">{status.error}</span>
              </div>
            )}

            {/* FIX: py-4.5 → py-[18px] (py-4.5 no existe en Tailwind) */}
            <button
              type="submit"
              disabled={status.loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-[18px] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-6 active:scale-[0.98] disabled:opacity-50"
            >
              {status.loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  Entrar al sistema
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </form>

          <footer className="mt-8 pt-6 border-t border-slate-50">
            <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Conexión Encriptada • AppÑSF v2.0
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default Login
