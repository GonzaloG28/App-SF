import { useState, useMemo, useCallback, memo } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getNadadores, deleteNadador } from "../../api/profesor.api"
import {
  UserPlus, Search, Filter, User, Edit3, Trash2,
  Loader2, AlertCircle, Users, Target, Award, RefreshCcw,
  ChevronRight
} from "lucide-react"

const Nadadores = () => {
  const queryClient = useQueryClient()
  const [categoria, setCategoria] = useState("")
  const [nombre, setNombre] = useState("")
  const [filters, setFilters] = useState({ categoria: "", nombre: "" })
  const [deletingId, setDeletingId] = useState(null)

  const { data = [], isLoading, isError, isFetching } = useQuery({
    queryKey: ["nadadores", filters],
    queryFn: async () => {
      const res = await getNadadores(filters)
      return res.data
    },
    // FIX #12: keepPreviousData deprecado en TanStack Query v5 → placeholderData
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  })

  const stats = useMemo(() => {
    return data.reduce(
      (acc, n) => {
        acc.total++
        if (n.categoria?.startsWith("J")) acc.juveniles++
        else if (n.categoria === "Infantil") acc.infantiles++
        else if (n.categoria === "Mayores") acc.mayores++
        return acc
      },
      { total: 0, juveniles: 0, infantiles: 0, mayores: 0 }
    )
  }, [data])

  const deleteMutation = useMutation({
    mutationFn: deleteNadador,
    onSuccess: () => {
      queryClient.invalidateQueries(["nadadores"])
      setDeletingId(null)
    },
    onError: () => {
      setDeletingId(null)
      alert("Error al eliminar. Intenta de nuevo.")
    }
  })

  const handleBuscar = useCallback(() => {
    setFilters({ categoria, nombre })
  }, [categoria, nombre])

  const handleDelete = useCallback((id) => {
    if (window.confirm("¿Eliminar este atleta permanentemente?")) {
      setDeletingId(id)
      deleteMutation.mutate(id)
    }
  }, [deleteMutation])

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-1 w-10 bg-blue-600 rounded-full" />
            <p className="text-blue-600 text-[12px] font-black uppercase tracking-[0.4em]">Gestión de Plantel</p>
          </div>
          {/* FIX #10: text-5x1 (typo) → text-5xl */}
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-[0.85]">
            Team <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">ÑSF</span>
          </h1>
        </div>

        <Link
          to="/profesor/nadadores/nuevo"
          className="group relative inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <UserPlus size={18} className="relative z-10 group-hover:rotate-12 transition-transform" />
          <span className="relative z-10">Registrar Atleta</span>
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMiniCard label="Total Plantel" value={stats.total}     icon={Users}  color="blue"   />
        <StatMiniCard label="Juveniles"     value={stats.juveniles} icon={Target} color="green"  />
        <StatMiniCard label="Infantiles"    value={stats.infantiles}icon={Award}  color="orange" />
        <StatMiniCard label="Mayores"       value={stats.mayores}   icon={User}   color="slate"  />
      </div>

      {/* BUSCADOR */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-2.5 flex flex-col md:flex-row gap-2 sticky top-4 z-40 transition-all hover:shadow-blue-900/10">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
          {/* FIX #8: pl-15 no existe en Tailwind → pl-14 */}
          <input
            type="text"
            placeholder="BUSCAR NADADOR POR NOMBRE..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            className="w-full pl-14 pr-6 py-4 bg-transparent border-none text-[11px] font-black text-slate-700 focus:ring-0 placeholder:text-slate-300 uppercase tracking-widest"
          />
        </div>

        <div className="hidden md:block w-px h-10 bg-slate-100 self-center mx-2" />

        <div className="flex items-center bg-slate-50/50 rounded-2xl px-6 py-2 md:py-0 border border-transparent focus-within:border-blue-100 transition-all">
          <Filter size={16} className="text-blue-500 mr-3" />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="bg-transparent border-none py-3 text-[10px] font-black text-slate-600 focus:ring-0 cursor-pointer uppercase tracking-widest min-w-[140px]"
          >
            <option value="">Categorías</option>
            <option value="Infantil">Infantil</option>
            <option value="JA">Juvenil A</option>
            <option value="JB">Juvenil B</option>
            <option value="Mayores">Mayores</option>
          </select>
        </div>

        <button
          onClick={handleBuscar}
          disabled={isFetching}
          className="bg-blue-600 hover:bg-green-500 disabled:bg-slate-300 text-white px-10 py-5 md:py-0 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 min-w-[160px]"
        >
          {isFetching ? <RefreshCcw size={16} className="animate-spin" /> : "Actualizar"}
        </button>
      </div>

      {/* GRID */}
      {isLoading ? (
        <LoadingUI />
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-500 ${isFetching ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          {data.length > 0 ? (
            data.map((n) => (
              <AthleteCard
                key={n._id}
                nadador={n}
                onDelete={handleDelete}
                isDeleting={deletingId === n._id}
              />
            ))
          ) : (
            <EmptyState onReset={() => { setNombre(""); setCategoria(""); setFilters({ categoria: "", nombre: "" }) }} />
          )}
        </div>
      )}
    </div>
  )
}

const AthleteCard = ({ nadador, onDelete, isDeleting }) => (
  <div className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between overflow-hidden relative">
    <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors duration-500" />

    <div className="relative z-10">
      <div className="flex items-start justify-between mb-8">
        <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center text-2xl font-black italic shadow-lg group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-500">
          {nadador.user?.nombre?.charAt(0) || "N"}
        </div>
        <div className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100 text-[9px] font-black uppercase tracking-widest">
          {nadador.categoria || "S/C"}
        </div>
      </div>

      <div className="space-y-1 mb-8">
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none group-hover:text-blue-600 transition-colors truncate">
          {nadador.user?.nombre} {nadador.apellido}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          RUT {nadador.rut || "N/A"} <span className="h-1 w-1 bg-slate-200 rounded-full" /> {nadador.edad} años
        </p>
      </div>
    </div>

    <div className="relative z-10 flex items-center gap-2 pt-6 border-t border-slate-50">
      <Link
        to={`/profesor/nadador/${nadador._id}`}
        className="flex-1 bg-slate-50 hover:bg-slate-900 text-slate-500 hover:text-white h-12 flex items-center justify-center rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
      >
        Ver Perfil
      </Link>
      <Link
        to={`/profesor/nadadores/editar/${nadador._id}`}
        className="w-12 h-12 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center rounded-2xl transition-all hover:rotate-12"
        title="Editar"
      >
        <Edit3 size={18} />
      </Link>
      <button
        onClick={() => onDelete(nadador._id)}
        disabled={isDeleting}
        className="w-12 h-12 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center rounded-2xl transition-all disabled:opacity-50"
      >
        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
      </button>
    </div>
  </div>
)

const StatMiniCard = memo(({ label, value, icon: Icon, color }) => {
  const themes = {
    blue:   "text-blue-600 bg-blue-50 border-blue-100 shadow-blue-500/5",
    green:  "text-green-600 bg-green-50 border-green-100 shadow-green-500/5",
    orange: "text-orange-600 bg-orange-50 border-orange-100 shadow-orange-500/5",
    slate:  "text-slate-600 bg-slate-50 border-slate-100 shadow-slate-500/5"
  }
  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col items-start gap-4 hover:shadow-xl transition-all group ${themes[color]}`}>
      <div className={`p-3 rounded-2xl ${themes[color]} border shadow-inner group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 leading-none tabular-nums italic">{value}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
      </div>
    </div>
  )
})

const LoadingUI = () => (
  <div className="py-32 flex flex-col items-center">
    <div className="relative w-20 h-20 mb-6">
      <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
      <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Sincronizando Base de Datos...</p>
  </div>
)

const EmptyState = ({ onReset }) => (
  <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
      <Users size={32} />
    </div>
    <h3 className="text-lg font-black text-slate-900 uppercase italic">Sin coincidencias</h3>
    <button onClick={onReset} className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full transition-colors">
      Restablecer Búsqueda
    </button>
  </div>
)

export default Nadadores
