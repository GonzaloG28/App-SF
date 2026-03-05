import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Trophy, User, LogOut, 
  Bell, Menu, X, Loader2, Waves, ChevronRight, Activity, ClipboardList
} from "lucide-react";
import { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { AuthContext } from "../context/authContext";

const NadadorLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Datos del perfil para la identidad del layout
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

  const getInitials = () => {
    if (!perfil?.user?.nombre) return "??";
    return perfil.user.nombre.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  // Definición de ítems del menú con estilo similar al profesor
  const menuItems = [
    { path: "/nadador/dashboard", icon: LayoutDashboard, label: "Mi Panel" },
    { path: "/nadador/entrenamientos", icon: ClipboardList, label: "Entrenamientos" },
    { path: "/nadador/mis-tiempos", icon: Waves, label: "Mis Marcas" },
    { path: "/nadador/competencias", icon: Trophy, label: "Competencias" },
    { path: "/nadador/perfil", icon: User, label: "Ficha Técnica" },
  ];

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`
          group flex items-center justify-between px-4 py-3.5 rounded-2xl
          transition-all duration-300 ease-in-out
          ${active 
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
            : "text-slate-400 hover:bg-slate-50 hover:text-blue-600"}
        `}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} strokeWidth={active ? 2.5 : 2} />
          <span className="font-bold tracking-tight text-xs uppercase">{item.label}</span>
        </div>
        {active && <ChevronRight size={16} className="opacity-70" />}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col justify-between p-7 sticky top-0 h-screen z-20">
        <div>
          {/* Logo Brand */}
          <div className="mb-12 px-2">
            <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">
              APP<span className="text-blue-600 font-black">ÑSF</span>
              <span className="block text-[8px] uppercase tracking-[0.4em] text-slate-400 not-italic font-black mt-1">
                Atleta Edition
              </span>
            </h1>
          </div>

          <nav className="flex flex-col gap-2">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 ml-2">Menú Atleta</p>
            {menuItems.map(renderNavItem)}
          </nav>

          {/* Widget de Estado (Opcional, muy visual) */}
          <div className="mt-10 p-5 bg-blue-50 rounded-[2rem] border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                 <Activity size={14} />
               </div>
               <span className="text-[10px] font-black text-blue-900 uppercase">Estado</span>
            </div>
            <p className="text-xs font-bold text-blue-800">Nadador Activo</p>
            <p className="text-[9px] text-blue-400 font-medium mt-1">Temporada 2026</p>
          </div>
        </div>

        {/* Footer Sidebar / Logout */}
        <div className="pt-6 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="group w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-white border-b border-slate-100 p-6 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-black italic text-slate-900 uppercase">ÑSF <span className="text-blue-600">Atleta</span></h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-50 rounded-xl text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* MAIN CONTENT & TOP BAR */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR DESKTOP */}
        <header className="hidden md:flex bg-white/70 backdrop-blur-xl sticky top-0 z-10 px-10 py-6 border-b border-slate-100 justify-between items-center">
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Rendimiento Deportivo</span>
            <h1 className="text-lg font-black text-slate-800 italic uppercase tracking-tighter">
              {isLoading ? "..." : `Hola, ${perfil?.user?.nombre.split(" ")[0]}`}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
              <Bell size={20} />
              <span className="absolute top-3 right-3.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs italic shadow-lg shadow-blue-100">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : getInitials()}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-800 leading-none uppercase">{perfil?.user?.nombre}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{perfil?.user?.rol || "Nadador"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO DE LAS VISTAS */}
        <main className="flex-1 p-6 md:p-10 lg:p-14">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden bg-white p-8 animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-2xl font-black italic text-slate-900 uppercase">ÑSF <span className="text-blue-600">Atleta</span></h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-xl"><X size={24} /></button>
          </div>
          <nav className="space-y-4">
            {menuItems.map(renderNavItem)}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-5 text-red-500 font-black italic uppercase border-t border-slate-100 mt-8"
            >
              <LogOut size={20} /> Cerrar Sesión
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default NadadorLayout;