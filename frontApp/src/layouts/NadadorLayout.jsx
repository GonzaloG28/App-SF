import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { useAuth } from "../context/AutHContext";
import { 
  LayoutDashboard, 
  Trophy, 
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Waves, 
  ChevronRight, 
  Activity, 
  ClipboardList
} from "lucide-react";

const NadadorLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Obtener perfil del nadador
  const { data: perfil, isLoading } = useQuery({
    queryKey: ["miPerfilHeader"],
    queryFn: async () => {
      const res = await api.get("/nadadores/perfil");
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userName = perfil?.user?.nombre || "Atleta";
  const userEmail = perfil?.user?.correo || "cargando...";
  const initials = userName.substring(0, 2).toUpperCase();

  const menuItems = [
    { path: "/nadador/dashboard", icon: LayoutDashboard, label: "Mi Panel" },
    { path: "/nadador/entrenamientos", icon: ClipboardList, label: "Entrenamientos" },
    { path: "/nadador/mis-tiempos", icon: Waves, label: "Mis Marcas" },
    { path: "/nadador/competencias", icon: Trophy, label: "Competencias" },
    { path: "/nadador/perfil", icon: User, label: "Ficha Técnica" },
  ];

  // Componente reutilizable para los enlaces de navegación
  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = location.pathname.startsWith(item.path);

    return (
      <Link
        to={item.path}
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
          <span className="font-bold tracking-tight text-sm">{item.label}</span>
        </div>
        {active && <ChevronRight size={14} className="opacity-70 animate-in slide-in-from-left-2" />}
      </Link>
    );
  };

  // Contenido del Sidebar centralizado (para Desktop y Mobile)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* Logo Brand */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
            <span className="font-black text-xl text-white italic">Ñ</span>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter leading-none">
              App<span className="text-blue-500 italic">ÑSF</span>
            </h2>
            <span className="text-[8px] uppercase tracking-[0.3em] text-blue-400 font-black">Atleta Edition</span>
          </div>
        </div>

        {/* Widget de Estado Minimalista */}
        <div className="mb-6 px-2">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Activity size={12} strokeWidth={3} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Estado</p>
                <p className="text-xs font-black text-white">Activo</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-4">Rendimiento</p>
          {menuItems.map((item) => <NavItem key={item.path} item={item} />)}
        </nav>
      </div>

      {/* Sección de Perfil y Logout con Glassmorphism */}
      <div className="mt-auto pt-6 px-2 space-y-4">
        <div className="relative group overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/40 p-3 transition-all duration-300 hover:bg-slate-800/60 hover:border-slate-700/50">
          <div className="absolute -inset-y-2 -inset-x-4 bg-blue-500/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />
          
          <div className="relative flex items-center gap-3">
            <div className="relative shrink-0">
              {isLoading ? (
                <div className="w-11 h-11 rounded-xl bg-slate-800 animate-pulse" />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 transform group-hover:scale-105 transition-transform duration-500">
                  <span className="font-black text-white italic text-lg leading-none">{initials}</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
                  <div className="h-2 w-24 bg-slate-800 rounded animate-pulse" />
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-100 truncate tracking-tight">{userName}</span>
                  <span className="text-[10px] text-slate-500 truncate font-medium lowercase tracking-wide">
                    {userEmail}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="group relative w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-transparent border border-transparent text-slate-400 hover:text-red-400 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all">
              <LogOut size={16} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.15em]">Salir</span>
          </div>
          <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-red-400" />
        </button>
      </div>
    </div>
  );

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
        {/* Backdrop oscuro */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Panel lateral móvil */}
        <aside className={`
          absolute inset-y-0 left-0 w-80 bg-[#0f172a] text-white p-7 shadow-2xl transition-transform duration-500 ease-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-7 right-7 p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <SidebarContent />
        </aside>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER TOP BAR */}
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
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] block mb-0.5">Centro de Atletas</span>
               <h1 className="text-sm font-black text-slate-800 uppercase italic">
                 {isLoading ? "Cargando perfil..." : `Hola, ${userName.split(" ")[0]}`}
               </h1>
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
              <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL (OUTLET) */}
        <main className="flex-1 p-4 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Animación de entrada suave para las vistas */}
            <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
              <Outlet />
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default NadadorLayout;