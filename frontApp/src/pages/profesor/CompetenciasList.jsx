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
        className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] transition-all group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        Volver a la ficha
      </Link>
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic leading-[0.85] uppercase">
        Registro de <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">Competencias</span>
      </h2>
    </div>

    <Link
      to={`/profesor/nadador/${id}/competencias/nuevo`}
      className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-blue-200 group active:scale-95 shrink-0"
    >
      <Plus size={18} className="group-hover:rotate-90 transition-transform" />
      Nueva Competencia
    </Link>
  </div>
));

const HighlightCard = memo(({ destacada, id }) => {
  if (!destacada) return null;
  return (
    <div className="group relative overflow-hidden bg-slate-900 rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-12 text-white shadow-2xl transition-all duration-500 hover:shadow-blue-900/20">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none"></div>
      
      <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-4 min-w-0 flex-1 w-full">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <Trophy size={10} /> ultima registrada
            </span>
            <TrendingUp size={14} className="text-blue-400 animate-pulse" />
          </div>
          <h3 className="text-3xl md:text-4xl lg:text-6xl font-black italic tracking-tighter leading-[0.9] uppercase break-words">
            {destacada.nombre}
          </h3>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 shrink-0">
              <Calendar size={14} className="text-blue-400" /> 
              {new Date(destacada.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 shrink-0">
              <Waves size={14} className="text-blue-400" /> 
              Piscina {destacada.piscina}m
            </span>
          </div>
        </div>
        <Link 
          to={`/profesor/competencia/${destacada._id}/pruebas`} 
          state={{ nadadorId: id }} 
          className="w-full lg:w-auto bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all text-center shadow-lg shrink-0"
        >
          Analizar Resultados
        </Link>
      </div>
    </div>
  );
});

const CompetenciaCard = memo(({ c, id }) => (
  <div className="group bg-white p-5 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col md:flex-row justify-between items-center gap-6">
    <div className="flex items-center gap-4 lg:gap-6 w-full md:w-auto min-w-0">
      <div className="shrink-0 w-14 h-14 lg:w-16 lg:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
        <Trophy size={24} lg:size={28} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg lg:text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tighter truncate italic uppercase leading-none mb-2">
          {c.nombre}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase tracking-widest">
             {new Date(c.fecha).toLocaleDateString()}
          </span>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1">
            <Waves size={10} /> {c.piscina}m
          </span>
        </div>
      </div>
    </div>

    <Link
      to={`/profesor/competencia/${c._id}/pruebas`}
      state={{ nadadorId: id }}
      className="w-full md:w-auto flex items-center justify-center gap-4 bg-slate-900 text-white hover:bg-blue-600 px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 shrink-0"
    >
      Ver Pruebas
      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
        let matchesFecha = true;
        if (searchFecha) {
          const fechaComp = new Date(c.fecha);
          matchesFecha = 
            fechaComp.getFullYear() === searchFecha.getFullYear() &&
            fechaComp.getMonth() === searchFecha.getMonth();
        }
        return matchesNombre && matchesFecha;
      })
      .sort((a, b) => {
        const dateA = new Date(a.fecha).getTime();
        const dateB = new Date(b.getTime ? b.fecha : b.fecha).getTime();
        return orden === "desc" ? dateB - dateA : dateA - dateB;
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
    <div className="py-40 flex flex-col items-center justify-center space-y-4">
      <Loader2 size={48} className="animate-spin text-blue-600" />
      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Sincronizando</p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 lg:space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">
      
      <ListHeader id={id} />

      <HighlightCard destacada={destacada} id={id} />

      {/* FILTROS OPTIMIZADOS PARA 700px - 1100px */}
      <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-3 lg:p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600/30" size={20} />
          <input
            type="text"
            placeholder="Buscar competencia..."
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-4">
          <div className="flex items-center bg-slate-50 rounded-2xl px-5 border border-transparent focus-within:border-blue-100 transition-all">
            <Calendar size={18} className="text-blue-400 mr-3 shrink-0" />
            <DatePicker
              selected={searchFecha}
              onChange={(date) => setSearchFecha(date)}
              maxDate={new Date()}
              placeholderText="MES / AÑO"
              dateFormat="MM/yyyy"
              showMonthYearPicker 
              className="bg-transparent border-none py-4 text-[11px] font-black text-slate-600 focus:ring-0 cursor-pointer w-full uppercase tracking-tighter"
            />
          </div>

          <div className="flex items-center bg-slate-900 text-white rounded-2xl px-5">
            {orden === "desc" ? <SortDesc size={18} className="text-blue-400 mr-3 shrink-0" /> : <SortAsc size={18} className="text-blue-400 mr-3 shrink-0" />}
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="bg-transparent border-none py-4 text-[11px] font-black text-white focus:ring-0 cursor-pointer uppercase tracking-widest w-full"
            >
              <option value="desc" className="text-slate-900">Recientes</option>
              <option value="asc" className="text-slate-900">Antiguos</option>
            </select>
          </div>

          {(searchNombre || searchFecha) && (
            <button 
              onClick={resetFilters} 
              className="sm:col-span-2 lg:col-span-1 flex items-center justify-center gap-2 px-6 py-4 text-orange-500 bg-orange-50 hover:bg-orange-500 hover:text-white rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest"
            >
              <XCircle size={18} /> Borrar
            </button>
          )}
        </div>
      </div>

      {/* FEED DE COMPETENCIAS */}
      <section className="grid grid-cols-1 gap-4 lg:gap-6">
        {competenciasProcesadas.length > 0 ? (
          competenciasProcesadas.map((c) => (
            <CompetenciaCard key={c._id} c={c} id={id} />
          ))
        ) : (
          <div className="text-center py-20 lg:py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-50 flex flex-col items-center">
             <Trophy size={48} className="text-slate-100 mb-4" />
             <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest">Sin resultados</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CompetenciasList;