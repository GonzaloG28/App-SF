import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, ChevronRight, AlertCircle } from "lucide-react"

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  // Estado unificado para reducir renders
  const [formData, setFormData] = useState({ correo: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState({ loading: false, error: "" })

  // Memorizamos el handler para evitar recrear la función en cada render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus({ loading: true, error: "" });

  try {
    const result = await login(formData);
    
    if (result.success) {
      const routes = {
        nadador: "/nadador/dashboard",
        profesor: "/profesor/nadadores"
      };
      navigate(routes[result.rol] || "/");
    } else {
      // Si el backend responde pero con error (ej. 400)
      setStatus({ 
        loading: false, 
        error: "Correo o contraseña incorrectos" // <-- Mensaje amigable
      });
    }
  } catch (err) {
    // Si hay un error de red o el servidor está caído
    setStatus({ 
      loading: false, 
      error: "Correo o contraseña incorrectos" // <-- Mantenemos el mismo por seguridad
    });
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden px-6 selection:bg-blue-500/30">
      
      {/* Luces de fondo estáticas (CSS puro es más ligero que imágenes) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Identidad Visual */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40 mb-4 rotate-2">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter">
            App<span className="text-blue-500">ÑSF</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2">
            Security Gateway
          </p>
        </div>

        {/* Card de Acceso con Glassmorphism Oscuro (Ahorra batería y recursos) */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 border border-slate-800/50 shadow-2xl">
          <header className="mb-8">
            <h2 className="text-lg font-bold text-white tracking-tight">Acceso Privado</h2>
            <p className="text-slate-500 text-xs mt-1">Ingresa al ecosistema deportivo</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Correo */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Email</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  name="correo"
                  required
                  placeholder="usuario@appnsf.com"
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={status.loading}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {status.error && (
              <div className="bg-red-500/10 text-red-500 text-[10px] font-black p-4 rounded-2xl border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm italic">
                <AlertCircle size={16} className="shrink-0" />
                <span className="tracking-wider uppercase">{status.error}</span>
              </div>
              )}

            {/* Botón Principal */}
            <button
              type="submit"
              disabled={status.loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-6 active:scale-[0.98] disabled:opacity-50"
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

          <footer className="mt-8 pt-6 border-t border-slate-800/50">
            <p className="text-center text-[8px] text-slate-600 font-bold uppercase tracking-widest">
              Conexión Encriptada • AppÑSF v2.0
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default Login