import { useState, useMemo, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { getCompetenciasPorNadador } from "../../api/competencias.api";
import { getPruebasPorCompetencia } from "../../api/pruebas.api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Trophy, Search, Calendar, Waves, Timer, 
  ChevronDown, Loader2, XCircle, SortAsc, 
  SortDesc, MapPin, Zap, ChevronRight
} from "lucide-react";

const MisCompetencias = () => {
  const [expandedComp, setExpandedComp] = useState(null);
  const [searchNombre, setSearchNombre] = useState("");
  const [searchFecha, setSearchFecha] = useState(null);
  const [orden, setOrden] = useState("desc");

  const { data: perfil } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => {
      const res = await api.get("/nadadores/perfil");
      return res.data;
    }
  });

  const { data: respCompetencias, isLoading: loadingComp } = useQuery({
    queryKey: ["misCompetencias", perfil?._id],
    queryFn: () => getCompetenciasPorNadador(perfil._id),
    enabled: !!perfil?._id,
  });

  const competencias = respCompetencias?.data || [];

  const competenciasProcesadas = useMemo(() => {
    let lista = [...competencias];
    if (searchNombre) {
      lista = lista.filter((c) => c.nombre.toLowerCase().includes(searchNombre.toLowerCase()));
    }
    if (searchFecha) {
      const fechaSel = searchFecha.toISOString().split("T")[0];
      lista = lista.filter((c) => new Date(c.fecha).toISOString().split("T")[0] === fechaSel);
    }
    lista.sort((a, b) => {
      const fechaA = new Date(a.fecha); const fechaB = new Date(b.fecha);
      return orden === "desc" ? fechaB - fechaA : fechaA - fechaB;
    });
    return lista;
  }, [competencias, searchNombre, searchFecha, orden]);

  if (loadingComp) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Sincronizando Marcas...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-blue-600 rounded-full" />
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Historial de Tiempos</p>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter italic uppercase leading-[0.85]">
            Mis <span className="text-blue-600">Marcas</span>
          </h2>
        </div>
        <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm self-start sm:self-auto min-w-[140px]">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center sm:text-left">Competencias</p>
          <p className="text-3xl font-black text-slate-900 italic text-center sm:text-left">{competencias.length}</p>
        </div>
      </div>

      {/* TOOLBAR RESPONSIVO */}
      <div className="bg-white/90 backdrop-blur-xl sticky top-4 z-40 rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-2 flex flex-col lg:flex-row items-center gap-2">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar evento..."
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 placeholder:text-slate-300 uppercase tracking-tight"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto p-1 sm:p-0">
          <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-1 w-full sm:w-auto border border-transparent focus-within:border-blue-100">
            <Calendar size={16} className="text-slate-400 shrink-0" />
            <DatePicker
              selected={searchFecha}
              onChange={(date) => setSearchFecha(date)}
              placeholderText="FECHA"
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              showYearDropdown
              dropdownMode="select"
              className="bg-transparent border-none py-2 text-[10px] font-black text-slate-600 focus:ring-0 cursor-pointer w-full sm:w-24 uppercase"
            />
          </div>

          <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-1 w-full sm:w-auto border border-transparent focus-within:border-blue-100">
            {orden === "desc" ? <SortDesc size={16} className="text-blue-600 shrink-0" /> : <SortAsc size={16} className="text-blue-600 shrink-0" />}
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="bg-transparent border-none py-2 text-[10px] font-black text-slate-600 focus:ring-0 cursor-pointer uppercase w-full sm:w-auto"
            >
              <option value="desc">MÁS RECIENTES</option>
              <option value="asc">MÁS ANTIGUAS</option>
            </select>
          </div>

          {(searchNombre || searchFecha) && (
            <button 
              onClick={() => { setSearchNombre(""); setSearchFecha(null) }} 
              className="w-full sm:w-auto p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all flex justify-center items-center gap-2 sm:gap-0"
            >
              <XCircle size={18} />
              <span className="sm:hidden text-[10px] font-black uppercase">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {competenciasProcesadas.length > 0 ? (
          competenciasProcesadas.map((c) => (
            <CompetenciaAcordeon 
              key={c._id} 
              competencia={c} 
              isExpanded={expandedComp === c._id}
              onToggle={() => setExpandedComp(expandedComp === c._id ? null : c._id)}
              perfilId={perfil?._id}
            />
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 mx-2">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
              <Search size={32} />
            </div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Sin resultados para la búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CompetenciaAcordeon = ({ competencia, isExpanded, onToggle, perfilId }) => {
  const { data: respPruebas, isLoading: loadingPruebas } = useQuery({
    queryKey: ["pruebasDetalle", competencia._id],
    queryFn: () => getPruebasPorCompetencia(competencia._id),
    enabled: isExpanded,
  });

  const pruebas = respPruebas?.data?.pruebas || [];

  return (
    <div className={`group bg-white rounded-[2rem] md:rounded-[3rem] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-200 shadow-xl' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}>
      <div 
        onClick={onToggle}
        className="p-5 md:p-8 lg:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
      >
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className={`shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${isExpanded ? 'bg-blue-600 text-white rotate-3 scale-110' : 'bg-slate-900 text-white'}`}>
            <Trophy size={24} className="md:size-7" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight italic uppercase tracking-tighter truncate">
              {competencia.nombre}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest">
                <Calendar size={10} /> {new Date(competencia.fecha).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Waves size={10} /> {competencia.piscina}M
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto md:gap-4 border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-500 text-[9px] font-black uppercase border border-slate-100 max-w-[180px] truncate">
            <MapPin size={12} className="text-blue-500 shrink-0" /> {competencia.lugar}
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 md:px-10 pb-8 animate-in slide-in-from-top-4 duration-500">
          <div className="h-px bg-slate-100 mb-8" />
          
          {loadingPruebas ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Obteniendo Tiempos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {pruebas
                .filter(p => (p.nadador?._id || p.nadador) === perfilId)
                .map((p) => (
                  <div key={p._id} className="bg-slate-50/50 rounded-[2rem] p-6 md:p-8 border border-slate-100 hover:border-blue-100 hover:bg-white transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                           <Zap size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                           <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.15em]">Official Mark</span>
                        </div>
                        <h4 className="text-2xl md:text-3xl font-black text-slate-900 italic uppercase tracking-tighter leading-none truncate">
                          {p.distancia}m <span className="text-blue-600">{p.estilo}</span>
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">FINAL</p>
                        <p className="text-3xl md:text-4xl font-black text-slate-900 tabular-nums italic leading-none">{p.tiempo}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Timer size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Parciales</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {p.parciales?.length > 0 ? (
                          p.parciales.map((par, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="text-[9px] font-black text-slate-300 w-8">{(idx + 1) * 50}M</span>
                              <div className="flex-1 h-10 bg-white rounded-xl flex items-center justify-between px-4 border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 italic">LAP {idx + 1}</span>
                                <span className="text-[11px] md:text-xs font-black text-blue-600 tabular-nums">{par.tiempo || par}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[9px] text-slate-300 font-bold italic py-2">Sin parciales registrados</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MisCompetencias;