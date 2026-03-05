import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getCompetenciasPorNadador } from "../../api/competencias.api"
import { useState, useMemo } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { 
  Trophy, 
  Search, 
  Calendar, 
  Filter, 
  ArrowLeft, 
  Plus, 
  Loader2, 
  Waves, 
  SortAsc, 
  SortDesc,
  ChevronRight,
  XCircle
} from "lucide-react"

const CompetenciasList = () => {
  const { id } = useParams()
  const [searchNombre, setSearchNombre] = useState("")
  const [searchFecha, setSearchFecha] = useState(null)
  const [orden, setOrden] = useState("desc")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["competencias", id],
    queryFn: () => getCompetenciasPorNadador(id),
  })

  const competencias = data?.data || []

  const competenciasProcesadas = useMemo(() => {
    let lista = [...competencias]
    if (searchNombre) {
      lista = lista.filter((c) => c.nombre.toLowerCase().includes(searchNombre.toLowerCase()))
    }
    if (searchFecha) {
      const fechaSeleccionada = searchFecha.toISOString().split("T")[0]
      lista = lista.filter((c) => new Date(c.fecha).toISOString().split("T")[0] === fechaSeleccionada)
    }
    lista.sort((a, b) => {
      const fechaA = new Date(a.fecha); const fechaB = new Date(b.fecha)
      return orden === "desc" ? fechaB - fechaA : fechaA - fechaB
    })
    return lista
  }, [competencias, searchNombre, searchFecha, orden])

  const destacada = useMemo(() => {
    if (!competencias.length) return null
    return [...competencias].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
  }, [competencias])

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER & VOLVER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link to={`/profesor/nadador/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 transition-colors">
            <ArrowLeft size={14} /> Volver al Perfil del Atleta
          </Link>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">
            Historial de <span className="text-blue-600">Torneos</span>
          </h2>
        </div>

        <Link
          to={`/profesor/nadador/${id}/competencias/nuevo`}
          className="flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          Registrar Competencia
        </Link>
      </div>

      {/* TARJETA DESTACADA: ÚLTIMO EVENTO */}
      {destacada && !searchNombre && !searchFecha && (
        <div className="relative overflow-hidden bg-[#0f172a] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <span className="bg-blue-600/30 text-blue-300 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                Evento más reciente
              </span>
              <h3 className="text-3xl font-black italic tracking-tight">{destacada.nombre}</h3>
              <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                <span className="flex items-center gap-2"><Calendar size={16} className="text-blue-500" /> {new Date(destacada.fecha).toLocaleDateString()}</span>
                <span className="flex items-center gap-2"><Waves size={16} className="text-blue-500" /> Piscina {destacada.piscina}m</span>
              </div>
            </div>
            <Link to={`/profesor/competencia/${destacada._id}/pruebas`} state={{ nadadorId: id }} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg">
              Ver Resultados
            </Link>
          </div>
        </div>
      )}

      {/* BARRA DE HERRAMIENTAS / FILTROS */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-3 flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder="Buscar torneo..."
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 placeholder:text-slate-300"
          />
        </div>
        
        <div className="w-px h-8 bg-slate-100 hidden md:block"></div>

        <div className="flex items-center px-2 w-full md:w-auto">
          <Calendar size={18} className="text-slate-300 mr-2" />
          <DatePicker
            selected={searchFecha}
            onChange={(date) => setSearchFecha(date)}
            maxDate={new Date()}
            placeholderText="Filtrar fecha"
            dateFormat="dd/MM/yyyy"
            className="bg-transparent border-none py-3 text-sm font-black text-slate-500 focus:ring-0 cursor-pointer w-full"
          />
        </div>

        <div className="w-px h-8 bg-slate-100 hidden md:block"></div>

        <div className="flex items-center px-2 w-full md:w-auto">
          {orden === "desc" ? <SortDesc size={18} className="text-blue-600 mr-2" /> : <SortAsc size={18} className="text-blue-600 mr-2" />}
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="bg-transparent border-none py-3 text-sm font-black text-slate-500 focus:ring-0 cursor-pointer uppercase"
          >
            <option value="desc">Recientes</option>
            <option value="asc">Antiguos</option>
          </select>
        </div>

        {(searchNombre || searchFecha) && (
          <button onClick={() => { setSearchNombre(""); setSearchFecha(null) }} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
            <XCircle size={20} />
          </button>
        )}
      </div>

      {/* LISTADO DE COMPETENCIAS */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-300">
          <Loader2 size={40} className="animate-spin mb-4 text-blue-100" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Consultando historial</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 text-center">
          <p className="text-red-800 font-bold">Error al sincronizar datos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {competenciasProcesadas.map((c) => (
            <div key={c._id} className="group bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                    {c.nombre}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(c.fecha).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Piscina {c.piscina}m</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/profesor/competencia/${c._id}/pruebas`}
                state={{ nadadorId: id }}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-50 text-slate-400 group-hover:bg-[#0f172a] group-hover:text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
              >
                Analizar Pruebas
                <ChevronRight size={16} />
              </Link>
            </div>
          ))}

          {competenciasProcesadas.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-sm">No se encontraron torneos en este periodo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CompetenciasList