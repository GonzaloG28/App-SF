import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCompetenciasPorNadador } from "../../api/competencias.api";
import { useState, useMemo, memo, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Trophy, Search, Calendar, ArrowLeft, 
  Plus, Loader2, Waves, SortAsc, 
  SortDesc, ChevronRight, XCircle, TrendingUp
} from "lucide-react";

// --- COMPONENTES ATÓMICOS MEMOIZADOS ---

const ListHeader = memo(({ id }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
    <div className="space-y-4">
      <Link 
        to={`/profesor/nadador/${id}`} 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[9px] uppercase tracking-[0.2em] transition-all group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        Volver a la ficha
      </Link>
      <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic leading-none">
        Bitácora de <span className="text-blue-600 block md:inline">Torneos</span>
      </h2>
    </div>

    <Link
      to={`/profesor/nadador/${id}/competencias/nuevo`}
      className="flex items-center justify-center gap-3 bg-[#0f172a] hover:bg-blue-600 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 group active:scale-95"
    >
      <Plus size={18} className="group-hover:rotate-90 transition-transform" />
      Nueva Competencia
    </Link>
  </div>
));

const HighlightCard = memo(({ destacada, id }) => {
  if (!destacada) return null;
  return (
    <div className="group relative overflow-hidden bg-[#0f172a] rounded-[3rem] p-8 md:p-12 text-white shadow-2xl transition-all duration-500 hover:shadow-blue-900/20">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px] -mr-40 -mt-40"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">
              Actuación Reciente
            </span>
            <TrendingUp size={14} className="text-emerald-400 animate-pulse" />
          </div>
          <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-tight uppercase">
            {destacada.nombre}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Calendar size={14} className="text-blue-400" /> 
              {new Date(destacada.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Waves size={14} className="text-blue-400" /> 
              Piscina {destacada.piscina}m
            </span>
          </div>
        </div>
        <Link 
          to={`/profesor/competencia/${destacada._id}/pruebas`} 
          state={{ nadadorId: id }} 
          className="w-full lg:w-auto bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all text-center"
        >
          Analizar Resultados
        </Link>
      </div>
    </div>
  );
});

const CompetenciaCard = memo(({ c, id }) => (
  <div className="group bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col sm:flex-row justify-between items-center gap-6">
    <div className="flex items-center gap-6 w-full sm:w-auto">
      <div className="shrink-0 w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
        <Trophy size={24} />
      </div>
      <div className="min-w-0">
        <h3 className="text-lg md:text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight truncate italic uppercase">
          {c.nombre}
        </h3>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
             {new Date(c.fecha).toLocaleDateString()}
          </span>
          <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest flex items-center gap-1">
            <Waves size={10} /> {c.piscina}m
          </span>
        </div>
      </div>
    </div>

    <Link
      to={`/profesor/competencia/${c._id}/pruebas`}
      state={{ nadadorId: id }}
      className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-50 text-slate-600 group-hover:bg-slate-900 group-hover:text-white px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all"
    >
      Ver Pruebas
      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
    </Link>
  </div>
));

const CompetenciasList = () => {
  const { id } = useParams();
  const [searchNombre, setSearchNombre] = useState("");
  const [searchFecha, setSearchFecha] = useState(null);
  const [orden, setOrden] = useState("desc");

  const { data, isLoading } = useQuery({
    queryKey: ["competencias", id],
    queryFn: () => getCompetenciasPorNadador(id),
    staleTime: 1000 * 60 * 5,
  });

  const competencias = data?.data || [];

  const competenciasProcesadas = useMemo(() => {
    return [...competencias]
      .filter((c) => {
        const matchesNombre = c.nombre.toLowerCase().includes(searchNombre.toLowerCase());
        const matchesFecha = !searchFecha || 
          new Date(c.fecha).toDateString() === searchFecha.toDateString();
        return matchesNombre && matchesFecha;
      })
      .sort((a, b) => {
        const diff = new Date(a.fecha) - new Date(b.fecha);
        return orden === "desc" ? -diff : diff;
      });
  }, [competencias, searchNombre, searchFecha, orden]);

  const destacada = useMemo(() => {
    if (!competencias.length) return null;
    return [...competencias].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
  }, [competencias]);

  const resetFilters = useCallback(() => {
    setSearchNombre("");
    setSearchFecha(null);
  }, []);

  if (isLoading) return (
    <div className="py-40 flex flex-col items-center justify-center text-slate-400">
      <div className="relative mb-6">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <Trophy size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-200" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.4em] animate-pulse">Cargando Cronología</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 md:px-0">
      
      <ListHeader id={id} />

      <HighlightCard destacada={destacada} id={id} />

      {/* BARRA DE FILTROS */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-3 flex flex-col lg:flex-row items-center gap-3">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center w-full lg:w-auto gap-3">
          <div className="flex items-center w-full sm:w-auto bg-slate-50 rounded-xl px-4 relative">
            <Calendar size={18} className="text-slate-300 mr-2" />
            <DatePicker
              selected={searchFecha}
              onChange={(date) => setSearchFecha(date)}
              maxDate={new Date()}
              placeholderText="Cualquier fecha"
              dateFormat="dd/MM/yyyy"
              showYearDropdown
              dropdownMode="select"
              className="bg-transparent border-none py-3.5 text-[11px] font-black text-slate-500 focus:ring-0 cursor-pointer w-full"
            />
          </div>

          <div className="flex items-center w-full sm:w-auto bg-slate-50 rounded-xl px-4">
            {orden === "desc" ? <SortDesc size={18} className="text-blue-600 mr-2" /> : <SortAsc size={18} className="text-blue-600 mr-2" />}
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="bg-transparent border-none py-3.5 text-[10px] font-black text-slate-500 focus:ring-0 cursor-pointer uppercase tracking-widest w-full"
            >
              <option value="desc">Recientes</option>
              <option value="asc">Antiguos</option>
            </select>
          </div>

          {(searchNombre || searchFecha) && (
            <button 
              onClick={resetFilters} 
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>

      {/* FEED DE COMPETENCIAS */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {competenciasProcesadas.length > 0 ? (
          competenciasProcesadas.map((c) => (
            <CompetenciaCard key={c._id} c={c} id={id} />
          ))
        ) : (
          <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
            <div className="p-5 bg-white rounded-full shadow-sm mb-4 text-slate-200">
               <Trophy size={40} />
            </div>
            <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.3em]">Sin registros encontrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetenciasList;