import { useState, useMemo, useCallback, memo } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getNadadores, deleteNadador } from "../../api/profesor.api"
import { 
  UserPlus, Search, Filter, User, Edit3, Trash2, 
  Loader2, AlertCircle, Users, Target, Award, RefreshCcw
} from "lucide-react"

const Nadadores = () => {
  const queryClient = useQueryClient()
  const [categoria, setCategoria] = useState("")
  const [nombre, setNombre] = useState("")
  const [filters, setFilters] = useState({ categoria: "", nombre: "" })
  
  // Estado para saber exactamente qué ID se está eliminando y no bloquear toda la UI
  const [deletingId, setDeletingId] = useState(null)

  // 1. OBTENCIÓN DE DATOS
  const { data = [], isLoading, isError, isFetching } = useQuery({
    queryKey: ["nadadores", filters],
    queryFn: async () => {
      const res = await getNadadores(filters)
      return res.data
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  })

  // 2. ESTADÍSTICAS OPTIMIZADAS (1 solo recorrido del array usando reduce)
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

  // 3. MUTACIÓN DE ELIMINACIÓN
  const deleteMutation = useMutation({
    mutationFn: deleteNadador,
    onSuccess: () => {
      queryClient.invalidateQueries(["nadadores"])
      setDeletingId(null)
    },
    onError: () => {
      setDeletingId(null)
      alert("Hubo un error al intentar eliminar el nadador.")
    }
  })

  const handleBuscar = useCallback(() => {
    setFilters({ categoria, nombre })
  }, [categoria, nombre])

  const handleDelete = useCallback((id) => {
    if (window.confirm("¿Estás seguro de eliminar este nadador? Esta acción no se puede deshacer.")) {
      setDeletingId(id)
      deleteMutation.mutate(id)
    }
  }, [deleteMutation])

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* HEADER & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Administración de Equipo</span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter italic">
            App<span className="text-blue-600">ÑSF</span> Nadadores
          </h1>
        </div>
        
        <Link
          to="/profesor/nadadores/nuevo"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-blue-600 text-white px-7 py-4 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-slate-900/10 active:scale-95"
        >
          <UserPlus size={18} />
          <span>REGISTRAR ATLETA</span>
        </Link>
      </div>

      {/* BARRA DE ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatMiniCard label="Total Plantel" value={stats.total} icon={Users} color="blue" />
        <StatMiniCard label="Juveniles (A/B)" value={stats.juveniles} icon={Target} color="indigo" />
        <StatMiniCard label="Infantiles" value={stats.infantiles} icon={Award} color="emerald" />
        <StatMiniCard label="Mayores/Master" value={stats.mayores} icon={User} color="slate" />
      </div>

      {/* PANEL DE CONTROL DE BÚSQUEDA */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-2 flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
            className="w-full pl-12 pr-6 py-4 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 placeholder:text-slate-300 outline-none"
          />
        </div>

        <div className="h-[1px] md:h-10 w-full md:w-[1px] bg-slate-100 self-center"></div>

        <div className="flex items-center px-4 py-2 md:py-0">
          <Filter size={18} className="text-slate-300 mr-3 shrink-0" />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full md:w-auto bg-transparent border-none py-2 text-sm font-black text-slate-500 focus:ring-0 cursor-pointer uppercase tracking-wider outline-none"
          >
            <option value="">Todas</option>
            <option value="Infantil">Infantil</option>
            <option value="JA">Juvenil A</option>
            <option value="JB">Juvenil B</option>
            <option value="Mayores">Mayores</option>
          </select>
        </div>

        <button
          onClick={handleBuscar}
          disabled={isFetching}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white px-8 py-4 md:py-0 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95"
        >
          {isFetching ? <RefreshCcw size={14} className="animate-spin" /> : "Filtrar"}
        </button>
      </div>

      {/* LISTADO */}
      {isLoading ? (
        <div className="py-20 md:py-32 flex flex-col items-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando equipo...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 p-8 md:p-12 rounded-[2rem] text-center border border-red-100">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-800 font-bold text-sm md:text-base">Error al sincronizar con el servidor.</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-xs font-black text-red-600 bg-red-100 hover:bg-red-200 px-6 py-3 rounded-xl uppercase transition-colors">
            Reintentar
          </button>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {data.length > 0 ? (
            data.map((n) => (
              <div
                key={n._id}
                className="group bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 -mr-8 -mt-8 rounded-full transition-all group-hover:scale-150 duration-700 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:-rotate-6 transition-all duration-300 shadow-inner text-xl font-black uppercase">
                      {n.user?.nombre?.charAt(0) || '?'}
                    </div>
                    <div className="bg-slate-50 px-3 py-1.5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {n.categoria || 'Sin Cat.'}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors truncate">
                      {n.user?.nombre} {n.apellido}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                       <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                         RUT: {n.rut || 'N/A'}
                       </span>
                       {n.user?.correo && (
                         <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]" title={n.user.correo}>
                           {n.user.correo}
                         </span>
                       )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="relative z-10 flex items-center gap-2 pt-5 border-t border-slate-50 mt-auto">
                  <Link
                    to={`/profesor/nadador/${n._id}`}
                    className="flex-1 bg-slate-50 hover:bg-[#0f172a] text-slate-600 hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all active:scale-95"
                  >
                    Ver Perfil
                  </Link>
                  
                  <Link
                    to={`/profesor/nadadores/editar/${n._id}`}
                    className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all active:scale-90"
                    title="Editar"
                  >
                    <Edit3 size={16} />
                  </Link>

                  <button
                    onClick={() => handleDelete(n._id)}
                    disabled={deletingId === n._id}
                    className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all active:scale-90 disabled:opacity-50"
                    title="Eliminar"
                  >
                    {deletingId === n._id ? <Loader2 size={16} className="animate-spin text-red-500" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 md:py-20 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
               <Users className="mx-auto text-slate-300 mb-4" size={40} />
               <p className="text-slate-500 font-bold text-sm">No se encontraron nadadores con esos filtros.</p>
               <button onClick={() => {setNombre(""); setCategoria(""); handleBuscar()}} className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">
                 Limpiar Filtros
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const StatMiniCard = memo(({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    slate: "text-slate-600 bg-slate-50"
  }
  return (
    <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
      <div className={`p-2.5 sm:p-3 rounded-xl ${colors[color]}`}>
        <Icon size={18} className="sm:w-5 sm:h-5" />
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-black text-slate-800 leading-none tabular-nums">{value}</p>
        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
      </div>
    </div>
  )
})

export default Nadadores