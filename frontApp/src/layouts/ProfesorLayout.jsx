import { Link, Outlet, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { useNotificaciones } from "../hooks/useNotificaciones"
import NotificacionesPanel from "../components/NotificacionesPanel"
import {
  LayoutDashboard, Calendar, Users, Dumbbell,
  MessageSquare, LogOut, ChevronRight,
  Menu, X, Waves, User
} from "lucide-react"

const NavItem = ({ to, label, Icon, isActive }) => {
  const active = isActive(to)
  return (
    <Link
      to={to}
      className={`
        group flex items-center justify-between px-4 py-3.5 rounded-2xl
        transition-all duration-300 ease-out mb-1.5
        ${active
          ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
          : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={19} strokeWidth={active ? 2.5 : 2} className={active ? "" : "group-hover:scale-110 transition-transform"} />
        <span className="font-bold tracking-tight text-sm">{label}</span>
      </div>
      {active && <ChevronRight size={14} className="opacity-70" />}
    </Link>
  )
}

const SidebarContent = ({ user, showEntrenamientos, setShowEntrenamientos, onLogout, isActive, location }) => (
  <div className="flex flex-col h-full">
    <div className="flex-1">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 shrink-0">
          <Waves size={20} className="text-white" />
        </div>
        <div>
          <p className="text-green-600 text-[11px] font-black uppercase tracking-[0.3em] leading-none mb-0.5">Admin</p>
          <h2 className="text-xl font-black tracking-tighter text-slate-900">App<span className="text-blue-600 italic">ÑSF</span></h2>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Métricas & Gestión</p>
        <NavItem to="/profesor"            label="Dashboard"   Icon={LayoutDashboard} isActive={isActive} />
        <NavItem to="/profesor/calendario" label="Calendario"  Icon={Calendar}        isActive={isActive} />
        <NavItem to="/profesor/nadadores"  label="Nadadores"   Icon={Users}           isActive={isActive} />
        <div className="flex flex-col">
          <button
            onClick={() => setShowEntrenamientos(!showEntrenamientos)}
            className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              location.pathname.includes("entrenamiento")
                ? "bg-blue-50 text-blue-600 border border-blue-100/50"
                : "text-slate-500 hover:bg-slate-50 hover:text-green-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <Dumbbell size={19} strokeWidth={2} />
              <span className="font-bold tracking-tight text-sm">Entrenamientos</span>
            </div>
            <ChevronRight size={16} className={`transition-transform duration-300 ${showEntrenamientos ? "rotate-90 text-blue-600" : "opacity-40"}`} />
          </button>
          {showEntrenamientos && (
            <div className="flex flex-col ml-9 mt-1 gap-0.5 border-l-2 border-green-100 pl-4">
              <Link to="/profesor/crear-entrenamiento" className={`text-[11px] font-black uppercase tracking-widest py-2.5 transition-colors ${location.pathname === "/profesor/crear-entrenamiento" ? "text-green-600" : "text-slate-400 hover:text-blue-500"}`}>• Crear Nuevo</Link>
              <Link to="/profesor/entrenamientos" className={`text-[11px] font-black uppercase tracking-widest py-2.5 transition-colors ${location.pathname === "/profesor/entrenamientos" ? "text-green-600" : "text-slate-400 hover:text-blue-500"}`}>• Ver Reportes</Link>
            </div>
          )}
        </div>
        <NavItem to="/profesor/chat" label="Mensajería" Icon={MessageSquare} isActive={isActive} />
      </nav>
    </div>
    <div className="mt-auto pt-6 px-1 space-y-3">
      <div className="relative group overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-3 transition-all duration-300 hover:shadow-md">
        <div className="relative flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
              <span className="font-black text-white italic text-base">{user?.nombre?.charAt(0) || "C"}</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-slate-900 block truncate uppercase italic leading-none">{user?.nombre || "Coach"}</span>
            <span className="text-[11px] text-slate-400 font-bold truncate">Online</span>
          </div>
        </div>
      </div>
      <button onClick={onLogout} className="group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300">
        <div className="flex items-center gap-3">
          <LogOut size={18} strokeWidth={2.5} />
          <span className="text-[11px] font-black uppercase tracking-widest">Cerrar Sesión</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  </div>
)

const ProfesorLayout = () => {
  const { logout, user, isAuthenticated } = useAuth()
  const location = useLocation()
  const [showEntrenamientos, setShowEntrenamientos] = useState(false)
  const [isMobileMenuOpen,   setIsMobileMenuOpen]   = useState(false)

  const { notificaciones, cantidad, hayNuevas, panelAbierto, abrirPanel, cerrarPanel } = useNotificaciones(isAuthenticated)

  useEffect(() => {
    setIsMobileMenuOpen(false)
    cerrarPanel()
  }, [location, cerrarPanel])

  useEffect(() => {
    document.body.style.overflow = (isMobileMenuOpen || panelAbierto) ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isMobileMenuOpen, panelAbierto])

  const isActive = useCallback((path) => {
    if (path === "/profesor") return location.pathname === "/profesor"
    return location.pathname.startsWith(path)
  }, [location.pathname])

  const initials = [user?.nombre?.charAt(0)].filter(Boolean).join("").toUpperCase() || "PR"
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(" ")

  return (
    // FIX SCROLL: h-screen + overflow-hidden — igual que NadadorLayout
    <div className="flex h-screen overflow-hidden bg-[#FDFDFD] font-sans text-slate-900">

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 bg-white flex-col overflow-y-auto p-6 z-30 border-r border-slate-100">
        <SidebarContent user={user} showEntrenamientos={showEntrenamientos} setShowEntrenamientos={setShowEntrenamientos} onLogout={logout} isActive={isActive} location={location} />
      </aside>

      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 z-[200] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-72 bg-white p-6 shadow-2xl transition-transform duration-500 ease-out overflow-y-auto ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400"><X size={20} /></button>
          <SidebarContent user={user} showEntrenamientos={showEntrenamientos} setShowEntrenamientos={setShowEntrenamientos} onLogout={logout} isActive={isActive} location={location} />
        </aside>
      </div>

      {/* Columna derecha */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        <header className="flex-shrink-0 bg-white/80 backdrop-blur-md z-20 px-6 lg:px-10 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-slate-50 text-slate-600 rounded-xl"><Menu size={20} /></button>
            <div className="hidden sm:block">
              <span className="text-[11px] font-black text-green-500 uppercase tracking-[0.3em] block mb-0.5 leading-none">High Performance</span>
              <h1 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">Panel de Control</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificacionesPanel
              notificaciones={notificaciones}
              hayNuevas={hayNuevas}
              cantidad={cantidad}
              panelAbierto={panelAbierto}
              abrirPanel={abrirPanel}
              cerrarPanel={cerrarPanel}
            />
            <div className="h-6 w-[1px] bg-slate-100 mx-2" />
            <div className="relative group">
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl z-50 hidden lg:block">
                {fullName || "Coach"}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600/10 to-green-500/10 text-blue-600 flex items-center justify-center border border-blue-100 transition-all active:scale-95 hover:border-blue-300 hover:bg-blue-50 cursor-default lg:cursor-help" title={fullName || ""}>
                {user ? <span className="text-[11px] font-black tracking-tight leading-none">{initials}</span> : <User size={16} />}
              </div>
            </div>
          </div>
        </header>

        {/* Main scrolleable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProfesorLayout


