import { Link, Outlet, useLocation } from "react-router-dom"
import { useContext, useState } from "react"
import { AuthContext } from "../context/authContext"
// Importamos los iconos formales
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Dumbbell, 
  MessageSquare, 
  LogOut, 
  Bell,
  ChevronRight
} from "lucide-react"

const ProfesorLayout = () => {
  const { logout, user } = useContext(AuthContext)
  const location = useLocation()
  const [showEntrenamientos, setShowEntrenamientos] = useState(false)

  const isActive = (path) => {
    if (path === "/profesor") return location.pathname === "/profesor"
    return location.pathname.startsWith(path)
  }

  const navItem = (to, label, Icon) => {
    const active = isActive(to)

    return (
      <Link
        to={to}
        className={`
          group flex items-center justify-between px-4 py-3.5 rounded-2xl
          transition-all duration-300 ease-in-out
          ${active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"}
        `}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} strokeWidth={active ? 2.5 : 2} />
          <span className="font-semibold tracking-tight text-sm">{label}</span>
        </div>
        {active && <ChevronRight size={16} className="opacity-70" />}
      </Link>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">

      {/* SIDEBAR CORPORATIVO */}
      <aside className="w-72 bg-[#0f172a] text-white flex flex-col justify-between p-7 sticky top-0 h-screen z-20">
        
        <div>
          {/* Logo Brand */}
          <div className="mb-10 px-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-black text-lg">A</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              App<span className="text-blue-400">ÑSF</span>
            </h2>
          </div>

          <nav className="flex flex-col gap-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">Menú Principal</p>
            {navItem("/profesor", "Panel de Control", LayoutDashboard)}
            {navItem("/profesor/calendario", "Calendario", Calendar)}
            {navItem("/profesor/nadadores", "Gestión Nadadores", Users)}
            <div className="flex flex-col">
                <button
                  onClick={() => setShowEntrenamientos(!showEntrenamientos)}
                  className={`
                    group flex items-center justify-between px-4 py-3.5 rounded-2xl
                    transition-all duration-300 ease-in-out
                    ${location.pathname.includes("entrenamiento") 
                      ? "bg-slate-800 text-white" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Dumbbell size={20} strokeWidth={location.pathname.includes("entrenamiento") ? 2.5 : 2} />
                    <span className="font-semibold tracking-tight text-sm">Entrenamientos</span>
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`transition-transform duration-300 ${showEntrenamientos ? "rotate-90" : "opacity-40"}`} 
                  />
                </button>

                {/* LOS SUB-LINKS */}
                {showEntrenamientos && (
                  <div className="flex flex-col ml-9 mt-2 gap-2 border-l border-slate-800 pl-4 animate-in slide-in-from-top-1 duration-200">
                    <Link 
                      to="/profesor/crear-entrenamiento" 
                      className={`text-[11px] font-black uppercase tracking-widest py-2 transition-colors ${location.pathname === "/profesor/crear-entrenamiento" ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      • Crear Nuevo
                    </Link>
                    <Link 
                      to="/profesor/entrenamientos" 
                      className={`text-[11px] font-black uppercase tracking-widest py-2 transition-colors ${location.pathname === "/profesor/entrenamientos" ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      • Ver Reportes
                    </Link>
                  </div>
                )}
              </div>
            {navItem("/profesor/chat", "Mensajería", MessageSquare)}
          </nav>
        </div>

        {/* Perfil & Logout */}
        <div className="pt-6 border-t border-slate-800/50">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 p-0.5">
              <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold uppercase">
                {user?.nombre?.charAt(0) || "P"}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-none mb-1">{user?.nombre || "Profesor"}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Entrenador</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 py-3 rounded-xl font-bold text-xs border border-red-500/20"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col">

        {/* HEADER MINIMALISTA */}
        <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-10 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
          <div>
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Gestión Deportiva</span>
             <h1 className="text-lg font-bold text-slate-800">Panel Administrativo</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
               <Bell size={20} />
               <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  )
}

export default ProfesorLayout