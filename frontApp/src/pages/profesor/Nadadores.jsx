import { useState, useMemo } from "react"
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

  // 1. OBTENCIÓN DE DATOS CON "KEEP PREVIOUS DATA"
  const { data = [], isLoading, isError, isFetching } = useQuery({
    queryKey: ["nadadores", filters],
    queryFn: async () => {
      const res = await getNadadores(filters)
      return res.data
    },
    keepPreviousData: true, // Evita que las cards desaparezcan al filtrar
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  })

  // 2. ESTADÍSTICAS CALCULADAS
  const stats = useMemo(() => {
    return {
      total: data.length,
      juveniles: data.filter(n => n.categoria?.startsWith("J")).length,
      infantiles: data.filter(n => n.categoria === "Infantil").length,
      mayores: data.filter(n => n.categoria === "Mayores").length
    }
  }, [data])

  // 3. MUTACIÓN DE ELIMINACIÓN
  const deleteMutation = useMutation({
    mutationFn: deleteNadador,
    onSuccess: () => {
      queryClient.invalidateQueries(["nadadores"])
      // Podrías añadir una notificación de éxito aquí
    },
  })

  const handleBuscar = () => setFilters({ categoria, nombre })

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este nadador? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER & CTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Administración de Equipo</span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">
            App<span className="text-blue-600">ÑSF</span> Nadadores
          </h1>
        </div>
        
        <Link
          to="/profesor/nadadores/nuevo"
          className="flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-blue-600 text-white px-7 py-4 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-slate-900/10 group active:scale-95"
        >
          <UserPlus size={18} />
          <span>REGISTRAR ATLETA</span>
        </Link>
      </div>

      {/* BARRA DE ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatMiniCard label="Total Plantel" value={stats.total} icon={Users} color="blue" />
        <StatMiniCard label="Juveniles (A/B)" value={stats.juveniles} icon={Target} color="indigo" />
        <StatMiniCard label="Infantiles" value={stats.infantiles} icon={Award} color="emerald" />
        <StatMiniCard label="Mayores/Master" value={stats.mayores} icon={User} color="slate" />
      </div>

      {/* PANEL DE CONTROL DE BÚSQUEDA */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-2 flex flex-col md:flex-row gap-2 relative">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
            className="w-full pl-14 pr-6 py-4 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 placeholder:text-slate-300"
          />
        </div>

        <div className="h-10 w-[1px] bg-slate-100 hidden md:block self-center"></div>

        <div className="flex items-center px-4">
          <Filter size={18} className="text-slate-300 mr-3" />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="bg-transparent border-none py-4 text-sm font-black text-slate-500 focus:ring-0 cursor-pointer uppercase tracking-wider"
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
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-10 py-4 rounded-[1.8rem] font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          {isFetching ? <RefreshCcw size={14} className="animate-spin" /> : "Filtrar"}
        </button>
      </div>

      {/* LISTADO */}
      {isLoading ? (
        <div className="py-32 flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-blue-100 mb-4" strokeWidth={1} />
          <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando equipo...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 p-12 rounded-[3rem] text-center border border-red-100">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-800 font-bold">Error al sincronizar con el servidor.</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-xs font-black text-red-600 bg-red-100 px-4 py-2 rounded-xl uppercase">Reintentar</button>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {data.length > 0 ? (
            data.map((n) => (
              <div
                key={n._id}
                className="group bg-white rounded-[2.8rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 relative flex flex-col justify-between overflow-hidden"
              >
                {/* Indicador visual de rol */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 -mr-8 -mt-8 rounded-full transition-all group-hover:scale-150 duration-700" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner text-2xl font-black uppercase">
                      {n.user?.nombre?.charAt(0)}
                    </div>
                    <div className="bg-slate-50 px-4 py-1.5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {n.categoria || 'Sin Cat.'}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                      {n.user?.nombre} {n.apellido}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter bg-slate-50 px-2 py-0.5 rounded">RUT: {n.rut || '---'}</span>
                       {n.user?.correo && <span className="text-[10px] text-slate-300 font-medium truncate max-w-[150px]">{n.user.correo}</span>}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="relative z-10 flex items-center gap-3 pt-6 border-t border-slate-50">
                  <Link
                    to={`/profesor/nadador/${n._id}`}
                    className="flex-1 bg-[#0f172a] text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                  >
                    Ver Perfil
                  </Link>
                  
                  <Link
                    to={`/profesor/nadadores/editar/${n._id}`}
                    className="p-3.5 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-all active:scale-90"
                  >
                    <Edit3 size={18} />
                  </Link>

                  <button
                    onClick={() => handleDelete(n._id)}
                    disabled={deleteMutation.isLoading}
                    className="p-3.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all active:scale-90 disabled:opacity-50"
                  >
                    {deleteMutation.isLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
               <Users className="mx-auto text-slate-200 mb-4" size={48} />
               <p className="text-slate-400 font-bold italic">No se encontraron nadadores con esos filtros.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente auxiliar optimizado
const StatMiniCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    slate: "text-slate-600 bg-slate-50"
  }
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-2xl ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 leading-none tabular-nums">{value}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  )
}

export default Nadadores