import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react" // Añadido useRef
import { useQuery } from "@tanstack/react-query"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
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
  ClipboardList
} from "lucide-react"

const NadadorLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estados para menús y notificaciones
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Sincronizar cierre de menús al navegar
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
  }, [location]);

  // Cerrar notificaciones al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lógica de datos (React Query)
  const { data: perfil, isLoading } = useQuery({
    queryKey: ["miPerfilHeader"],
    queryFn: async () => {
      const res = await api.get("/nadadores/perfil");
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userName = perfil?.user?.nombre || "Atleta";
  const userLastName = perfil?.apellido || "";
  const userEmail = perfil?.user?.correo || "cargando...";

  const isActive = (path) => location.pathname.startsWith(path);

  const NavItem = ({ to, label, Icon }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`
          group flex items-center justify-between px-4 py-3.5 rounded-2xl
          transition-all duration-500 ease-out mb-1.5
          ${active
            ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
            : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}
        `}
      >
        <div className="flex items-center gap-3">
          <Icon size={19} strokeWidth={active ? 2.5 : 2} className={active ? "animate-pulse" : "group-hover:scale-110 transition-transform"} />
          <span className="font-bold tracking-tight text-sm">{label}</span>
        </div>
        {active && <ChevronRight size={14} className="opacity-70 animate-in slide-in-from-left-2" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 shrink-0">
            <Waves size={20} className="text-white" />
          </div>
          <div>
            <p className="text-green-600 text-[8px] font-black uppercase tracking-[0.3em] leading-none mb-0.5">Atleta</p>
            <h2 className="text-xl font-black tracking-tighter text-slate-900">
              App<span className="text-blue-600 italic">ÑSF</span>
            </h2>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Rendimiento</p>
          <NavItem to="/nadador/dashboard" label="Mi Panel" Icon={LayoutDashboard} />
          <NavItem to="/nadador/entrenamientos" label="Entrenamientos" Icon={ClipboardList} />
          <NavItem to="/nadador/mis-tiempos" label="Mis Marcas" Icon={Waves} />
          <NavItem to="/nadador/competencias" label="Competencias" Icon={Trophy} />
          <NavItem to="/nadador/perfil" label="Ficha Técnica" Icon={User} />
        </nav>
      </div>

      <div className="mt-auto pt-6 px-1 space-y-3">
        <div className="relative group overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-3 transition-all duration-300 hover:shadow-md">
          <div className="relative flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                <span className="font-black text-white italic text-base">{userName.charAt(0)}</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black text-slate-900 block truncate uppercase italic leading-none">
                {isLoading ? "..." : userName.split(" ")[0]}
              </span>
              <span className="text-[10px] text-slate-400 font-bold truncate block mt-0.5">{userEmail}</span>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300">
          <div className="flex items-center gap-3">
            <LogOut size={18} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-widest">Cerrar Sesión</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-900">
      
      <aside className="hidden lg:flex w-72 bg-white text-slate-900 flex-col sticky top-0 h-screen p-6 z-30 border-r border-slate-100">
        <SidebarContent />
      </aside>

      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-72 bg-white p-6 shadow-2xl transition-transform duration-500 ease-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
          <SidebarContent />
        </aside>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-6 lg:px-10 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 transition-colors"><Menu size={20} /></button>
            <div className="hidden sm:block">
               <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.3em] block mb-0.5 leading-none">Centro de Atletas</span>
               <h1 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">
                 {isLoading ? "Cargando..." : `Hola, ${userName.split(" ")[0]}`}
               </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* --- NOTIFICACIONES --- */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 transition-all group rounded-xl ${
                  showNotifications ? "text-orange-600 bg-orange-50" : "text-slate-400 hover:text-orange-500 hover:bg-orange-50"
                }`}
              >
                <Bell size={20} className={`${showNotifications ? "" : "group-hover:rotate-12"} transition-transform`} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-600 rounded-full border-2 border-white"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Notificaciones</h3>
                    <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded-full">Actualizado</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2 text-center py-8">
                     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Bell size={20} className="text-slate-300" />
                     </div>
                     <p className="text-xs font-bold text-slate-400">Sin nuevos avisos</p>
                  </div>
                  <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-t border-slate-50 transition-colors">
                    Ver historial completo
                  </button>
                </div>
              )}
            </div>

            <div className="h-6 w-[1px] bg-slate-100 mx-2" />

            {/* --- USER TOOLTIP --- */}
            <div className="relative group">
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl z-50 animate-in fade-in slide-in-from-top-1">
                {isLoading ? "Cargando..." : `${userName} ${userLastName}`}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900"></div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600/10 to-green-500/10 text-blue-600 flex items-center justify-center border border-blue-100 cursor-help transition-transform active:scale-95 group-hover:border-blue-200">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default NadadorLayout;