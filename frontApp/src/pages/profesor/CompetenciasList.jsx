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
  ArrowLeft, 
  Plus, 
  Loader2, 
  Waves, 
  SortAsc, 
  SortDesc,
  ChevronRight,
  XCircle,
  TrendingUp
} from "lucide-react"

const CompetenciasList = () => {
  const { id } = useParams()
  const [searchNombre, setSearchNombre] = useState("")
  const [searchFecha, setSearchFecha] = useState(null)
  const [orden, setOrden] = useState("desc")

  // 1. QUERY CON PREFETCH LOGIC (Opcional pero recomendado)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["competencias", id],
    queryFn: () => getCompetenciasPorNadador(id),
    staleTime: 1000 * 60 * 5, // 5 minutos de validez
  })

  const competencias = data?.data || []

  // 2. FILTRADO Y ORDENAMIENTO MEMOIZADO (Alta Eficiencia)
  const competenciasProcesadas = useMemo(() => {
    return [...competencias]
      .filter((c) => {
        const matchesNombre = c.nombre.toLowerCase().includes(searchNombre.toLowerCase())
        const matchesFecha = !searchFecha || 
          new Date(c.fecha).toDateString() === searchFecha.toDateString()
        return matchesNombre && matchesFecha
      })
      .sort((a, b) => {
        const diff = new Date(a.fecha) - new Date(b.fecha)
        return orden === "desc" ? -diff : diff
      })
  }, [competencias, searchNombre, searchFecha, orden])

  // 3. IDENTIFICACIÓN DE EVENTO RECIENTE
  const destacada = useMemo(() => {
    if (!competencias.length) return null
    return [...competencias].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
  }, [competencias])

  if (isLoading) return (
    <div className="py-40 flex flex-col items-center justify-center text-slate-400">
      <div className="relative mb-6">
        <Loader2 size={50} className="animate-spin text-blue-600" />
        <Trophy size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-200" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando Cronología...</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/50 p-2 rounded-[3rem]">
        <div className="pl-4">
          <Link to={`/profesor/nadador/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 transition-all hover:-translate-x-1">
            <ArrowLeft size={14} /> Ficha del Atleta
          </Link>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">
            Bitácora de <span className="text-blue-600">Torneos</span>
          </h2>
        </div>

        <Link
          to={`/profesor/nadador/${id}/competencias/nuevo`}
          className="flex items-center justify-center gap-3 bg-[#0f172a] hover:bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/20 group active:scale-95"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Registrar Competencia
        </Link>
      </div>

      {/* HIGHLIGHT: ÚLTIMA PARTICIPACIÓN */}
      {destacada && !searchNombre && !searchFecha && (
        <div className="group relative overflow-hidden bg-[#0f172a] rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl transition-all duration-500 hover:shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-blue-600/20 transition-colors"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
                  Última Actuación
                </span>
                <TrendingUp size={16} className="text-emerald-400 animate-bounce" />
              </div>
              <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-tight max-w-xl">
                {destacada.nombre}
              </h3>
              <div className="flex flex-wrap items-center gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <Calendar size={16} className="text-blue-400" /> 
                  {new Date(destacada.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <Waves size={16} className="text-blue-400" /> 
                  Piscina {destacada.piscina}m
                </span>
              </div>
            </div>
            <Link 
              to={`/profesor/competencia/${destacada._id}/pruebas`} 
              state={{ nadadorId: id }} 
              className="w-full lg:w-auto bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all text-center shadow-xl shadow-black/20"
            >
              Analizar Resultados
            </Link>
          </div>
        </div>
      )}

      {/* FILTROS DINÁMICOS */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-4 flex flex-col lg:flex-row items-center gap-4">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Filtrar por nombre del torneo..."
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
          />
        </div>
        
        <div className="hidden lg:block w-px h-10 bg-slate-100"></div>

        <div className="flex items-center w-full lg:w-auto bg-slate-50 lg:bg-transparent rounded-2xl px-4 lg:px-0">
          <Calendar size={20} className="text-slate-300 mr-3 ml-2 lg:ml-0" />
          <DatePicker
            selected={searchFecha}
            onChange={(date) => setSearchFecha(date)}
            maxDate={new Date()}
            placeholderText="Cualquier fecha"
            dateFormat="dd / MM / yyyy"
            showYearDropdown
            dropdownMode="select"
            className="bg-transparent border-none py-4 text-sm font-black text-slate-500 focus:ring-0 cursor-pointer w-full"
          />
        </div>

        <div className="hidden lg:block w-px h-10 bg-slate-100"></div>

        <div className="flex items-center w-full lg:w-auto bg-slate-50 lg:bg-transparent rounded-2xl px-4 lg:px-0">
          {orden === "desc" ? <SortDesc size={20} className="text-blue-600 mr-3 ml-2 lg:ml-0" /> : <SortAsc size={20} className="text-blue-600 mr-3 ml-2 lg:ml-0" />}
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="bg-transparent border-none py-4 text-[10px] font-black text-slate-500 focus:ring-0 cursor-pointer uppercase tracking-widest w-full"
          >
            <option value="desc">Más Recientes</option>
            <option value="asc">Más Antiguos</option>
          </select>
        </div>

        {(searchNombre || searchFecha) && (
          <button 
            onClick={() => { setSearchNombre(""); setSearchFecha(null) }} 
            className="flex items-center justify-center gap-2 w-full lg:w-auto p-4 text-red-500 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors font-black text-[10px] uppercase tracking-widest"
          >
            <XCircle size={18} /> Limpiar
          </button>
        )}
      </div>

      {/* FEED DE COMPETENCIAS */}
      <div className="grid grid-cols-1 gap-5">
        {competenciasProcesadas.length > 0 ? (
          competenciasProcesadas.map((c) => (
            <div key={c._id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-8 hover:-translate-y-1">
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">
                  <Trophy size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight italic">
                    {c.nombre}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded">
                       {new Date(c.fecha).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest flex items-center gap-1.5">
                      <Waves size={12} /> Piscina {c.piscina}m
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to={`/profesor/competencia/${c._id}/pruebas`}
                state={{ nadadorId: id }}
                className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-blue-600 shadow-xl shadow-slate-900/10 active:scale-95"
              >
                Analizar Pruebas
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
            <div className="p-6 bg-white rounded-full shadow-sm mb-6 text-slate-200">
               <Trophy size={48} />
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">No se registran eventos bajo este criterio</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompetenciasList