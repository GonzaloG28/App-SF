import { Link, Outlet, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import {
  LayoutDashboard, Users, Calendar,
  LogOut, Menu, X, Waves, ChevronRight, Shield, MessageSquare
} from "lucide-react"

const AdminLayout = () => {
  const { logout, user } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => { setIsMobileMenuOpen(false) }, [location])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isMobileMenuOpen])

  const nav = [
    { to: "/admin",              label: "Dashboard",      Icon: LayoutDashboard, exact: true },
    { to: "/admin/nadadores",    label: "Nadadores",      Icon: Users            },
    { to: "/admin/chat",         label: "Mensajes",       Icon: MessageSquare    },
    { to: "/admin/convocatorias",label: "Convocatorias",  Icon: Calendar         },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* Logo */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg rotate-3 shrink-0">
            <Waves size={20} className="text-white" />
          </div>
          <div>
            <p className="text-orange-500 text-[8px] font-black uppercase tracking-[0.3em] leading-none mb-0.5">Administración</p>
            <h2 className="text-xl font-black tracking-tighter text-slate-900">App<span className="text-blue-600 italic">ÑSF</span></h2>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Panel Admin</p>
          {nav.map(({ to, label, Icon, exact }) => {
            const active = exact
              ? location.pathname === to
              : location.pathname.startsWith(to)
            return (
              <Link key={to} to={to}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out mb-1.5 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={19} strokeWidth={active ? 2.5 : 2} className={active ? "" : "group-hover:scale-110 transition-transform"} />
                  <span className="font-bold tracking-tight text-sm">{label}</span>
                </div>
                {active && <ChevronRight size={14} className="opacity-70" />}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 px-1 space-y-3">
        <div className="relative group overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-3 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Shield size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black text-slate-900 block truncate uppercase italic leading-none">{user?.nombre || "Admin"}</span>
              <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Administrador</span>
            </div>
          </div>
        </div>
        <button onClick={logout} className="group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300">
          <div className="flex items-center gap-3">
            <LogOut size={18} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-widest">Cerrar Sesión</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFDFD] font-sans text-slate-900">

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 bg-white flex-col overflow-y-auto p-6 z-30 border-r border-slate-100">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 z-[200] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-72 bg-white p-6 shadow-2xl transition-transform duration-500 ease-out overflow-y-auto ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
          <SidebarContent />
        </aside>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-md z-20 px-6 lg:px-10 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-orange-50 transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.3em] block mb-0.5 leading-none">Club ÑSF</span>
              <h1 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">Panel Administrativo</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <Shield size={16} />
            </div>
          </div>
        </header>

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

export default AdminLayout
