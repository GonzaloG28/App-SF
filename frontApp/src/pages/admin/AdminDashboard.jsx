import { useQuery }  from "@tanstack/react-query"
import { Link }      from "react-router-dom"
import api           from "../../api/axios"   // ← import faltante
import {
  Users, UserCheck, Calendar,
  ChevronRight, CheckCircle2, AlertCircle, Loader2
} from "lucide-react"

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn:  () => api.get("/admin/stats").then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-blue-600" size={36} />
    </div>
  )

  const cards = [
    {
      label:   "Nadadores Competitivos",
      total:   stats?.competitivos?.total   || 0,
      pagados: stats?.competitivos?.pagados || 0,
      impagos: stats?.competitivos?.impagos || 0,
      icon:    Users,
      color:   "blue",
      to:      "/admin/nadadores"
    },
    {
      label:   "Rama Formativa",
      total:   stats?.formativos?.total   || 0,
      pagados: stats?.formativos?.pagados || 0,
      impagos: stats?.formativos?.impagos || 0,
      icon:    UserCheck,
      color:   "green",
      to:      "/admin/formativos"
    }
  ]

  return (
    <div className="space-y-6 pb-8">
      <div>
        <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Club ÑSF</p>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
          Panel de <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">Control</span>
        </h1>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatBig label="Total Miembros"       value={stats?.totalMiembros || 0}         color="slate"  />
        <StatBig label="Convocatorias Activas" value={stats?.convocatoriasActivas || 0} color="blue"   />
        <StatBig label="Pagos Pendientes"     value={(stats?.competitivos?.impagos || 0) + (stats?.formativos?.impagos || 0)} color="orange" />
      </div>

      {/* Cards de grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((card) => (
          <Link key={card.label} to={card.to}
            className="bg-white rounded-2xl md:rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-start justify-between mb-5">
              <div className={`p-3 rounded-2xl ${card.color === "blue" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                <card.icon size={22} />
              </div>
              <ChevronRight size={18} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <p className="text-4xl font-black text-slate-900 italic mb-5">{card.total}</p>
            <div className="flex gap-3 flex-wrap">
              <PagoBadge tipo="pagado" cantidad={card.pagados} />
              <PagoBadge tipo="impago" cantidad={card.impagos} />
            </div>
          </Link>
        ))}
      </div>

      {/* Acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickLink to="/admin/nadadores"     icon={Users}     label="Gestionar Pagos Nadadores" />
        <QuickLink to="/admin/convocatorias" icon={Calendar}  label="Ver Convocatorias Activas"    />
      </div>
    </div>
  )
}

const StatBig = ({ label, value, color }) => {
  const colors = {
    slate:  "bg-slate-50 text-slate-900",
    blue:   "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700"
  }
  return (
    <div className={`rounded-2xl p-5 ${colors[color]}`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-3xl font-black italic">{value}</p>
    </div>
  )
}

const PagoBadge = ({ tipo, cantidad }) => (
  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
    tipo === "pagado"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-orange-50 text-orange-700 border-orange-100"
  }`}>
    {tipo === "pagado" ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
    {cantidad} {tipo === "pagado" ? "Pagados" : "Pendientes"}
  </div>
)

const QuickLink = ({ to, icon: Icon, label }) => (
  <Link to={to} className="group flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all">
        <Icon size={18} />
      </div>
      <span className="font-black text-slate-700 text-[11px] uppercase tracking-wider">{label}</span>
    </div>
    <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
  </Link>
)
