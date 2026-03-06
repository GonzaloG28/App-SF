import { Link, Outlet, useLocation } from "react-router-dom"
import { useContext, useState, useEffect } from "react"
import { useAuth } from "../context/AutHContext"
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Dumbbell, 
  MessageSquare, 
  LogOut, 
  Bell,
  ChevronRight,
  Menu,
  X,
  User
} from "lucide-react"

const ProfesorLayout = () => {
  const { logout, user } = useAuth();

  const location = useLocation()
  
  // Estados para UI
  const [showEntrenamientos, setShowEntrenamientos] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const isActive = (path) => {
    if (path === "/profesor") return location.pathname === "/profesor"
    return location.pathname.startsWith(path)
  }

  const NavItem = ({ to, label, Icon }) => {
    const active = isActive(to)
    return (
      <Link
        to={to}
        className={`
          group flex items-center justify-between px-4 py-3.5 rounded-2xl
          transition-all duration-300 ease-in-out
          ${active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"}
        `}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} strokeWidth={active ? 2.5 : 2} />
          <span className="font-bold tracking-tight text-sm">{label}</span>
        </div>
        {active && <ChevronRight size={14} className="opacity-70 animate-in slide-in-from-left-2" />}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* Logo Brand */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
            <span className="font-black text-xl text-white italic">Ñ</span>
          </div>
          <h2 className="text-2xl font-black tracking-tighter">
            App<span className="text-blue-500 italic">ÑSF</span>
          </h2>
        </div>

        <nav className="flex flex-col gap-1.5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4">Métricas & Gestión</p>
          
          <NavItem to="/profesor" label="Dashboard" Icon={LayoutDashboard} />
          <NavItem to="/profesor/calendario" label="Calendario" Icon={Calendar} />
          <NavItem to="/profesor/nadadores" label="Nadadores" Icon={Users} />
          
          {/* Submenú Entrenamientos */}
          <div className="flex flex-col">
            <button
              onClick={() => setShowEntrenamientos(!showEntrenamientos)}
              className={`
                group flex items-center justify-between px-4 py-3.5 rounded-2xl
                transition-all duration-300
                ${location.pathname.includes("entrenamiento") 
                  ? "bg-slate-800/50 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"}
              `}
            >
              <div className="flex items-center gap-3">
                <Dumbbell size={20} strokeWidth={2} />
                <span className="font-bold tracking-tight text-sm">Entrenamientos</span>
              </div>
              <ChevronRight 
                size={16} 
                className={`transition-transform duration-300 ${showEntrenamientos ? "rotate-90" : "opacity-40"}`} 
              />
            </button>

            {showEntrenamientos && (
              <div className="flex flex-col ml-9 mt-2 gap-1 border-l border-slate-800 pl-4 animate-in slide-in-from-top-2 duration-300">
                <Link 
                  to="/profesor/crear-entrenamiento" 
                  className={`text-[10px] font-black uppercase tracking-widest py-2.5 transition-colors ${location.pathname === "/profesor/crear-entrenamiento" ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  • Crear Nuevo
                </Link>
                <Link 
                  to="/profesor/entrenamientos" 
                  className={`text-[10px] font-black uppercase tracking-widest py-2.5 transition-colors ${location.pathname === "/profesor/entrenamientos" ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  • Ver Reportes
                </Link>
              </div>
            )}
          </div>
          
          <NavItem to="/profesor/chat" label="Mensajería" Icon={MessageSquare} />
        </nav>
      </div>

      {/* Perfil & Logout */}
      {/* Sección de Perfil y Logout con estilo moderno */}
<div className="mt-auto pt-6 px-2 space-y-4">
  {/* Card de Usuario con efecto Glassmorphism */}
  <div className="relative group overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/40 p-3 transition-all duration-300 hover:bg-slate-800/60 hover:border-slate-700/50">
    {/* Efecto de brillo de fondo al hacer hover */}
    <div className="absolute -inset-y-2 -inset-x-4 bg-blue-500/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />

    <div className="relative flex items-center gap-3">
      {/* Avatar dinámico */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 transform group-hover:scale-105 transition-transform duration-500">
          <span className="font-black text-white italic text-lg leading-none">
            {user?.nombre?.charAt(0) || user?.correo?.charAt(0).toUpperCase() || "C"}
          </span>
        </div>
        {/* Indicador de estado "Online" */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full shadow-sm" />
      </div>

      {/* Información de Usuario */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-100 truncate tracking-tight">
            {user?.nombre || user?.correo?.split('@')[0] || "Coach"}
          </span>
          <span className="text-[10px] text-slate-500 truncate font-medium lowercase tracking-wide group-hover:text-slate-400 transition-colors">
            {user?.correo || "sin sesión"}
          </span>
        </div>
        
        {/* Badge de Rol mejorado */}
        <div className="mt-1.5 flex items-center">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-500/10 text-[9px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20">
            <span className="w-1 h-1 bg-blue-400 rounded-full mr-1.5 animate-pulse" />
            Senior Coach
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Botón de Logout estilizado */}
      <button
        onClick={logout}
        className="group relative w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-transparent border border-transparent text-slate-400 hover:text-red-400 transition-all duration-300 overflow-hidden"
      >
        {/* Fondo de hover animado */}
        <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors duration-300" />
    
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all">
            <LogOut size={16} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.15em]">Salir</span>
        </div>

        <ChevronRight 
          size={14} 
          className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-red-400" 
        />
      </button>
    </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-72 bg-[#0f172a] text-white flex-col sticky top-0 h-screen p-7 z-30 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR (DRAWER) */}
      <div className={`
        fixed inset-0 z-50 lg:hidden transition-opacity duration-300
        ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <aside className={`
          absolute inset-y-0 left-0 w-80 bg-[#0f172a] text-white p-7 shadow-2xl transition-transform duration-500 ease-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-7 right-7 p-2 text-slate-500 hover:text-white"
          >
            <X size={24} />
          </button>
          <SidebarContent />
        </aside>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER RESPONSIVE */}
        <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-20 px-4 lg:px-10 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Botón Menu Móvil */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden sm:block">
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] block mb-0.5">Core Performance</span>
               <h1 className="text-sm font-black text-slate-800 uppercase italic">Admin Panel</h1>
            </div>

            {/* Logo visible solo en mobile para contexto */}
            <div className="lg:hidden flex items-center gap-2">
               <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-black text-white italic">Ñ</span>
               </div>
               <span className="font-black text-sm tracking-tighter">App<span className="text-blue-600 italic">ÑSF</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>
            </button>
            
            <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block" />
            
            <button className="flex items-center gap-3 p-1.5 pl-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group">
               <span className="text-[10px] font-black text-slate-500 uppercase hidden md:block">Perfil</span>
               <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <User size={16} />
               </div>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Animación de entrada para el contenido interno */}
            <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
              <Outlet />
            </div>
          </div>
        </main>

        {/* FOOTER MÓVIL (OPCIONAL: Para recordatorios rápidos o estado de carga) */}
        <footer className="lg:hidden bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">ÑSF Analytics 2.0</p>
           <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           </div>
        </footer>

      </div>
    </div>
  )
}

export default ProfesorLayout